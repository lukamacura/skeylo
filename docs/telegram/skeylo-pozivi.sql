-- =====================================================================
-- Zakazivanje poziva sa Skeylo timom (www.skeylo.com/poziv)
--
--   /poziv ──► /api/poziv ──► os.call_slots()  slobodni termini
--                          └► os.call_book()   upis eventa u OS + 📞 poruka u grupu
--
-- Zakazan poziv je običan OS event (os.docs, col = 'tasks', kind = 'event',
-- klijent Skeylo, dodeljen ljudima iz tg.cfg call_who). Zato:
--   • tim ga vidi u OS-u, pomera ga ili briše tamo (termin se tada oslobađa),
--   • stiže postojeći podsetnik 1h pre (tg.scan_events) i ulazi u jutarnji pregled,
--   • svaki drugi event tih ljudi u OS-u blokira termine (npr. "Nedostupan" ceo dan).
--
-- Dodatno uz skeylo-telegram.sql; ponovno pokretanje je bezbedno.
-- Na Supabase: migracije tg_call_booking, tg_call_booking_today_email,
-- tg_call_booking_live_weekend (svaki dan + kanal 'live' = uživo).
-- =====================================================================

insert into tg.cfg (k, v) values
  ('call_who',    'luka'),        -- ko prima pozive (slug-ovi iz os.people, zarezom)
  ('call_days',   '1,2,3,4,5,6,7'), -- svaki dan (1 = ponedeljak … 7 = nedelja)
  ('call_from',   '10:00'),       -- prvi termin
  ('call_to',     '17:00'),       -- poslednji termin se završava do
  ('call_len',    '30'),          -- trajanje poziva u minutima
  ('call_ahead',  '14'),          -- koliko dana unapred može da se zakaže
  ('call_notice', '3')            -- najmanje sati unapred
on conflict (k) do nothing;

create or replace function tg.call_who() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by o), '[]'::jsonb)
  from unnest(string_to_array(replace(coalesce(tg.c('call_who'), ''), ' ', ''), ',')) with ordinality t(x, o)
  where x <> ''
$$;

create or replace function tg.call_len() returns int
language sql stable security definer set search_path = '' as $$
  select least(240, greatest(10, coalesce(nullif(tg.c('call_len'), '')::int, 30)))
$$;

-- slobodni termini (lokalno vreme, Europe/Belgrade)
create or replace function tg.call_slots() returns setof timestamp
language plpgsql stable security definer set search_path = '' as $$
declare
  ln     timestamp := tg.lnow();
  len    interval := make_interval(mins => tg.call_len());
  t_from time := coalesce(nullif(tg.c('call_from'), '')::time, '10:00');
  t_to   time := coalesce(nullif(tg.c('call_to'), '')::time, '17:00');
  ahead  int := least(90, coalesce(nullif(tg.c('call_ahead'), '')::int, 14));
  notice int := coalesce(nullif(tg.c('call_notice'), '')::int, 3);
  days   text[] := string_to_array(replace(coalesce(tg.c('call_days'), '1,2,3,4,5'), ' ', ''), ',');
  who    text[] := array(select jsonb_array_elements_text(tg.call_who()));
begin
  return query
  with ev as (
    select tg.tots(d.data->>'start') as st, tg.tots(d.data->>'end') as en
    from os.docs d
    where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
      and (cardinality(who) = 0 or tg.arr(d.data->'assignees') ?| who)
  ), busy as (
    -- event bez kraja zauzima sat vremena
    select st, case when en > st then en else st + interval '60 minutes' end as en
    from ev
    where st is not null and st < ln + make_interval(days => ahead + 2) and st > ln - interval '2 days'
  )
  select x.s
  from generate_series(tg.today()::timestamp, (tg.today() + ahead)::timestamp, interval '1 day') g(d)
  cross join lateral generate_series(g.d + t_from, g.d + t_to - len, len) x(s)
  where extract(isodow from g.d)::text = any (days)
    and x.s >= ln + make_interval(hours => notice)
    and not exists (select 1 from busy b where b.st < x.s + len and b.en > x.s)
  order by 1;
end $$;

