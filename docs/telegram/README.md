# Skeylo OS → Telegram

Jedna Telegram grupa ("Skeylo tim") u kojoj sva četvorica vide šta se dešava u OS-u.
**Baza odlučuje šta i kada se javlja, n8n samo dostavlja.**

```
 os.docs (tasks, leads) ──trigger──┐
 public.skeylo_leads    ──trigger──┤
 pg_cron svakih 5 min (tg.tick) ───┼──► tg.out (sanduče) ──pg_net──► n8n "Pošalji" ──► Telegram grupa
                                   │
 Telegram dugme / komanda ──► n8n "Dugmići" ──► os.tg_in() ─┘
```

## Trenutno stanje (6. 11. 2026)

- Grupa **skeylo** (`-5324949328`) upisana ručno u `tg.cfg.group_chat_id` (bez `/povezi`).
- U n8n-u radi samo workflow **Webhook → If → Telegram** (bot _Sluga_), Respond = When Last Node Finishes.
- **Dugmići i komande su isključeni** (`tg.cfg buttons = 'off'`, workflow "Dugmići" nije postavljen). Zato ne rade ni `/danas`, `/ja`, ni tagovanje članova — imena su samo podebljana.
- Ponovo uključiti: `update tg.cfg set v = 'on' where k = 'buttons';` + u n8n If sa dugmićima (`n8n-if-i-telegram.json`) i workflow `n8n-2-dugmici.json`. Bot koji prima klikove sme da ima samo jedan Telegram Trigger u celom n8n-u.

| Fajl                  | Šta je                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `skeylo-telegram.sql` | sve u bazi (već pušteno na Supabase, migracije `tg_telegram_notifications` + `tg_brief_header`) |
| `n8n-1-posalji.json`  | workflow: baza → Telegram                                                                       |
| `n8n-2-dugmici.json`  | workflow: ✅/⏰ dugmići i komande → baza                                                        |

## Šta stiže u grupu

| Kada             | Poruka                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Odmah            | 📌 novi task / 📅 novi event (ne kad neko dodeli task samo sebi), ➕ neko dodat na task. Task poruke imaju **✅ Gotovo** i **⏰ Sutra** |
| Odmah            | 🧲 nov lead u OS-u, 🤝 sastanak, 💬 pregovori, 🎉 zatvoren deal, ✖️ odbijen                                                             |
| Odmah            | 🌐 novi upit sa sajta (kvizovi, kalkulatori)                                                                                            |
| 2–7 min posle    | 💬/🎬 komentari klijenta iz CRM-a, skupljeni u jednu poruku po skripti/kreativi                                                         |
| 1h pre           | ⏰ event počinje                                                                                                                        |
| 08:00 pon–pet    | ☀️ jutarnji pregled: po osobi rokovi danas, 🔴 ono što kasni, eventi; follow-up leadova; fakture van roka                               |
| Ponedeljak 09:00 | 📊 nedeljni pregled: završeno po osobi, otvoreno, leadovi, neplaćeno, fakturisano u mesecu                                              |

Od 22h do 8h poruke stižu bez zvuka.

## Podešavanje (jednom)

1. **Bot** — u Telegramu otvori `@BotFather` → `/newbot` → ime npr. _Skeylo OS_, korisničko ime npr. `skeylo_os_bot` → dobiješ **token**.
2. **n8n → Credentials → Add credential**
   - _Telegram API_: Access Token = token od BotFathera.
   - _Header Auth_: **Name** `x-skeylo-secret`, **Value** = tajni ključ iz baze:
     `select v from tg.cfg where k = 'secret';`
3. **Workflow 1 ("Pošalji")** — otvori workflow u kom je Webhook sa putanjom `30f460e1-…`, obriši taj Webhook node, pa nalepi (Ctrl/Cmd+V) sadržaj `n8n-1-posalji.json`. U nodu _Poruka iz baze_ izaberi Header Auth credential, u oba Telegram noda Telegram credential. Sačuvaj i uključi **Active**.
4. **Workflow 2 ("Dugmići")** — novi workflow, nalepi `n8n-2-dugmici.json`. Credential: Telegram u 3 Telegram noda, Header Auth u _Supabase · tg_in_. Sačuvaj i uključi **Active** (n8n tada sam registruje webhook kod Telegrama).
5. **Grupa** — napravi grupu, dodaj bota i ostalu trojicu. Ako hoćeš da bot bude admin ili da grupa ima teme, uradi to **pre** sledećeg koraka (Telegram tada menja ID grupe).
6. U grupi pošalji `/povezi KOD` — kod: `select v from tg.cfg where k = 'link_code';`
7. Svako u grupi pošalje `/ja luka`, `/ja nina`, `/ja filip`, `/ja mihajlo` — od tada ga bot taguje.
8. Test: u OS-u napravi task za nekog drugog → poruka stiže za par sekundi.

## Komande u grupi

`/danas` · `/nedelja` · `/ja ime` · `/pomoc` (ako bot ne reaguje na komandu, kucaj `/danas@ime_bota` ili ga postavi za admina).

## Podešavanja (tg.cfg)

```sql
update tg.cfg set v = '9'           where k = 'brief_hour';  -- jutarnji pregled u 9
update tg.cfg set v = '1,2,3,4,5,6' where k = 'brief_days';  -- i subotom
update tg.cfg set v = '23'          where k = 'quiet_from';  -- tišina od 23h
```

## Kad nešto ne radi

```sql
-- poslednje poruke: da li su poslate i zašto nisu
select id, key, tries, sent_at, err from tg.out order by id desc limit 20;
-- cron radi?
select status, return_message, start_time from cron.job_run_details d
join cron.job j using (jobid) where j.jobname = 'tg-tick' order by start_time desc limit 5;
```

- `err` = `HTTP 404` → workflow 1 nije **Active** (ili je baza podešena na `/webhook-test/` umesto `/webhook/`).
- `err` = `HTTP 500` → otvori n8n → Executions, greška je u Telegram nodu (najčešće pogrešan token ili bot nije u grupi).
- Grupa je promenila ID (postala supergrupa) → ponovo `/povezi KOD`.
- Neuspela poruka se pokušava do 5 puta u naredna 3 sata, posle toga odustaje (stari podsetnik nema smisla).
- Sve ugasiti: `select cron.unschedule('tg-tick'); update tg.cfg set v = '' where k = 'webhook_url';`
