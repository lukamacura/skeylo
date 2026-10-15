# CRM ↔ Skeylo OS: Reporting + Creative Inspection + Final Creatives + Organisation + Privacy

Za Luku i njegov Claude. CRM klijenta čita iste podatke koje tim upisuje u Skeylo OS. Nema slanja klijentu i nema dupliranja. Klijent samo čita, a jedino što upisuje su komentari (na skripte i na kreative) i svoje šifre naloga (Privacy).

## Kako radi

**Reporting Dashboard**

1. U Skeylo OS-u: Projects → klijent → ciklus/mesec → Reporting Dashboard → Novi izveštaj (.html fajl + Loom link).
2. OS upisuje `reports/{id}` i `reportChunks/{id}_{i}` sa `clientId` i `monthId`.
3. CRM klijenta prikazuje izveštaj u istom ciklusu/mesecu. Ako klijent ima otvoren CRM, izveštaj se pojavi uživo uz obaveštenje „Novi izveštaj · …“.

**Creative Inspection**

1. Tim piše skripte u OS-u (Content Manager), kao i do sada.
2. Klijent u CRM-u bira period (aktuelni je istaknut), vidi sve skripte tog perioda i fazu svake (Pisanje → Zakazivanje → Snimanje → Montaža → Za objavu → Objavljeno). Skriptu može samo da čita: tekst i faza se ne mogu menjati.
3. Klijent označi deo teksta → „Komentariši“ (ili napiše komentar na celu skriptu). Komentar se upisuje u `comments`.
4. U OS-u: kartica skripte u Content Manageru dobije oznaku sa brojem komentara, kartica Content Managera na mesecu pokaže „N komentara klijenta“, a ako je OS otvoren stigne i obaveštenje sa dugmetom „Otvori“.
5. U editoru skripte desno (na manjem ekranu iznad teksta) stoji „Komentari klijenta“. Citat je podvučen u tekstu, klik na citat skroluje do njega. Kad se tekst promeni pa citat više ne postoji, citat je precrtan.
6. „Označi kao rešeno“ → klijent u CRM-u odmah vidi „Rešeno“, a podvlaka nestaje.

**Final Creatives**

1. U OS-u: mesec → **Final Creatives**. Mihajlo prevuče gotove fajlove iz računara bilo gde na stranicu (ili „Dodaj“). Podržano: MP4, WebM, JPG, PNG, WebP, GIF (na sajtu i MOV). Kad ubaci više slika odjednom, OS pita: „Jedan karusel“ ili „Posebne objave“. Video sam dobija sličicu.
2. OS čuva **originalni fajl** (pun kvalitet, bez ponovne kompresije) i sličicu, pa upisuje `creatives/{id}`. Kad se sve otpremi: „Bravo, Mihajlo.“
3. CRM: klijent bira period (aktuelni je istaknut i prvi), vidi kreative tog perioda i otvara svaku u punom kvalitetu u stranici (video sa plejerom, karusel sa prevlačenjem, slika). Ništa ne mora da preuzima. Uživo stižu „Nova kreativa · …“ i „Nova verzija · …“.
4. Klijent ostavlja komentar na kreativu. Uz komentar automatski ide vreme u videu (npr. „u 0:07“) ili broj slajda. Upisuje se u `creativeComments`.
5. U OS-u: broj otvorenih komentara na kartici kreative i na kartici Final Creatives u mesecu, obaveštenje „Klijent · …“ sa „Otvori“. U pregledu kreative „Reši“ → klijent vidi „Rešeno“.
6. **Beleške tima** (Filip → Mihajlo) su u istom pregledu, ispod komentara klijenta. Idu u `creativeNotes` i klijent ih nikad ne vidi (blokiraju pravila baze). Mihajlo dobija obaveštenje.
7. **Export** (jedna kreativa, originalni fajl; karusel kao ZIP) i **Export All** (ZIP celog meseca: `01 Naziv.mp4`, `02 Naziv/01.jpg` …). Spremno za Ads Manager.
8. **Zameni** = nova verzija istog posla: komentari ostaju, klijent dobija „Nova verzija“. Prevlačenje fajla na otvorenu kreativu radi isto. Stari fajl se briše posle 20 sekundi („Poništi“ ga vraća).
9. **Link za klijenta** (OS ga kopira): `https://skeylo.com/crm/#creatives.{monthId}`. Kad klijent otvori link: uvodna animacija sa njegovim logom, pa period. Ako klijent ima drugu adresu CRM-a, upiši je u `clients/{id}.crmUrl`.

