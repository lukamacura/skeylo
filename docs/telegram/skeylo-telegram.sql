-- =====================================================================
-- Skeylo OS → Telegram (preko n8n)
--
-- Baza odlučuje ŠTA i KADA se javlja, n8n samo dostavlja poruke.
-- Sve je dodatno: nova šema `tg`, nova kolona os.people.tg_user_id,
-- dva nova triggera. Postojeći OS kod ne zna za ovo i ne mora da se menja.
--
--   os.docs (tasks, leads)  ──trigger──┐
--   public.skeylo_leads     ──trigger──┤
--   pg_cron svakih 5 min (tg.tick) ────┼──► tg.out (sanduče) ──pg_net──► n8n "Pošalji" ──► Telegram grupa
--                                      │
--   Telegram dugme/komanda ──► n8n "Dugmići" ──► os.tg_in() ─┘
--
-- Podešavanja su u tg.cfg (webhook_url, group_chat_id, secret, link_code …).
-- Ponovno pokretanje fajla je bezbedno (create or replace / if not exists).
-- =====================================================================

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create schema if not exists tg;
revoke all on schema tg from public, anon, authenticated;

-- Telegram nalog člana tima (popunjava se komandom /ja ime u grupi)
alter table os.people add column if not exists tg_user_id bigint unique;

-- ---------------------------------------------------------------------
-- Tabele
-- ---------------------------------------------------------------------
create table if not exists tg.cfg (
  k text primary key,
  v text not null
);

-- sanduče: svaka poruka prvo ide ovde (bez duplikata, sa ponovnim slanjem)
create table if not exists tg.out (
  id         bigint generated always as identity primary key,
  key        text not null unique,          -- npr. task:abc, brief:2026-11-06
  kind       text not null,                 -- task, event, lead, web, comment, brief, week, cmd
  chat_id    bigint,                        -- null = timska grupa
  text       text not null,                 -- gotov HTML za Telegram
  task_id    text,                          -- ima vrednost → poruka dobija ✅/⏰ dugmiće
  silent     boolean not null default false,
  created_at timestamptz not null default now(),
  tries      int not null default 0,
  try_at     timestamptz,
  req_id     bigint,                        -- pg_net zahtev u toku
  sent_at    timestamptz,
  err        text
);
create index if not exists out_unsent on tg.out (created_at) where sent_at is null;

-- već obrađene stvari koje nemaju svoju poruku (npr. pojedinačni komentari)
create table if not exists tg.seen (
  key text primary key,
  at  timestamptz not null default now()
);

alter table tg.cfg enable row level security;
alter table tg.out enable row level security;
alter table tg.seen enable row level security;
revoke all on all tables in schema tg from public, anon, authenticated;