-- ---------------------------------------------------------------------
-- API (samo service_role, poziva ga /api/poziv)
-- ---------------------------------------------------------------------
create or replace function os.call_slots() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'len',   tg.call_len(),
    'tz',    'Europe/Belgrade',
    'today', to_char(tg.today(), 'YYYY-MM-DD'),
    'until', to_char(tg.today() + least(90, coalesce(nullif(tg.c('call_ahead'), '')::int, 14)), 'YYYY-MM-DD'),
    'slots', coalesce((select jsonb_agg(to_char(s, 'YYYY-MM-DD"T"HH24:MI') order by s) from tg.call_slots() s), '[]'::jsonb)
  )
$$;

create or replace function os.call_book(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  ln    timestamp := tg.lnow();
  len   int := tg.call_len();
  st    timestamp;
  en    timestamp;
  nm    text := btrim(regexp_replace(coalesce(p->>'name', ''), '\s+', ' ', 'g'));
  ph    text := btrim(coalesce(p->>'phone', ''));
  phn   text := regexp_replace(coalesce(p->>'phone', ''), '[^0-9]', '', 'g');
  em    text := lower(btrim(coalesce(p->>'email', '')));
  co    text := btrim(regexp_replace(coalesce(p->>'company', ''), '\s+', ' ', 'g'));
  nt    text := btrim(coalesce(p->>'note', ''));
  how   text := coalesce(nullif(p->>'how', ''), 'phone');
  who   jsonb := tg.call_who();
  ms    bigint := (extract(epoch from now()) * 1000)::bigint;
  nid   text;
  prev  text;
  dtxt  text;
  ttl   text;
begin
  if coalesce(p->>'start', '') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID');
  end if;
  st := tg.tots(p->>'start');
  if st is null or length(nm) < 2 or length(nm) > 80 or length(phn) < 8 or length(phn) > 15 or length(ph) > 30
     or (em <> '' and (em !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(em) > 120))
     or length(co) > 80 or length(nt) > 600
     or how not in ('phone', 'whatsapp', 'viber', 'meet', 'live')
     or (how = 'meet' and em = '') then
    return jsonb_build_object('ok', false, 'error', 'INVALID');
  end if;
  en := st + make_interval(mins => len);

  -- jedan po jedan: dva klika na isti termin ne mogu oba da prođu
  perform pg_advisory_xact_lock(hashtext('skeylo:call_book'));

  -- ista osoba već ima zakazan poziv koji tek predstoji
  select d.data->>'start' into prev
  from os.docs d
  where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
    and d.data->'call'->>'phoneN' = phn
    and tg.tots(d.data->>'start') > ln
  order by d.data->>'start' limit 1;
  if prev is not null then
    return jsonb_build_object('ok', false, 'error', 'ALREADY', 'start', prev);
  end if;

  if not exists (select 1 from tg.call_slots() s where s = st) then
    return jsonb_build_object('ok', false, 'error', 'TAKEN');
  end if;

  loop
    nid := (select string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                                    (floor(random() * 62) + 1)::int, 1), '')
           from generate_series(1, 20));
    exit when not exists (select 1 from os.docs d where d.col = 'tasks' and d.id = nid);
  end loop;

  ttl := '📞 Poziv · ' || nm || coalesce(' (' || nullif(co, '') || ')', '');
  dtxt := case
    when st::date = tg.today() then 'danas'
    when st::date = tg.today() + 1 then 'sutra, ' || tg.d(st::date)
    else tg.d(st::date)
  end;

  -- poruka ide pod ključem 'task:<id>', isti koji koristi docs_tg trigger,
  -- pa obično "📅 Novi event" za ovaj event ne ide (nema duple poruke)
  perform tg.push('task:' || nid, 'call',
    '📞 <b>Zakazan poziv</b> · ' || tg.h(dtxt) || ' u ' || to_char(st, 'HH24:MI') || '–' || to_char(en, 'HH24:MI')
      || E'\n<b>' || tg.h(nm) || '</b>' || coalesce(' · ' || tg.hn(co), '')
      || E'\n📱 ' || tg.h(ph) || coalesce(' · ✉️ ' || tg.hn(nullif(em, '')), '')
      || E'\n' || case how
           when 'whatsapp' then '💬 preko WhatsApp-a'
           when 'viber'    then '💜 preko Vibera'
           when 'meet'     then '🎥 Google Meet (pošalji link na mejl)'
           when 'live'     then '🤝 uživo (dogovoriti mesto)'
           else                 '☎️ običan telefonski poziv'
         end
      || coalesce(E'\n<i>„' || tg.hn(tg.cut(nt, 400)) || '“</i>', '')
      || E'\n👤 ' || tg.whos(who)
      || E'\n<a href="' || tg.h(tg.c('os_url') || '#tasks') || '">otvori u OS-u</a>');

  insert into os.docs (col, id, data, v, updated_at, updated_by)
  values ('tasks', nid, jsonb_build_object(
      'title',     ttl,
      'kind',      'event',
      'start',     to_char(st, 'YYYY-MM-DD"T"HH24:MI'),
      'end',       to_char(en, 'YYYY-MM-DD"T"HH24:MI'),
      'due',       '',
      'done',      false,
      'doneAt',    null,
      'order',     ms,
      'createdAt', ms,
      'createdBy', 'sajt',
      'clientId',  'skeylo',
      'projectId', '',
      'assignees', who,
      'call', jsonb_build_object(
        'name', nm, 'phone', ph, 'phoneN', phn, 'email', em, 'company', co,
        'note', nt, 'how', how, 'source', left(coalesce(p->>'source', ''), 120),
        'bookedAt', to_char(ln, 'YYYY-MM-DD"T"HH24:MI'))
    ), nextval('os.docs_v'), now(), null);

  return jsonb_build_object('ok', true, 'start', to_char(st, 'YYYY-MM-DD"T"HH24:MI'),
                            'end', to_char(en, 'YYYY-MM-DD"T"HH24:MI'));