**Organisation (raspored snimanja)**

1. Nina u OS-u složi dan kao i do sada (Cockpit/kalendar: entiteti sa datumom i vremenom, pauze, prevozi).
2. OS za svakog klijenta tog dana sam napravi i ažurira `schedules/{id}`: samo scene tog klijenta (naziv skripte, vreme, modeli po imenu, lokacija, rekviziti, tekst za snimanje) i pauze/prevozi između njih. Telefoni i ostalo iz baze modela nikad ne ulaze u raspored. Ako se entitet vrati u Cockpit, raspored se ažurira ili nestaje.
3. U danu (Nina) stoji dugme **„Link za {klijent}“**: kopira `https://skeylo.com/crm/#raspored.{id}`. Taj link Nina šalje modelima i ostalima koji nemaju pristup platformi, umesto slike na WhatsApp.
   - **Link otvara samo taj jedan raspored.** Nema dashboarda, nema dugmeta nazad, nema ostalih stranica: svaka druga adresa vraća na isti raspored. Za njega ne treba nalog.
   - Iza toga ne stoji samo dizajn: gost ne prijavljuje nalog i ne čita ništa osim tog jednog dokumenta, a pravila baze bez naloga dozvoljavaju samo `get` jednog `schedules` dokumenta po nasumičnom id-u (ne može da izlista druge rasporede, ni izveštaje, skripte, kreative).
   - Klijent u svom CRM-u (sa nalogom) i dalje vidi sve svoje rasporede pod Organisation (`#organisation`).
4. CRM → Organisation: **Sledeće snimanje** (najbliže, sa odbrojavanjem), ispod **Zakazano** (ako ih ima više) i **Stari rasporedi**. Ako nema skorijeg snimanja, taj deo se ne prikazuje. Nije po ciklusima.
5. Jedan dan: vreme od–do, lokacije (link na Google mape), modeli, vremenska linija scena sa „Tekst za snimanje“, „Dodaj u kalendar“ (Google kalendar). Na dan snimanja: završene scene se gase, trenutna je označena sa „Sada“. Promena u OS-u stiže uživo („Raspored je promenjen“).

**Privacy (šifre naloga)**

1. Dashboard → Privacy → šifra **„tajna“** → „Šifre naloga“ (`#privacy`). Direktan link `#privacy` bez otključavanja vraća na dashboard i traži šifru.
2. Svaki nalog je kartica: platforma, naziv naloga, **mejl/korisničko ime** i **šifra**, svaki sa dugmetom „Kopiraj“. Šifra je skrivena, „oko“ je prikaže (sama se sakrije posle 20 s). Napomena po želji (npr. „kod za prijavu stiže na Aninu mejl adresu“).
3. Pretraga (platforma, naziv, mejl) i filter po platformi. Kad pretraga nađe tačno jedan nalog, Enter kopira njegovu šifru.
4. „Dodaj nalog“: izbor platforme (Instagram, Facebook, Meta Business, TikTok, Google, YouTube, LinkedIn, X, Email, Sajt, Drugo + sopstveni naziv), naziv, mejl, šifra, napomena. Olovka na kartici = izmena; „Obriši“ traži drugi klik, a posle brisanja „Vrati“.
5. Zaključavanje: dugme sa katancem, ili samo posle 10 minuta bez aktivnosti.
6. Upisuje se u `vault/{id}`. Čita i piše svako sa nalogom tog klijenta (ceo Infinity tim) i Skeylo tim. Drugi klijenti i gost link za raspored ne mogu ni da pročitaju.
7. OS ovu kolekciju ne prikazuje i ne dira.

## Šema (ista u OS-u i CRM-u, ne menjati imena polja)