insert into tg.cfg (k, v) values
  ('secret',     replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  ('link_code',  upper(left(replace(gen_random_uuid()::text, '-', ''), 6))),
  ('os_url',     'https://www.skeylo.com/os'),
  ('site_url',   'https://www.skeylo.com'),
  ('brief_hour', '8'),            -- jutarnji pregled u 08:00
  ('brief_days', '1,2,3,4,5'),    -- pon–pet (1 = ponedeljak … 7 = nedelja)
  ('week_dow',   '1'),            -- nedeljni pregled ponedeljkom
  ('week_hour',  '9'),            -- u 09:00
  ('quiet_from', '22'),           -- od 22h do 8h poruke stižu bez zvuka
  ('quiet_to',   '8'),
  ('buttons',    'off')          -- 'on' = ✅/⏰ dugmići na task porukama
on conflict (k) do nothing;
-- webhook_url i group_chat_id se dodaju kad je n8n spreman (vidi README)

-- ---------------------------------------------------------------------
-- Pomoćne funkcije
-- ---------------------------------------------------------------------
create or replace function tg.c(p_k text) returns text
language sql stable security definer set search_path = '' as $$
  select v from tg.cfg where k = p_k
$$;

-- HTML escape za Telegram parse_mode=HTML
create or replace function tg.h(t text) returns text
language sql immutable set search_path = '' as $$
  select replace(replace(replace(coalesce(t, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
$$;

-- isto, ali prazno → null (za opcione delove poruke)
create or replace function tg.hn(t text) returns text
language sql immutable set search_path = '' as $$
  select nullif(tg.h(btrim(coalesce(t, ''))), '')
$$;

create or replace function tg.cut(t text, n int) returns text
language sql immutable set search_path = '' as $$
  select case
    when length(regexp_replace(coalesce(t, ''), '\s+', ' ', 'g')) > n
      then rtrim(left(regexp_replace(t, '\s+', ' ', 'g'), n - 1)) || '…'
    else btrim(regexp_replace(coalesce(t, ''), '\s+', ' ', 'g'))
  end
$$;

create or replace function tg.lnow() returns timestamp
language sql stable set search_path = '' as $$
  select now() at time zone 'Europe/Belgrade'
$$;

create or replace function tg.today() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Europe/Belgrade')::date
$$;

create or replace function tg.todate(t text) returns date
language plpgsql stable set search_path = '' as $$
begin
  return nullif(btrim(t), '')::date;
exception when others then
  return null;
end $$;

-- OS čuva početak eventa kao lokalno vreme bez zone: 2026-11-10T11:00
create or replace function tg.tots(t text) returns timestamp
language plpgsql stable set search_path = '' as $$
begin
  return nullif(btrim(t), '')::timestamp;
exception when others then
  return null;
end $$;

-- OS čuva createdAt/doneAt kao Date.now() (milisekunde)
create or replace function tg.ms(t text) returns timestamptz
language plpgsql stable set search_path = '' as $$
begin
  return to_timestamp(nullif(btrim(t), '')::double precision / 1000);
exception when others then
  return null;
end $$;

create or replace function tg.isdone(d jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(d->>'done', '') in ('true', '1')
$$;

create or replace function tg.arr(j jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(j) = 'array' then j else '[]'::jsonb end
$$;

-- "čet 6.11."
create or replace function tg.d(p date) returns text
language sql immutable set search_path = '' as $$
  select (array['ned','pon','uto','sre','čet','pet','sub'])[extract(dow from p)::int + 1]
         || ' ' || extract(day from p)::int || '.' || extract(month from p)::int || '.'
$$;

-- "četvrtak, 6. novembar"
create or replace function tg.dlong(p date) returns text
language sql immutable set search_path = '' as $$
  select (array['nedelja','ponedeljak','utorak','sreda','četvrtak','petak','subota'])[extract(dow from p)::int + 1]
         || ', ' || extract(day from p)::int || '. '
         || (array['januar','februar','mart','april','maj','jun','jul','avgust','septembar','oktobar','novembar','decembar'])[extract(month from p)::int]
$$;

create or replace function tg.mesec(p date) returns text
language sql immutable set search_path = '' as $$
  select (array['januaru','februaru','martu','aprilu','maju','junu','julu','avgustu','septembru','oktobru','novembru','decembru'])[extract(month from p)::int]
$$;

-- rok u odnosu na danas: "danas", "sutra", "kasni 2 dana", "pet 14.11."
create or replace function tg.due(p date) returns text
language sql stable set search_path = '' as $$
  select case
    when p is null then 'bez roka'
    when p = tg.today() then 'rok danas'
    when p = tg.today() + 1 then 'rok sutra'
    when p < tg.today() then 'kasni ' || (tg.today() - p) || case when tg.today() - p = 1 then ' dan' else ' dana' end
    else 'rok ' || tg.d(p)
  end
$$;

create or replace function tg.rsd(x numeric) returns text
language sql immutable set search_path = '' as $$
  select replace(to_char(round(coalesce(x, 0)), 'FM999,999,999,990'), ',', '.') || ' RSD'
$$;

-- ime člana tima; ako je povezan sa Telegramom, tag (dobija notifikaciju)
create or replace function tg.who(p_slug text) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select case
       when p.tg_user_id is not null
         then '<a href="tg://user?id=' || p.tg_user_id || '">' || tg.h(p.name) || '</a>'
       else '<b>' || tg.h(p.name) || '</b>'
     end
     from os.people p where p.slug = p_slug),
    '<b>' || tg.h(coalesce(p_slug, '?')) || '</b>')
$$;

create or replace function tg.whos(j jsonb) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(string_agg(tg.who(x), ', ' order by o), '—')
  from jsonb_array_elements_text(tg.arr(j)) with ordinality t(x, o)
$$;

create or replace function tg.name(p_slug text) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.name from os.people p where p.slug = p_slug), p_slug)
$$;

create or replace function tg.client(p_id text) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when coalesce(p_id, '') in ('', 'skeylo') then null
    else (select d.data->>'name' from os.docs d where d.col = 'clients' and d.id = p_id)
  end
$$;

-- Telegram prima do 4096 znakova; sečemo na kraju reda da ne prekinemo HTML tag
create or replace function tg.fit(t text) returns text
language sql immutable set search_path = '' as $$
  select case
    when length(t) <= 4000 then t
    when position(E'\n' in left(t, 3900)) = 0 then left(t, 3900)
    else left(t, 3900 - position(E'\n' in reverse(left(t, 3900)))) || E'\n…'
  end
$$;

-- ---------------------------------------------------------------------
-- Slanje
-- ---------------------------------------------------------------------
create or replace function tg.send(p_id bigint) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r   tg.out;
  url text := tg.c('webhook_url');
  grp text := tg.c('group_chat_id');
  rid bigint;
begin
  if coalesce(url, '') = '' then return; end if;            -- n8n još nije podešen: čeka u sandučetu
  select * into r from tg.out where id = p_id and sent_at is null;
  if not found then return; end if;
  if r.chat_id is null and coalesce(grp, '') = '' then return; end if;  -- grupa još nije povezana

  rid := net.http_post(
    url := url,
    body := jsonb_build_object(
      'id',      r.id,
      'kind',    r.kind,
      'chat_id', coalesce(r.chat_id, grp::bigint),
      'text',    r.text,
      -- dugmići ✅/⏰ samo kad je tg.cfg buttons = 'on' (treba i n8n workflow "Dugmići")
      'task_id', case when tg.c('buttons') = 'on' then coalesce(r.task_id, '') else '' end,
      'silent',  r.silent
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-skeylo-secret', tg.c('secret')
    ),
    timeout_milliseconds := 20000
  );
  update tg.out set req_id = rid, tries = tries + 1, try_at = now() where id = r.id;
end $$;

-- upiši poruku u sanduče i odmah je pošalji (isti key = ista poruka, nikad dvaput)
create or replace function tg.push(
  p_key text, p_kind text, p_text text,
  p_task text default null, p_chat bigint default null, p_silent boolean default null
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  hr  int := extract(hour from tg.lnow())::int;
  qf  int := coalesce(nullif(tg.c('quiet_from'), '')::int, 22);
  qt  int := coalesce(nullif(tg.c('quiet_to'), '')::int, 8);
  nid bigint;
begin
  if coalesce(p_text, '') = '' then return null; end if;
  insert into tg.out (key, kind, chat_id, text, task_id, silent)
  values (p_key, p_kind, p_chat, tg.fit(p_text), nullif(p_task, ''),
          coalesce(p_silent, hr >= qf or hr < qt))
  on conflict (key) do nothing
  returning id into nid;
  if nid is not null then perform tg.send(nid); end if;
  return nid;
end $$;

-- potvrde od n8n-a (preko pg_net odgovora) i ponovno slanje neuspelih
create or replace function tg.reconcile() returns void
language plpgsql security definer set search_path = '' as $$
declare q record;
begin
  update tg.out o set sent_at = r.created, err = null
  from net._http_response r
  where o.sent_at is null and o.req_id = r.id and r.status_code between 200 and 299;

  update tg.out o set req_id = null,
         err = left(coalesce(r.error_msg, 'HTTP ' || r.status_code || ': ' || coalesce(r.content, '')), 500)
  from net._http_response r
  where o.sent_at is null and o.req_id = r.id and not coalesce(r.status_code between 200 and 299, false);

  update tg.out o set req_id = null, err = coalesce(o.err, 'nema odgovora')
  where o.sent_at is null and o.req_id is not null and o.try_at < now() - interval '10 minutes'
    and not exists (select 1 from net._http_response r where r.id = o.req_id);

  -- do 5 pokušaja, i samo za sveže poruke (stari podsetnik nema smisla)
  for q in
    select id from tg.out
    where sent_at is null and req_id is null and tries < 5 and created_at > now() - interval '3 hours'
    order by id limit 30
  loop
    perform tg.send(q.id);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Odmah: taskovi i eventi
-- ---------------------------------------------------------------------
create or replace function tg.on_task(p_op text, o jsonb, n jsonb, p_id text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  kind  text := coalesce(n->>'kind', 'none');
  actor text := os.my_slug();
  asg   jsonb := tg.arr(n->'assignees');
  prev  jsonb := case when p_op = 'UPDATE' then tg.arr(o->'assignees') else '[]'::jsonb end;
  added jsonb;
  cl    text := tg.client(n->>'clientId');
  st    timestamp := tg.tots(n->>'start');
  en    timestamp := tg.tots(n->>'end');
  ttl   text := tg.h(tg.cut(coalesce(nullif(btrim(n->>'title'), ''), 'Bez naslova'), 200));
  head  text;
  body  text;
  k     text;
begin
  if tg.isdone(n) then return; end if;

  select coalesce(jsonb_agg(x order by i), '[]'::jsonb) into added
  from jsonb_array_elements_text(asg) with ordinality t(x, i)
  where not (prev ? x);

  -- javljamo samo kad je neko NOV na tasku, i ne kad je neko sam sebe dodao
  if not exists (select 1 from jsonb_array_elements_text(added) x where x is distinct from actor) then
    return;
  end if;

  if kind = 'event' then
    body := '🕐 ' || coalesce(
      tg.d(st::date) || ' u ' || to_char(st, 'HH24:MI')
        || case when en > st then '–' || to_char(en, 'HH24:MI') else '' end,
      'bez termina');
    head := '📅 <b>Novi event</b>';
  else
    body := '📅 ' || tg.due(tg.todate(n->>'due'));
    head := '📌 <b>Novi task</b>';
  end if;

  if p_op = 'UPDATE' then
    head := '➕ <b>Dodato na ' || case when kind = 'event' then 'event' else 'task' end || '</b>: ' || tg.whos(added);
    k := 'task:' || p_id || ':+' || (select string_agg(x, ',' order by x) from jsonb_array_elements_text(added) x);
  else
    k := 'task:' || p_id;
  end if;

  perform tg.push(k, case when kind = 'event' then 'event' else 'task' end,
    head || coalesce(' · ' || tg.hn(cl), '')
      || E'\n' || ttl
      || E'\n' || body || ' · 👤 ' || tg.whos(asg)
      || coalesce(E'\n<i>— ' || tg.hn(tg.name(actor)) || '</i>', ''),
    case when kind = 'event' then null else p_id end);
end $$;

-- ---------------------------------------------------------------------
-- Odmah: leadovi u OS-u (Lead Manager)
-- ---------------------------------------------------------------------
create or replace function tg.on_lead(p_op text, o jsonb, n jsonb, p_id text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  actor text := os.my_slug();
  st    text := coalesce(n->>'stage', 'new');
  nm    text := tg.h(tg.cut(coalesce(nullif(btrim(n->>'name'), ''), 'Bez imena'), 120));
  lnk   text := ' · <a href="' || tg.h(tg.c('os_url') || '#l-' || p_id) || '">otvori</a>';
  by_   text := coalesce(E'\n<i>— ' || tg.hn(tg.name(actor)) || '</i>', '');
begin
  if p_op = 'INSERT' then
    perform tg.push('lead:' || p_id, 'lead',
      '🧲 <b>Nov lead</b>: ' || nm || lnk
        || coalesce(E'\n' || nullif(concat_ws(' · ', tg.hn(n->>'instagram'), tg.hn(n->>'phone'), tg.hn(n->>'email')), ''), '')
        || by_);
  elsif st is distinct from coalesce(o->>'stage', 'new') and st in ('meet', 'nego', 'closed', 'rejected') then
    perform tg.push('lead:' || p_id || ':' || st, 'lead',
      case st
        when 'meet'   then '🤝 <b>Zakazan sastanak</b>: '
        when 'nego'   then '💬 <b>Pregovori</b>: '
        when 'closed' then '🎉 <b>Zatvoren deal!</b> '
        else               '✖️ <b>Lead odbijen</b>: '
      end || nm || lnk
        || case when st = 'meet' then coalesce(E'\n' || tg.hn(tg.cut(n->>'nextStep', 150)), '') else '' end
        || by_);
  end if;
end $$;

-- trigger na os.docs; greška ovde NIKAD ne sme da blokira snimanje u OS-u
create or replace function tg.on_doc() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  begin
    if new.col = 'tasks' then
      perform tg.on_task(tg_op, case when tg_op = 'UPDATE' then old.data end, new.data, new.id);
    elsif new.col = 'leads' then
      perform tg.on_lead(tg_op, case when tg_op = 'UPDATE' then old.data end, new.data, new.id);
    end if;
  exception when others then
    raise warning 'tg.on_doc %/%: %', new.col, new.id, sqlerrm;
  end;
  return null;
end $$;

drop trigger if exists docs_tg on os.docs;
create trigger docs_tg
  after insert or update on os.docs
  for each row
  when (new.col in ('tasks', 'leads'))
  execute function tg.on_doc();

-- ---------------------------------------------------------------------
-- Odmah: upit sa sajta (kvizovi, kalkulatori → public.skeylo_leads)
-- ---------------------------------------------------------------------
create or replace function tg.on_web_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  d  jsonb := coalesce(new.data, '{}'::jsonb);
  nm text;
begin
  begin
    nm := coalesce(nullif(btrim(new.name), ''), nullif(btrim(d->>'name'), ''), 'Bez imena');
    perform tg.push('web:' || new.id, 'web',
      '🌐 <b>Novi upit sa sajta</b>' || coalesce(' · ' || tg.hn(new.type), '')
        || E'\n' || tg.h(tg.cut(nm, 120))
        || coalesce(' · ' || tg.hn(tg.cut(coalesce(nullif(new.brand, ''), nullif(d->>'brand', ''), nullif(d->>'company', '')), 80)), '')
        || coalesce(E'\n' || nullif(concat_ws(' · ',
             tg.hn(coalesce(nullif(new.phone, ''), d->>'phone')),
             tg.hn(coalesce(nullif(new.contact, ''), d->>'email'))), ''), '')
        || E'\n<a href="' || tg.h(tg.c('site_url') || '/admin') || '">otvori u adminu</a>');
  exception when others then
    raise warning 'tg.on_web_lead %: %', new.id, sqlerrm;
  end;
  return null;
end $$;

drop trigger if exists skeylo_leads_tg on public.skeylo_leads;
create trigger skeylo_leads_tg
  after insert on public.skeylo_leads
  for each row
  execute function tg.on_web_lead();

-- ---------------------------------------------------------------------
-- Svakih 5 min: komentari klijenata iz CRM-a
-- (čekamo 2 min mira pa šaljemo JEDNU poruku po skripti/kreativi)
-- ---------------------------------------------------------------------
create or replace function tg.scan_comments() returns void
language plpgsql security definer set search_path = '' as $$
declare
  g     record;
  it    jsonb;
  cnt   int;
  lines text;
  ttl   text;
  link  text;
  cl    text;
  base  text := tg.c('os_url');
begin
  for g in
    select d.col,
           coalesce(d.data->>'scriptId', d.data->>'creativeId') as target,
           max(d.data->>'clientId') as client_id,
           max(d.data->>'monthId') as month_id,
           array_agg('c:' || d.col || ':' || d.id order by d.updated_at) as keys,
           jsonb_agg(jsonb_build_object('t', d.data->>'text', 'q', d.data->>'quote', 'a', d.data->>'authorName')
                     order by d.updated_at) as items
    from os.docs d
    where d.col in ('comments', 'creativeComments')
      and d.data->>'author' = 'client'
      and coalesce(d.data->>'resolved', 'false') <> 'true'
      and d.updated_at > now() - interval '2 days'
      and not exists (select 1 from tg.seen s where s.key = 'c:' || d.col || ':' || d.id)
    group by 1, 2
    having max(d.updated_at) < now() - interval '2 minutes'
  loop
    cnt := jsonb_array_length(g.items);
    cl := coalesce(tg.client(g.client_id), 'Klijent');
    lines := '';
    for it in select value from jsonb_array_elements(g.items) with ordinality t(value, o) where o <= 5 loop
      lines := lines || E'\n• „' || tg.h(tg.cut(it->>'t', 220)) || '“'
        || coalesce(' <i>(na: „' || tg.hn(tg.cut(it->>'q', 60)) || '“)</i>', '');
    end loop;
    if cnt > 5 then lines := lines || E'\n<i>+ još ' || (cnt - 5) || '</i>'; end if;

    if g.col = 'comments' then
      ttl := (select d.data->>'title' from os.docs d where d.col = 'scripts' and d.id = g.target);
      link := base || '#s-' || g.target;
    else
      ttl := (select d.data->>'title' from os.docs d where d.col = 'creatives' and d.id = g.target);
      link := base || '#fc-' || coalesce(g.month_id, '') || '.' || g.target;
    end if;

    insert into tg.seen (key) select unnest(g.keys) on conflict do nothing;
    perform tg.push('cm:' || md5(array_to_string(g.keys, ',')), 'comment',
      case when g.col = 'comments' then '💬 ' else '🎬 ' end
        || '<b>' || tg.h(cl) || '</b> · ' || cnt || case when cnt = 1 then ' komentar' else ' komentara' end
        || case when g.col = 'comments' then ' na skriptu' else ' na kreativu' end
        || coalesce(E'\n<i>' || tg.hn(tg.cut(ttl, 120)) || '</i>', '')
        || lines
        || coalesce(E'\n— ' || tg.hn(g.items->0->>'a'), '')
        || E'\n<a href="' || tg.h(link) || '">Otvori u OS-u</a>');
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Svakih 5 min: event počinje za ≤ 60 min
-- ---------------------------------------------------------------------
create or replace function tg.scan_events() returns void
language plpgsql security definer set search_path = '' as $$
declare
  r    record;
  ln   timestamp := tg.lnow();
  mins int;
begin
  for r in
    select d.id, d.data, tg.tots(d.data->>'start') as st, tg.tots(d.data->>'end') as en
    from os.docs d
    where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
      and tg.tots(d.data->>'start') > ln
      and tg.tots(d.data->>'start') <= ln + interval '60 minutes'
  loop
    mins := greatest(5, (round(extract(epoch from (r.st - ln)) / 300) * 5)::int);
    perform tg.push('ev:' || r.id || ':' || (r.data->>'start'), 'event',
      '⏰ <b>Za ' || mins || ' min</b>: ' || tg.h(tg.cut(coalesce(nullif(btrim(r.data->>'title'), ''), 'Event'), 200))
        || coalesce(' · ' || tg.hn(tg.client(r.data->>'clientId')), '')
        || E'\n🕐 ' || to_char(r.st, 'HH24:MI') || case when r.en > r.st then '–' || to_char(r.en, 'HH24:MI') else '' end
        || ' · 👤 ' || tg.whos(r.data->'assignees'));
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Jutarnji pregled (i komanda /danas)
-- ---------------------------------------------------------------------
create or replace function tg.brief(p date) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  per  record;
  t    record;
  res  text := case when extract(hour from tg.lnow()) < 12 then '☀️ <b>Dobro jutro, tim!</b> ' else '📋 <b>Danas</b> · ' end
               || tg.dlong(p);
  sec  text;
  n    int;
  any_ boolean := false;
begin
  for per in select slug from os.people order by created_at loop
    sec := '';
    n := 0;
    for t in
      select d.data, tg.todate(d.data->>'due') as due
      from os.docs d
      where d.col = 'tasks' and not tg.isdone(d.data) and coalesce(d.data->>'kind', 'none') <> 'event'
        and tg.arr(d.data->'assignees') ? per.slug
        and tg.todate(d.data->>'due') <= p
      order by 2, d.data->>'title'
    loop
      n := n + 1;
      if n <= 12 then
        sec := sec || E'\n' || case when t.due < p then '🔴 ' else '📌 ' end
          || tg.h(tg.cut(t.data->>'title', 120))
          || coalesce(' · ' || tg.hn(tg.client(t.data->>'clientId')), '')
          || case when t.due < p then ' — <i>kasni ' || (p - t.due) || ' d</i>' else '' end;
      end if;
    end loop;
    if n > 12 then sec := sec || E'\n<i>+ još ' || (n - 12) || '</i>'; end if;

    for t in
      select d.data, tg.tots(d.data->>'start') as st, tg.tots(d.data->>'end') as en
      from os.docs d
      where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
        and tg.arr(d.data->'assignees') ? per.slug
        and tg.tots(d.data->>'start')::date = p
      order by 2
    loop
      sec := sec || E'\n📅 ' || to_char(t.st, 'HH24:MI')
        || case when t.en > t.st then '–' || to_char(t.en, 'HH24:MI') else '' end
        || ' ' || tg.h(tg.cut(t.data->>'title', 120))
        || coalesce(' · ' || tg.hn(tg.client(t.data->>'clientId')), '');
    end loop;

    if sec <> '' then
      res := res || E'\n\n' || tg.who(per.slug) || sec;
      any_ := true;
    end if;
  end loop;

  if not any_ then res := res || E'\n\n✨ Danas nema rokova ni eventa.'; end if;

  sec := '';
  for t in
    select d.data, tg.todate(d.data->>'nextDate') as nd
    from os.docs d
    where d.col = 'leads' and coalesce(d.data->>'stage', 'new') not in ('closed', 'rejected')
      and tg.todate(d.data->>'nextDate') <= p
    order by 2 limit 10
  loop
    sec := sec || E'\n• ' || tg.h(tg.cut(t.data->>'name', 60))
      || coalesce(': ' || tg.hn(tg.cut(t.data->>'nextStep', 100)), '')
      || case when t.nd < p then ' — <i>kasni ' || (p - t.nd) || ' d</i>' else '' end;
  end loop;
  if sec <> '' then res := res || E'\n\n🧲 <b>Follow-up leadova</b>' || sec; end if;

  sec := '';
  for t in
    select f.broj, f.ukupno, f.rok_placanja, coalesce(f.kupac_snapshot->>'naziv', k.naziv) as kupac
    from os.fakture f left join os.klijenti k on k.id = f.klijent_id
    where f.status = 'izdata' and f.storno_za_fakturu_id is null and f.rok_placanja < p
    order by f.rok_placanja limit 10
  loop
    sec := sec || E'\n• ' || tg.h(t.broj) || ' · ' || tg.h(tg.cut(t.kupac, 60)) || ' · ' || tg.rsd(t.ukupno)
      || ' — <i>kasni ' || (p - t.rok_placanja) || ' d</i>';
  end loop;
  if sec <> '' then res := res || E'\n\n💸 <b>Fakture van roka</b>' || sec; end if;

  return res || E'\n\n<a href="' || tg.h(tg.c('os_url') || '#tasks') || '">Otvori taskove u OS-u</a>';
end $$;

-- ---------------------------------------------------------------------
-- Nedeljni pregled (ponedeljkom, i komanda /nedelja)
-- ---------------------------------------------------------------------
create or replace function tg.week(p date) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  a  timestamptz := (p - 7)::timestamp at time zone 'Europe/Belgrade';
  b  timestamptz := p::timestamp at time zone 'Europe/Belgrade';
  m0 date := date_trunc('month', p)::date;
  done_n int; done_by text; open_n int; late_n int; due_n int; ev_n int;
  l_new int; l_open int; l_won int; web_n int;
  u_n int; u_sum numeric; ul_n int; ul_sum numeric; inv_sum numeric; paid_sum numeric;
  res text;
begin
  select count(*) into done_n from os.docs d
  where d.col = 'tasks' and tg.isdone(d.data) and tg.ms(d.data->>'doneAt') >= a and tg.ms(d.data->>'doneAt') < b;

  select string_agg(tg.h(tg.name(s)) || ' ' || c, ' · ' order by c desc) into done_by
  from (select d.data->>'doneBy' as s, count(*) as c from os.docs d
        where d.col = 'tasks' and tg.isdone(d.data) and tg.ms(d.data->>'doneAt') >= a and tg.ms(d.data->>'doneAt') < b
          and coalesce(d.data->>'doneBy', '') <> ''
        group by 1) x;

  select count(*), count(*) filter (where tg.todate(d.data->>'due') < p),
         count(*) filter (where tg.todate(d.data->>'due') between p and p + 6)
  into open_n, late_n, due_n
  from os.docs d
  where d.col = 'tasks' and not tg.isdone(d.data) and coalesce(d.data->>'kind', 'none') <> 'event';

  select count(*) into ev_n from os.docs d
  where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
    and tg.tots(d.data->>'start')::date between p and p + 6;

  select count(*) filter (where tg.ms(d.data->>'createdAt') >= a and tg.ms(d.data->>'createdAt') < b),
         count(*) filter (where coalesce(d.data->>'stage', 'new') not in ('closed', 'rejected')),
         count(*) filter (where d.data->>'stage' = 'closed' and tg.ms(d.data->>'stageAt') >= a and tg.ms(d.data->>'stageAt') < b)
  into l_new, l_open, l_won
  from os.docs d where d.col = 'leads';

  select count(*) into web_n from public.skeylo_leads w where w.created_at >= a and w.created_at < b;

  select count(*), coalesce(sum(ukupno), 0),
         count(*) filter (where rok_placanja < p), coalesce(sum(ukupno) filter (where rok_placanja < p), 0)
  into u_n, u_sum, ul_n, ul_sum
  from os.fakture where status = 'izdata' and storno_za_fakturu_id is null;

  select coalesce(sum(ukupno) filter (where datum_izdavanja >= m0), 0),
         coalesce(sum(ukupno) filter (where status = 'placena' and datum_placanja >= m0), 0)
  into inv_sum, paid_sum
  from os.fakture where status in ('izdata', 'placena') and storno_za_fakturu_id is null;

  res := '📊 <b>Nedeljni pregled</b> · ' || tg.d(p - 7) || ' – ' || tg.d(p - 1)
    || E'\n\n✅ Završeno: <b>' || done_n || '</b>' || coalesce(' (' || done_by || ')', '')
    || E'\n📌 Otvoreno: <b>' || open_n || '</b>' || case when late_n > 0 then ' · 🔴 kasni ' || late_n else '' end
    || E'\n🗓 Narednih 7 dana: ' || due_n || ' rokova · ' || ev_n || ' eventa'
    || E'\n🧲 Leadovi: ' || l_new || ' novih · ' || l_open || ' u toku'
       || case when l_won > 0 then ' · 🎉 ' || l_won || ' zatvoreno' else '' end
       || case when web_n > 0 then ' · 🌐 ' || web_n || ' sa sajta' else '' end
    || E'\n💸 Neplaćeno: ' || u_n || ' fakt. · ' || tg.rsd(u_sum)
       || case when ul_n > 0 then ' (van roka ' || ul_n || ' · ' || tg.rsd(ul_sum) || ')' else '' end
    || E'\n🧾 U ' || tg.mesec(p) || ': fakturisano ' || tg.rsd(inv_sum) || ' · naplaćeno ' || tg.rsd(paid_sum);
  return res;
end $$;

-- ---------------------------------------------------------------------
-- pg_cron: svakih 5 minuta
-- ---------------------------------------------------------------------
create or replace function tg.tick() returns void
language plpgsql security definer set search_path = '' as $$
declare
  ln  timestamp := tg.lnow();
  dt  date := ln::date;
  hr  int := extract(hour from ln)::int;
  dow int := extract(isodow from ln)::int;
  bh  int := coalesce(nullif(tg.c('brief_hour'), '')::int, 8);
  wh  int := coalesce(nullif(tg.c('week_hour'), '')::int, 9);
  wd  int := coalesce(nullif(tg.c('week_dow'), '')::int, 1);
begin
  begin perform tg.reconcile();     exception when others then raise warning 'tg.reconcile: %', sqlerrm; end;
  begin perform tg.scan_events();   exception when others then raise warning 'tg.scan_events: %', sqlerrm; end;
  begin perform tg.scan_comments(); exception when others then raise warning 'tg.scan_comments: %', sqlerrm; end;

  begin
    if hr >= bh and hr < bh + 4
       and dow::text = any (string_to_array(replace(coalesce(tg.c('brief_days'), '1,2,3,4,5'), ' ', ''), ','))
       and not exists (select 1 from tg.out where key = 'brief:' || dt) then
      perform tg.push('brief:' || dt, 'brief', tg.brief(dt), null, null, false);
    end if;
    if dow = wd and hr >= wh and hr < wh + 4
       and not exists (select 1 from tg.out where key = 'week:' || to_char(dt, 'IYYY-IW')) then
      perform tg.push('week:' || to_char(dt, 'IYYY-IW'), 'week', tg.week(dt), null, null, false);
    end if;
  exception when others then
    raise warning 'tg.tick pregled: %', sqlerrm;
  end;

  begin
    delete from tg.out where created_at < now() - interval '90 days';
    delete from tg.seen where at < now() - interval '90 days';
    delete from cron.job_run_details
    where jobid in (select jobid from cron.job where jobname = 'tg-tick') and end_time < now() - interval '3 days';
  exception when others then
    raise warning 'tg.tick čišćenje: %', sqlerrm;
  end;
end $$;

-- ---------------------------------------------------------------------
-- Ulaz iz Telegrama (n8n "Dugmići" → POST /rest/v1/rpc/tg_in)
-- ---------------------------------------------------------------------
create or replace function tg.handle(u jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  grp      text := tg.c('group_chat_id');
  cq       jsonb := u->'callback_query';
  m        jsonb := u->'message';
  uid      text := coalesce(u->>'update_id', md5(u::text));
  chat     bigint;
  from_id  bigint;
  w_slug   text;
  w_name   text;
  w_uid    uuid;
  act      text;
  tid      text;
  tdata    jsonb;
  ttl      text;
  res      jsonb;
  tm       date;
  txt      text;
  cmd      text;
  arg      text;
  help     text := '🤖 <b>Skeylo OS bot</b>'
    || E'\n\n<code>/danas</code> — današnji pregled (rokovi, eventi, leadovi, fakture)'
    || E'\n<code>/nedelja</code> — pregled poslednjih 7 dana'
    || E'\n<code>/ja ime</code> — poveži svoj Telegram (npr. <code>/ja luka</code>) da te bot taguje'
    || E'\n\nNa porukama o taskovima: ✅ Gotovo označava task završenim, ⏰ Sutra pomera rok.';
begin
  -- klik na dugme ispod poruke
  if cq is not null then
    chat := (cq->'message'->'chat'->>'id')::bigint;
    from_id := (cq->'from'->>'id')::bigint;
    res := jsonb_build_object('query_id', cq->>'id', 'chat_id', chat,
                              'message_id', cq->'message'->>'message_id', 'text', '', 'toast', '');
    if grp is null or chat::text <> grp then
      return res || jsonb_build_object('toast', 'Ovaj chat nije povezan sa Skeylo OS-om.');
    end if;

    select p.slug, p.name, p.user_id into w_slug, w_name, w_uid from os.people p where p.tg_user_id = from_id;
    w_name := coalesce(w_name, cq->'from'->>'first_name', 'neko');
    act := split_part(cq->>'data', ':', 1);
    tid := substr(cq->>'data', length(act) + 2);

    select d.data into tdata from os.docs d where d.col = 'tasks' and d.id = tid;
    if not found then
      return res || jsonb_build_object('toast', 'Taj task više ne postoji.');
    end if;
    ttl := tg.h(tg.cut(coalesce(nullif(btrim(tdata->>'title'), ''), 'Bez naslova'), 200));

    if tg.isdone(tdata) then
      return res || jsonb_build_object('toast', 'Već je završeno ✓', 'text', '✅ <s>' || ttl || '</s>' || E'\n<i>Već završeno</i>');
    end if;

    if act = 'done' then
      update os.docs
         set data = data || jsonb_build_object('done', true,
                                               'doneAt', (extract(epoch from now()) * 1000)::bigint,
                                               'doneBy', w_slug),
             v = nextval('os.docs_v'), updated_at = now(), updated_by = w_uid
       where col = 'tasks' and id = tid;
      return res || jsonb_build_object('toast', '✅ Završeno',
        'text', '✅ <s>' || ttl || '</s>' || E'\n<i>Gotovo · ' || tg.h(w_name) || ', ' || to_char(tg.lnow(), 'HH24:MI') || '</i>');
    elsif act = 'snooze' then
      tm := tg.today() + 1;
      update os.docs
         set data = data || jsonb_build_object('due', tm::text)
                         || case when coalesce(data->>'kind', 'none') = 'none' then '{"kind":"task"}'::jsonb else '{}'::jsonb end,
             v = nextval('os.docs_v'), updated_at = now(), updated_by = w_uid
       where col = 'tasks' and id = tid;
      return res || jsonb_build_object('toast', '⏰ Rok: ' || tg.d(tm),
        'text', '⏰ <b>' || ttl || '</b>' || E'\n<i>Rok pomeren na ' || tg.d(tm) || ' · ' || tg.h(w_name) || '</i>');
    end if;
    return res;
  end if;

  -- komanda u chatu
  if m is not null then
    txt := btrim(coalesce(m->>'text', ''));
    if left(txt, 1) <> '/' then return '{}'::jsonb; end if;
    chat := (m->'chat'->>'id')::bigint;
    from_id := (m->'from'->>'id')::bigint;
    cmd := lower(split_part(split_part(txt, ' ', 1), '@', 1));
    arg := btrim(substr(txt, length(split_part(txt, ' ', 1)) + 1));

    if cmd = '/povezi' then
      if upper(arg) = tg.c('link_code') then
        insert into tg.cfg (k, v) values ('group_chat_id', chat::text)
        on conflict (k) do update set v = excluded.v;
        perform tg.push('cmd:' || uid, 'cmd',
          '✅ <b>Grupa je povezana sa Skeylo OS-om.</b>'
          || E'\n\nSvako neka pošalje <code>/ja ime</code> (npr. <code>/ja luka</code>) da ga bot taguje kad nešto stigne za njega.'
          || E'\n\n' || help, null, chat, false);
      else
        perform tg.push('cmd:' || uid, 'cmd', '❌ Pogrešan kod.', null, chat, false);
      end if;
      return '{}'::jsonb;
    end if;

    if grp is null or chat::text <> grp then
      if cmd = '/start' then
        perform tg.push('cmd:' || uid, 'cmd', 'Ovo je bot Skeylo tima i radi samo u timskoj grupi.', null, chat, false);
      end if;
      return '{}'::jsonb;
    end if;

    if cmd = '/ja' then
      select p.slug into w_slug from os.people p
      where p.slug = lower(arg) or lower(p.name) = lower(arg) limit 1;
      if w_slug is null then
        perform tg.push('cmd:' || uid, 'cmd', 'Ne znam ko je to. Pošalji npr. '
          || (select string_agg('<code>/ja ' || p.slug || '</code>', ', ' order by p.created_at) from os.people p),
          null, chat, false);
      else
        update os.people set tg_user_id = null where tg_user_id = from_id and slug <> w_slug;
        update os.people set tg_user_id = from_id where slug = w_slug;
        perform tg.push('cmd:' || uid, 'cmd', '✅ Povezano: ' || tg.who(w_slug)
          || E'\nBot će te tagovati kad nešto stigne za tebe.', null, chat, false);
      end if;
    elsif cmd in ('/danas', '/brief') then
      perform tg.push('cmd:' || uid, 'brief', tg.brief(tg.today()), null, chat, false);
    elsif cmd = '/nedelja' then
      perform tg.push('cmd:' || uid, 'week', tg.week(tg.today()), null, chat, false);
    elsif cmd in ('/pomoc', '/help', '/start') then
      perform tg.push('cmd:' || uid, 'cmd', help, null, chat, false);
    end if;
    return '{}'::jsonb;
  end if;

  return '{}'::jsonb;
end $$;

-- jedina funkcija dostupna spolja; zaštićena tajnim headerom x-skeylo-secret
create or replace function os.tg_in(p_update jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s text := coalesce(nullif(current_setting('request.headers', true), '')::jsonb->>'x-skeylo-secret', '');
begin
  if s = '' or s <> coalesce(tg.c('secret'), '') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return tg.handle(coalesce(p_update, '{}'::jsonb));
end $$;

revoke all on all functions in schema tg from public, anon, authenticated;
revoke all on function os.tg_in(jsonb) from public;
grant execute on function os.tg_in(jsonb) to anon, authenticated;

-- stari komentari klijenata se ne šalju (samo novi od danas)
insert into tg.seen (key)
select 'c:' || d.col || ':' || d.id from os.docs d where d.col in ('comments', 'creativeComments')
on conflict do nothing;

select cron.schedule('tg-tick', '*/5 * * * *', 'select tg.tick()');