end $$;

revoke all on function os.call_slots() from public, anon, authenticated;
revoke all on function os.call_book(jsonb) from public, anon, authenticated;
grant execute on function os.call_slots() to service_role;
grant execute on function os.call_book(jsonb) to service_role;

-- ---------------------------------------------------------------------
-- Podsetnik 1h pre: za poziv sa sajta dodaj telefon i kanal
-- (isto kao u skeylo-telegram.sql, plus red 📱 kad event ima data.call)
-- ---------------------------------------------------------------------
create or replace function tg.scan_events() returns void
language plpgsql security definer set search_path = '' as $$
declare
  r    record;
  ln   timestamp := tg.lnow();
  mins int;
  c    jsonb;
begin
  for r in
    select d.id, d.data, tg.tots(d.data->>'start') as st, tg.tots(d.data->>'end') as en
    from os.docs d
    where d.col = 'tasks' and d.data->>'kind' = 'event' and not tg.isdone(d.data)
      and tg.tots(d.data->>'start') > ln
      and tg.tots(d.data->>'start') <= ln + interval '60 minutes'
  loop
    mins := greatest(5, (round(extract(epoch from (r.st - ln)) / 300) * 5)::int);
    c := case when jsonb_typeof(r.data->'call') = 'object' then r.data->'call' end;
    perform tg.push('ev:' || r.id || ':' || (r.data->>'start'), 'event',
      '⏰ <b>Za ' || mins || ' min</b>: ' || tg.h(tg.cut(coalesce(nullif(btrim(r.data->>'title'), ''), 'Event'), 200))
        || coalesce(' · ' || tg.hn(tg.client(r.data->>'clientId')), '')
        || E'\n🕐 ' || to_char(r.st, 'HH24:MI') || case when r.en > r.st then '–' || to_char(r.en, 'HH24:MI') else '' end
        || ' · 👤 ' || tg.whos(r.data->'assignees')
        || case when c is null then '' else
             E'\n📱 ' || coalesce(tg.hn(c->>'phone'), '—')
               || case c->>'how'
                    when 'whatsapp' then ' · WhatsApp'
                    when 'viber'    then ' · Viber'
                    when 'meet'     then ' · Google Meet' || coalesce(' → ' || tg.hn(nullif(c->>'email', '')), '')
                    when 'live'     then ' · uživo'
                    else ' · telefon'
                  end
           end);
  end loop;
end $$;