| Kolekcija                     | Polja                                                                                                                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items/{id}`                  | `clientId`, `type` (`cycle`, `month`, `platform`, `project`), `title`, `year`, `month`, `order`                                                                                                                                                                       |
| `reports/{id}`                | `clientId`, `monthId`, `title`, `loom`, `chunks`, `size`, `createdAt`, `order`, `createdBy`                                                                                                                                                                           |
| `reportChunks/{reportId}_{i}` | `reportId`, `clientId`, `i`, `data` (deo .html fajla, do 80.000 znakova)                                                                                                                                                                                              |
| `scripts/{id}`                | `clientId`, `monthId`, `title`, `status`, `format`, `models`, `modelNames`, `location`, `props`, `body`, `order`, …                                                                                                                                                   |
| `comments/{id}`               | `clientId`, `scriptId`, `monthId`, `text`, `quote`, `before`, `after`, `author` (`"client"`), `authorName`, `authorUid`, `createdAt`, `order`, `resolved` (+ `resolvedAt`, `resolvedBy` kad tim reši)                                                                 |
| `creatives/{id}`              | `clientId`, `monthId`, `title`, `kind` (`video`, `image`, `carousel`), `files` (lista: `url` + `path`, `type`, `name`, `size`, `w`, `h`, `dur`), `poster` (`url` + `path`), `order`, `createdAt`, `createdBy`, `updatedAt`, `v`                                       |
| `creativeComments/{id}`       | `clientId`, `creativeId`, `monthId`, `text`, `at` (sekunda u videu ili `null`), `slide` (indeks slajda od 0 ili `null`), `author` (`"client"`), `authorName`, `authorUid`, `createdAt`, `order`, `resolved`                                                           |
| `schedules/{id}`              | `clientId`, `date` (`YYYY-MM-DD`), `start`, `end` (`HH:MM`), `items` (lista: `k` = `scene`/`pause`/`travel`, `start`, `end`, `dur`, `title`, `models` (imena), `location`, `props`, `lines`), `models`, `locations`, `createdAt`, `updatedAt`, `order` (piše samo OS) |
| `vault/{id}`                  | `clientId`, `platform` (`instagram`, `facebook`, `meta`, `tiktok`, `google`, `youtube`, `linkedin`, `x`, `mail`, `web`, `other`), `platformName` (samo za `other`), `label`, `login`, `password`, `note`, `order`, `createdAt`, `updatedAt`, `updatedBy` (ime osobe)  |
| `creativeNotes/{id}`          | `clientId`, `creativeId`, `monthId`, `text`, `at`, `slide`, `author` (`"team"`), `authorId`, `authorName`, `createdAt`, `order`, `resolved` (samo tim)                                                                                                                |

- CRM prikazuje samo `items` tipa `cycle` i `month`. Period sa najvećim `order` je aktuelni.
- Reporting: Loom lista = izveštaji sa `loom` linkom, Pisani = izveštaji sa `chunks > 0`. Najnoviji gore.
- Skripte: `status` je `write`, `schedule`, `record`, `edit`, `upload` ili `uploaded` (CRM ih prikazuje srpskim imenima). Skripta bez naslova i bez teksta se klijentu ne prikazuje. `body` CRM ponovo čisti pre prikaza.
- CRM klijentu prikazuje samo naslov, fazu i tekst skripte (format, modeli i lokacija se ne prikazuju).
- `modelNames` = imena modela. OS ga sam popunjava (i dopunjava stare skripte), da klijent nikad ne mora da čita `models` (tamo su telefoni i Instagram). CRM ga trenutno ne prikazuje.
- `quote` = označeni tekst (prazno = komentar na celu skriptu). `before`/`after` = do 40 znakova oko citata, da se citat nađe i kad se ista rečenica ponavlja.
- Kreative: redosled je `order` (redosled ubacivanja). Karusel = više `files` (slajdovi po redu). `poster` je sličica (do 720 px) za mrežu i za video pre puštanja; pun kvalitet je uvek u `files`. Kreativa bez fajla sa adresom se klijentu ne prikazuje.
- U Claude pregledu OS umesto `url` upisuje `asset` (ili `parts` za fajl veći od 20 MB). Na sajtu to ne postoji: tamo idu `url` + `path` iz Firebase Storage-a.

## Koraci na sajtu

1. **Firebase:** Firestore + Authentication (Email/Password) + **Storage**.
2. **OS:** `window.claude.use("db")` zameni sa `firebase.firestore()` (compat API). Pozivi su isti: `collection`, `doc`, `where`, `orderBy`, `onSnapshot`, `set`, `update`, `delete`.
   - Podatke iz Claude baze prebaci u Firestore.
   - Starim `reportChunks` dokumentima dodaj `clientId` iz njihovog `reports` dokumenta (novi ga već imaju, OS verzija 51).
   - Kolekcije `comments` (verzija 53), `creatives`, `creativeComments`, `creativeNotes` (verzija 54) i `schedules` (verzija 55) OS već sluša i piše. Ništa posebno.
   - Fajlovi kreativa idu u Firebase Storage. Posle učitavanja OS-a jednom pozovi:

```js
const storage = firebase.storage();
SkeyloOS.useStorage({
  async put(file, { type, path, onProgress }) {
    // path: creatives/{clientId}/{monthId}/{id}/01.mp4
    const ref = storage.ref(path);
    const task = ref.put(file, {
      contentType: type,
      cacheControl: "public,max-age=31536000",
    });
    task.on(
      "state_changed",
      (s) => onProgress && onProgress(s.bytesTransferred / s.totalBytes),
    );
    await task;
    return { url: await ref.getDownloadURL(), path };
  },
  async remove(path) {
    await storage.ref(path).delete();
  },
});
```

- Na sajtu nema ograničenja od 20 MB. MOV prolazi, ali MP4 (H.264) je sigurniji: iPhone MOV (HEVC) se ne pušta u Chrome-u.
- Export i Export All čitaju fajlove iz Storage-a, pa bucket mora da dozvoli GET sa sajta (CORS), jednom:

```
// cors.json
[{ "origin": ["https://skeylo.com"], "method": ["GET"], "maxAgeSeconds": 3600 }]
// gsutil cors set cors.json gs://IME-BUCKETA
```

3. **CRM fajl** (`skeylo-crm-sajt.html`):
   - U `CLIENT` objektu postavi `data:"firebase"` i `loomEmbed:true`.
   - Pre CRM skripte učitaj Firebase compat (app, auth, firestore).
   - Posle logina klijenta pozovi `SkeyloCRM.connect(...)` sa imenom osobe (ide uz komentar):

```js
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return pokaziLogin(); // login ekran za klijenta
  const db = firebase.firestore();
  const me = (await db.doc("users/" + user.uid).get()).data();
  SkeyloCRM.connect(db, me.clientId, { uid: user.uid, name: me.name }); // npr. "ils", "Ana"
});
```

- Link za kreative (`#creatives.{monthId}`) mora da preživi login: ako login preusmerava, sačuvaj `location.hash` i vrati ga posle prijave.
- Folder `media/` (demo kreative) treba samo za demo režim (`data:"demo"`).
- **Link za raspored (gost):** ako adresa počinje sa `#raspored.`, NE prikazuj login i NE zovi `SkeyloCRM.connect`. Samo pozovi
  `SkeyloCRM.connectSchedule(firebase.firestore(), id)` (id = deo posle `#raspored.`). CRM se tada sam zaključa na taj jedan raspored. Važi i kad je neko prijavljen: link uvek otvara samo raspored.

4. **Korisnici** (`users/{uid}`):
   - `{role:"team"}` za Filipa, Luku, Mihajla i Ninu.
   - `{role:"client", clientId:"ils", name:"Ana"}` za Anu.
5. **Pravila (Firestore Rules):** klijent čita samo svoje i piše samo komentare. Beleške tima ne može ni da čita. Tim može sve.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function me() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function isTeam() { return signedIn() && me().role == "team"; }
    function isClientOf(cid) { return signedIn() && me().role == "client" && me().clientId == cid; }

    match /users/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
    }
    match /items/{id}        { allow read: if isClientOf(resource.data.clientId); }
    match /reports/{id}      { allow read: if isClientOf(resource.data.clientId); }
    match /reportChunks/{id} { allow read: if isClientOf(resource.data.clientId); }
    match /scripts/{id}      { allow read: if isClientOf(resource.data.clientId); }
    match /creatives/{id}    { allow read: if isClientOf(resource.data.clientId); }
    // raspored: klijent lista svoje; gost link (nasumičan id) čita samo taj jedan dokument, bez naloga (modeli)
    match /schedules/{id} {
      allow get: if true;
      allow list: if isClientOf(resource.data.clientId);
    }

    // komentari na skripte: klijent čita svoje, ostavlja nove (samo kao "client", nerešene) i briše svoje nerešene
    match /comments/{id} {
      allow read: if isClientOf(resource.data.clientId);
      allow create: if isClientOf(request.resource.data.clientId)
        && request.resource.data.keys().hasOnly(["clientId","scriptId","monthId","text","quote","before","after","author","authorName","authorUid","createdAt","order","resolved"])
        && request.resource.data.author == "client"
        && request.resource.data.authorUid == request.auth.uid
        && request.resource.data.resolved == false
        && request.resource.data.text is string && request.resource.data.text.size() > 0 && request.resource.data.text.size() <= 2000
        && request.resource.data.quote is string && request.resource.data.quote.size() <= 600
        && request.resource.data.before is string && request.resource.data.before.size() <= 80
        && request.resource.data.after is string && request.resource.data.after.size() <= 80
        && request.resource.data.authorName is string && request.resource.data.authorName.size() <= 80
        && request.resource.data.createdAt is int && request.resource.data.order is int
        && get(/databases/$(database)/documents/scripts/$(request.resource.data.scriptId)).data.clientId == request.resource.data.clientId;
      allow delete: if isClientOf(resource.data.clientId)
        && resource.data.authorUid == request.auth.uid
        && resource.data.resolved == false;
    }

    // komentari na kreative: isto, sa vremenom u videu ili brojem slajda
    match /creativeComments/{id} {
      allow read: if isClientOf(resource.data.clientId);
      allow create: if isClientOf(request.resource.data.clientId)
        && request.resource.data.keys().hasOnly(["clientId","creativeId","monthId","text","at","slide","author","authorName","authorUid","createdAt","order","resolved"])
        && request.resource.data.author == "client"
        && request.resource.data.authorUid == request.auth.uid
        && request.resource.data.resolved == false
        && request.resource.data.text is string && request.resource.data.text.size() > 0 && request.resource.data.text.size() <= 2000
        && (request.resource.data.at == null || request.resource.data.at is number)
        && (request.resource.data.slide == null || request.resource.data.slide is int)
        && request.resource.data.authorName is string && request.resource.data.authorName.size() <= 80
        && request.resource.data.createdAt is int && request.resource.data.order is int
        && get(/databases/$(database)/documents/creatives/$(request.resource.data.creativeId)).data.clientId == request.resource.data.clientId;
      allow delete: if isClientOf(resource.data.clientId)
        && resource.data.authorUid == request.auth.uid
        && resource.data.resolved == false;
    }

    // šifre naloga: ceo tim klijenta čita i piše samo svoje; drugi klijenti i gosti ništa
    match /vault/{id} {
      allow read, delete: if isClientOf(resource.data.clientId);
      allow create, update: if isClientOf(request.resource.data.clientId)
        && (resource == null || resource.data.clientId == request.resource.data.clientId)
        && request.resource.data.keys().hasOnly(["clientId","platform","platformName","label","login","password","note","order","createdAt","updatedAt","updatedBy"])
        && request.resource.data.platform is string && request.resource.data.platform.size() <= 20
        && request.resource.data.login is string && request.resource.data.login.size() <= 200
        && request.resource.data.password is string && request.resource.data.password.size() <= 200
        && request.resource.data.note is string && request.resource.data.note.size() <= 300;
    }

    // creativeNotes nema pravilo za klijenta: čita i piše samo tim (pravilo ispod)
    // tim: sve
    match /{document=**} { allow read, write: if isTeam(); }
  }
}
```

6. **Pravila (Storage Rules):** tim otprema i briše, klijent čita samo fajlove svog klijenta.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function me() { return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data; }
    match /creatives/{clientId}/{rest=**} {
      allow read: if request.auth != null && (me().role == "team" || (me().role == "client" && me().clientId == clientId));
      allow write: if request.auth != null && me().role == "team";
    }
  }
}
```

- `getDownloadURL()` daje link koji radi i bez prijave (kao Drive link). Zato se linkovi čuvaju samo u `creatives` dokumentima, koje pravila baze štite po klijentu.

## Provera

- Dodaj izveštaj u OS za neki mesec. Klijentu se u otvorenom CRM-u za sekund pojavi obaveštenje, a izveštaj je na vrhu tog meseca.
- Pomeri skriptu u drugu fazu u Content Manageru. Klijentu se u otvorenom CRM-u laserska linija pomeri do nove faze.
- Kao Ana označi rečenicu u skripti i pošalji komentar. U OS-u: oznaka na kartici skripte, obaveštenje, citat podvučen u editoru.
- U OS-u klikni „Označi kao rešeno“. Kod Ane: „Rešeno“ i podvlaka nestaje.
- Kao Mihajlo prevuci 1 video i 3 slike u Final Creatives (izaberi „Jedan karusel“). Kod Ane u otvorenom CRM-u: „Stigle su 2 nove kreative“, kartice se razvijaju laserom. Video se pušta u punom kvalitetu bez preuzimanja.
- Kao Ana ostavi komentar dok video stoji na 0:07. U OS-u: broj na kartici, obaveštenje „Klijent · …“, komentar sa „0:07“ (klik ga vraća na taj trenutak). „Reši“ → kod Ane „Rešeno“.
- Kao Filip ostavi belešku Mihajlu. Mihajlo dobija obaveštenje. Ana je ne vidi, a čitanje `creativeNotes` Aninim nalogom mora da padne.
- Zameni video novom verzijom. Kod Ane: „Nova verzija · …“, komentari ostaju.
- Export All → ZIP sa svim kreativama meseca u originalnom kvalitetu (proveri da se otvara i da su video fajlovi iste veličine kao originali).
- Prijavi se nalogom drugog klijenta: ILS izveštaji, skripte, kreative, fajlovi i komentari ne smeju da se vide. Pokušaj upisa u `scripts` ili `creatives` sa klijentskim nalogom mora da padne. Blokiraju to pravila baze i Storage-a, ne samo dizajn.
- Kao Ana otvori Privacy, upiši „tajna“, dodaj nalog. Kao drugi korisnik ILS-a (npr. recepcija) otvori Privacy: nalog je tu. Kopiraj mejl i šifru i nalepi ih u beleške: tačno su ono što je upisano.
- Prijavi se nalogom drugog klijenta i iz konzole pokušaj `db.collection("vault").get()`: mora da padne. Isto bez prijave i sa gost linkom.
- Otvori `#raspored.{id}` u privatnom prozoru (bez prijave): vidi se samo taj dan. Promeni adresu u `#reporting` ili `#organisation`: vraća se na raspored. Iz konzole pokušaj čitanje `scripts` ili listanje `schedules`: mora da padne.
- Kao Nina stavi dva entiteta za ILS i jedan za drugog klijenta na isti dan. ILS u CRM-u vidi samo svoje scene (i pauze između njih), drugi klijent samo svoju. „Link za Infinity Laser“ otvara taj dan; pomeri entitet u OS-u, kod klijenta se vreme promeni uživo.
- Pisani izveštaj se otvara u zaštićenom (sandbox) iframe-u, a Loom se pušta u stranici.

## Napomene

- Navigacija u CRM-u ide samo preko `location.hash` (kao u OS-u): `#reporting…`, `#creative`, `#creative.{period}`, `#creative.{period}.{skripta}`, `#creatives`, `#creatives.{period}`, `#creatives.{period}.{kreativa}`, `#organisation`, `#organisation.{raspored}` (klijent), `#raspored.{raspored}` (gost link, zaključan). Ne prebacivati na `history.pushState`: u Claude aplikaciji to ruši stranicu.
- U OS-u: `#fc-{mesec}` i `#fc-{mesec}.{kreativa}`.
- Dugmad u CRM-u ne koriste `<form submit>` (u zaštićenom okviru bez `allow-forms` submit se ne okida). Ostaviti tako.
- Klijent vidi ceo dokument skripte (i polje `angle`), samo ga CRM ne prikazuje. Ništa poverljivo ne upisivati u skripte. Isto važi za `creatives`: naslov kreative klijent vidi.
- U Claude pregledu CRM i OS ne dele bazu: komentari iz CRM pregleda ostaju samo u tom pregledaču, a kreative u OS pregledu se ne pojavljuju u CRM pregledu. Uživo veza radi na sajtu, preko Firebase-a.
- U Claude pregledu OS čuva fajlove u skladištu artefakta: do 20 MB po delu (veći fajl se sam deli na delove, a Export vraća original), bez MOV-a (izvesti MP4). Ukupan prostor artefakta je ograničen.
- **Privacy:** šifra „tajna“ ostaje kako je Filip tražio, ali je samo zavesa u stranici (stoji u kodu CRM-a, svako ko otvori kod je vidi). Šifre stvarno štite **prijava + pravila baze** iznad: bez naloga ILS-a `vault` se ne može pročitati. Zato prave šifre upisivati **samo na sajtu**, posle prijave, nikad u Claude pregledu (tamo su primeri „Primer#…“ i čuvaju se samo u memoriji, nestaju na osvežavanje).
- Gost link (`#raspored.…`) nikad ne učitava `vault` (gost režim ne zove `connect`). Ne dodavati `vault` u gost režim.
- Firestore šifruje podatke na disku, ali šifre u `vault` su čitljive svakom ILS nalogu i timu. Ko napusti Infinity tim: obriši mu nalog u Firebase Auth i promeni šifre koje je znao (olovka → nova šifra).
- Za novog klijenta: kopija CRM fajla, pa promeni `CLIENT` (id, ime, logo) i boje u `:root`.
