"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Handshake,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Smartphone,
  Video,
} from "lucide-react";
import {
  Count,
  DISPLAY,
  EASE_OUT,
  Headline,
  MONO,
  NETO_RADIUS,
  RED,
  Slide,
  Sub,
  Visual,
  item,
  pop,
  useSlideActive,
  useTheme,
  type Theme,
} from "./primitives";
import { Bar, NetoLogo, PriceTag, Ticker, Timeline } from "./visuals";
import CatalogDemo from "./CatalogDemo";
import AppDemo from "./AppDemo";
import { DemoStage } from "./DemoStage";

/* ------------------------------------------------------------------------ */
/* 01  Cover                                                                  */
/* ------------------------------------------------------------------------ */

function Cover() {
  return (
    <Slide
      id="cover"
      theme="dark"
      eyebrow={false}
      className="!px-0 !py-0 [&>div]:flex-1"
    >
      <CoverBody />
    </Slide>
  );
}

/* Split out so the hooks read the Slide's own contexts, not the defaults. */
function CoverBody() {
  const active = useSlideActive();
  const fade = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: active ? 1 : 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  });
  return (
    <>
      <div className="flex flex-1 flex-col justify-center px-5 pb-6 pt-9 md:px-10 md:pb-8 md:pt-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <NetoLogo className="w-[min(58vw,240px)] md:w-[340px]" delay={0.15} />
          <motion.div
            aria-hidden
            className="mt-1.5 text-[clamp(20px,6vw,28px)] font-medium tracking-[0.16em]"
            {...fade(0.7)}
          >
            DISKONTI
          </motion.div>
          <motion.div
            className="mt-5 flex items-center gap-3.5 text-[18px] font-bold md:mt-7"
            {...fade(0.95)}
          >
            <span className="text-[22px]" style={{ color: RED }}>
              ×
            </span>
            Skeylo
          </motion.div>
          <motion.h1
            className="mt-6 text-center text-[clamp(2.2rem,10vw,4.2rem)] font-extrabold italic leading-[1.02] tracking-[-0.01em] md:mt-9"
            initial={{ opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE_OUT }}
          >
            Ceo marketing tim.
          </motion.h1>
          <motion.p
            className="mt-3 max-w-[32ch] text-center text-[17px] md:mt-4 md:text-[19px]"
            style={{ color: "#CFCFCF" }}
            {...fade(1.4)}
          >
            Šest ljudi i kompletna oprema rade za Neto u Novom Sadu i okolini,
            svakog meseca.
          </motion.p>
          <motion.p
            className="mt-5 text-center text-[13px] md:mt-7"
            style={{ color: "#8A8A8A", fontFamily: MONO }}
            {...fade(1.6)}
          >
            Ponuda za saradnju, septembar 2026.
          </motion.p>
        </div>
      </div>
      <motion.div className="mt-auto w-full" {...fade(1.8)}>
        <Ticker />
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 02  Where you are                                                          */
/* ------------------------------------------------------------------------ */

function Facts() {
  return (
    <Slide id="facts" theme="light">
      <FactsBody />
    </Slide>
  );
}

function FactsBody() {
  const t = useTheme();
  const facts: [ReactNode, string][] = [
    [<Count key="a" to={24} />, "maloprodajna objekta u Novom Sadu i okolini"],
    [
      <Count key="b" to={37} delay={0.1} />,
      "maloprodajnih objekata u celom lancu",
    ],
    [
      <Count key="c" to={14} suffix="h" delay={0.2} />,
      "otvoreno svaki dan, 7 do 21",
    ],
    [
      <Count key="d" to={8} suffix="k" delay={0.3} />,
      "pratilaca na Instagramu",
    ],
  ];
  return (
    <>
      <Headline>
        Novi Sad je pun Neto maloprodajnih objekata. [[Grad to još ne zna.]]
      </Headline>
      <Sub>
        Mreža je već tu. Jedna kampanja za Novi Sad i okolinu može da pokrene
        sve maloprodajne objekte odjednom.
      </Sub>
      <Visual>
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderTop: "2px solid #000" }}
        >
          {facts.map(([v, l], i) => (
            <motion.div
              key={l}
              variants={item}
              className="py-5 md:px-4 md:py-6"
              style={{
                borderBottom: `1px solid ${t.line}`,
                borderRight: i % 2 === 0 ? `1px solid ${t.line}` : undefined,
                paddingRight: i % 2 === 0 ? 14 : 0,
                paddingLeft: i % 2 === 1 ? 16 : 0,
              }}
            >
              <strong
                className="block text-[40px] font-extrabold italic leading-none md:text-[52px]"
                style={{ color: RED }}
              >
                {v}
              </strong>
              <span className="mt-1.5 block text-[15px]">{l}</span>
            </motion.div>
          ))}
        </div>
      </Visual>
      <motion.p
        variants={item}
        className="mt-5 max-w-2xl text-[15px] md:text-[16px]"
        style={{ color: t.muted }}
      >
        Slogan „Svaki dinar je bitan“ je jak. Danas ga čuju samo oni koji već
        uđu u maloprodajni objekat. Mi hoćemo da ga čuju svi u Novom Sadu i
        okolini.
      </motion.p>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* 03  The crew                                                               */
/* ------------------------------------------------------------------------ */

const CREW: {
  name: string;
  role: string;
  img?: string;
  does: string[];
  costLabel?: string;
  cost?: string;
  gear?: boolean;
}[] = [
  {
    name: "Luka Macura",
    role: "Informacione tehnologije",
    img: "/people/luka.webp",
    does: [
      "Pravi kompletan novi Neto websajt",
      "Istražuje i dogovara se sa vašim softverskim timom oko sistema",
      "Dogovara se sa timom oko povezanosti i usklađenosti reklama i kampanje sa sajtom",
      "Mobilne aplikacije",
    ],
  },
  {
    name: "Mihajlo Obradović",
    role: "Video producent i direktor postprodukcije",
    img: "/people/mihac.webp",
    does: [
      "Na terenu realizuje skripte koje Filip napiše",
      "Snima u maloprodajnim objektima i po Novom Sadu, sa modelima i voditeljem",
      "Nadgleda sve što montažeri rade, do finalne verzije",
    ],
  },
  {
    name: "Filip Ruvčeski",
    role: "Strateg i media buyer",
    img: "/people/filip.webp",
    does: [
      "Piše skripte i osmišljava sve oglase i sadržaj",
      "Pravi mesečni plan akcija zajedno sa vama",
      "Vodi Meta kampanju za Novi Sad i okolinu",
      "Svake nedelje šalje izveštaj i objašnjava brojke",
    ],
  },
  {
    name: "Nina Kostić",
    role: "Organizacija snimanja",
    img: "/people/nina.webp",
    does: [
      "Dogovara termine snimanja sa poslovođama maloprodajnih objekata",
      "Organizuje modele, rekvizite i lokacije",
    ],
  },
  {
    name: "Stefan Stojanović",
    role: "Video editor",
    img: "/people/stefan.webp",
    does: ["Montira video sadržaj", "Kreira dizajne i grafike"],
  },
  {
    name: "Luka Kuzmanović",
    role: "Video editor",
    img: "/people/kuzma.webp",
    does: ["Montira video sadržaj", "Kreira dizajne i grafike"],
  },
  {
    name: "Oprema i alati",
    role: "Već je naša",
    gear: true,
    does: [
      "Dve kamere, profesionalno osvetljenje i mikrofoni",
      "Programi za montažu, dizajn i praćenje rezultata",
    ],
    costLabel: "Da je kupujete sami",
    cost: "više od 6.000 €",
  },
];

function Bullet({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <li className="relative py-[5px] pl-[22px] text-[15px] leading-[1.4] md:text-[16px]">
      <span
        aria-hidden
        className="absolute left-0 top-[12px] h-2.5 w-2.5"
        style={{
          background: dark ? "#FF6B63" : RED,
          borderRadius: "3px 3px 3px 0",
        }}
      />
      {children}
    </li>
  );
}

function Crew() {
  return (
    <Slide id="crew" theme="paper">
      <Headline>Vaš marketing tim. [[Svi rade za Neto.]]</Headline>
      <Sub>
        Ne dobijate agenciju koja se javi jednom mesečno. Dobijate šest ljudi
        kojima je Neto posao svakog dana.
      </Sub>
      <Visual className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CREW.map((m, i) => (
          <motion.article
            key={m.name}
            variants={pop}
            custom={i % 2 ? 1.5 : -1.5}
            className="flex flex-col overflow-hidden px-[18px] pt-5"
            style={{
              background: m.gear ? "#000" : "#fff",
              color: m.gear ? "#fff" : "#1A1A1A",
              border: "2px solid #000",
              borderRadius: NETO_RADIUS,
            }}
          >
            <div className="grid grid-cols-[64px_1fr] items-center gap-3.5">
              {m.gear ? (
                <span
                  className="grid h-[52px] w-[52px] place-items-center text-white"
                  style={{
                    background: RED,
                    borderRadius: "14px 14px 14px 4px",
                  }}
                >
                  <Camera size={26} />
                </span>
              ) : (
                <Image
                  src={m.img!}
                  alt={m.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  style={{
                    background: "#111",
                    boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${RED}`,
                  }}
                />
              )}
              <div>
                <div className="text-[19px] font-extrabold leading-[1.15]">
                  {m.name}
                </div>
                <span
                  className="mt-0.5 block text-[15px] font-medium"
                  style={{ color: m.gear ? "#FF6B63" : RED }}
                >
                  {m.role}
                </span>
              </div>
            </div>
            <ul className="mt-3.5 flex-1">
              {m.does.map((d) => (
                <Bullet key={d} dark={m.gear}>
                  {d}
                </Bullet>
              ))}
            </ul>
            {m.cost ? (
              <div
                className="-mx-[18px] mt-4 flex justify-between gap-3 px-[18px] py-3 text-[14px]"
                style={{
                  background: m.gear ? "#1C1C1C" : "#F7F6F2",
                  borderTop: `1px solid ${m.gear ? "#333" : "#E4E2DC"}`,
                  color: m.gear ? "#9A9A9A" : "#6B6B6B",
                }}
              >
                <span>{m.costLabel}</span>
                <b
                  className="whitespace-nowrap"
                  style={{ color: m.gear ? "#fff" : "#1A1A1A" }}
                >
                  {m.cost}
                </b>
              </div>
            ) : (
              <div className="pb-5" />
            )}
          </motion.article>
        ))}
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 04  Versus                                                                 */
/* ------------------------------------------------------------------------ */

function Versus() {
  return (
    <Slide id="versus" theme="dark">
      <Headline>Čak i na minimalcu, [[ovaj tim vas košta više.]]</Headline>
      <Sub>
        Šest plata sa doprinosima, bez opreme, bez zamene kad neko ode na
        bolovanje. Ili jedan tim koji je već uigran.
      </Sub>
      <Visual className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div
          className="px-5 pb-6 pt-6 md:px-7"
          style={{
            background: "#0d0d0d",
            border: "1px solid #222",
            borderRadius: "4px 26px 4px 4px",
          }}
        >
          <div>
            <div
              className="flex items-baseline justify-between gap-2.5 text-[15px]"
              style={{ color: "#CFCFCF" }}
            >
              <span>6 zaposlenih na minimalcu</span>
              <b className="whitespace-nowrap text-[30px] font-black italic text-white md:text-[34px]">
                <Count to={5220} /> €
              </b>
            </div>
            <Bar pct={100} color="#5A5A5A" />
          </div>
          <div className="mt-6">
            <div
              className="flex items-baseline justify-between gap-2.5 text-[15px]"
              style={{ color: "#CFCFCF" }}
            >
              <span>Skeylo za Neto</span>
              <b className="whitespace-nowrap text-[30px] font-black italic text-white md:text-[34px]">
                <Count to={3500} delay={0.5} /> €{" "}
                <small
                  className="text-[14px] font-bold not-italic"
                  style={{ color: "#B5B5B5" }}
                >
                  + PDV
                </small>
              </b>
            </div>
            <Bar pct={67} color={RED} delay={0.5} />
          </div>
          <p
            className="mt-5 pt-[18px] text-[16px] md:text-[17px]"
            style={{ borderTop: "1px dashed #444", color: "#E6E6E6" }}
          >
            Bez zapošljavanja, bolovanja, godišnjih odmora i kupovine opreme.
          </p>
        </div>
        <motion.div
          variants={item}
          className="bg-white px-5 py-5 text-[#1A1A1A]"
          style={{ border: `2px dashed ${RED}`, borderRadius: NETO_RADIUS }}
        >
          <Handshake size={26} style={{ color: RED }} />
          <b className="mt-3 block text-[21px] font-extrabold italic leading-[1.2] text-black md:text-[24px]">
            Vaš posao: odobrite plan jednom nedeljno.
          </b>
          <p className="mt-2 text-[16px]">
            Sve ostalo radimo mi: ideje, snimanje, montažu, oglase, sajt, Viber
            i izveštaje.
          </p>
        </motion.div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 05  Pillars                                                                */
/* ------------------------------------------------------------------------ */

const PILLARS: {
  icon: React.ElementType;
  title: string;
  one: string;
  points: string[];
  measureLabel: string;
  measure: string;
  potential?: boolean;
}[] = [
  {
    icon: MapPin,
    title: "Interaktivni Katalog",
    one: "Jedna kampanja za Novi Sad i okolinu, od oglasa do kase",
    points: [
      "Oglas poziva: „Klikni dole i pogledaj gde je tvoj najbliži Neto market“.",
      "Uz dozvolu za lokaciju, Interaktivni Katalog odmah prikazuje najbliži maloprodajni objekat i akcije.",
      "Kupac bira šta mu treba, a katalog uživo računa cenu i koliko štedi.",
      "Na kraju dobija kod NETOTAJNA12 za dodatnih 2% popusta na kasi.",
      "Admin panel: vaši administratori na jednom mestu dodaju, menjaju i brišu artikle i prikazuju popuste. Katalog se odmah ažurira.",
      "Neophodno je da odmah stupimo u kontakt sa vašim softverskim timom i sa njima razjasnimo mogućnosti za implementaciju promo koda, kako bi ceo sistem bio najoptimalniji mogući.",
    ],
    measureLabel: "Merimo:",
    measure:
      "posete katalogu, izabrane proizvode i klikove na najbliži objekat. Kako se kod prati na kasi dogovaramo sa vašim softverskim timom.",
  },
  {
    icon: Video,
    title: "Sadržaj koji prodaje „Svaki dinar je bitan“",
    one: "Profesionalna produkcija, snimanje po Novom Sadu i okolini",
    points: [
      "„Korpa od 2.000 dinara“: koliko toga stane u korpu kod vas.",
      "Ulične ankete po Novom Sadu, sa pravim Novosađanima.",
      "Serijal sa vašim zaposlenima. Poznata lica grade poverenje i osećaj „naš Neto“.",
    ],
    measureLabel: "Merimo:",
    measure: "doseg u Novom Sadu, pregleda do kraja i rast pratilaca.",
  },
  {
    icon: MessageCircle,
    title: "Viber zajednica i sajt",
    one: "Sopstvena publika koja ne zavisi od oglasa",
    points: [
      "Viber zajednica koja svake nedelje dobija novi Interaktivni Katalog.",
      "Posle koda za popust, kupac jednim klikom ulazi u Viber zajednicu.",
      "Svaki oglas i svaki video vodi ljude u zajednicu, pa svaka kampanja ostavlja trajnu vrednost.",
    ],
    measureLabel: "Merimo:",
    measure: "broj članova i koliko njih otvori Interaktivni Katalog.",
  },
  {
    icon: Handshake,
    title: "Dobavljači finansiraju deo marketinga",
    one: "Opcija koju možemo da razvijemo kasnije",
    points: [
      "Brendovi čije proizvode prodajete imaju budžete za promociju.",
      "Dobavljač plaća istaknuto mesto u vašoj akciji nedelje ili u sadržaju.",
      "Na taj način deo mesečnog troška pokriva neko treći.",
    ],
    measureLabel: "Kada:",
    measure: "posle pilota, kad imamo brojke koje pokazujemo dobavljačima.",
    potential: true,
  },
  {
    icon: Smartphone,
    title: "Neto aplikacija za telefon",
    one: "Potencijal za kasnije, nije deo ove ponude",
    points: [
      "Aplikacija nalik MojMaxi: kupac pokaže kod na kasi u Neto Marketu i dobije popust, na primer 200 din za račun preko 2.000 din.",
      "Notifikacije kad izađe nova akcija, bez plaćanja oglasa.",
      "Digitalna kartica lojalnosti i istorija kupovine.",
      "Prvi korak je sastanak sa timom koji vodi artikle i softver, da razumemo kako sistem i baza rade i povežemo ih sa aplikacijom.",
    ],
    measureLabel: "Kada:",
    measure:
      "tek posle pilota, kao poseban projekat sa posebnom ponudom. Pre toga zajedno prolazimo vaš postojeći sistem i logiku baze podataka. Primer kako bi mogla da izgleda je nekoliko slajdova dalje.",
    potential: true,
  },
];

function Pillar({
  p,
  open,
  onToggle,
}: {
  p: (typeof PILLARS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = p.icon;
  return (
    <motion.div
      variants={item}
      className="overflow-hidden"
      style={{
        border: p.potential ? "2px dashed #9A9A9A" : "2px solid #000",
        background: p.potential ? "#F7F6F2" : "#fff",
        borderRadius: NETO_RADIUS,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full cursor-pointer grid-cols-[52px_1fr_26px] items-center gap-3.5 px-[18px] py-[18px] pl-4 text-left"
        style={{ fontFamily: DISPLAY }}
      >
        <span
          aria-hidden
          className="grid h-[52px] w-[52px] place-items-center"
          style={{
            background: p.potential ? "#fff" : RED,
            color: p.potential ? RED : "#fff",
            border: p.potential ? `2px dashed ${RED}` : undefined,
            borderRadius: "14px 14px 14px 4px",
          }}
        >
          <Icon size={26} />
        </span>
        <span className="text-[19px] font-extrabold leading-[1.15] text-black md:text-[20px]">
          {p.title}
          {p.potential && (
            <span className="ml-2 inline-block rounded-[20px] bg-black px-[9px] py-[3px] align-[3px] text-[12px] font-bold text-white">
              Potencijal
            </span>
          )}
          <span
            className="mt-[3px] block text-[15px] font-normal leading-[1.35]"
            style={{ color: "#6B6B6B" }}
          >
            {p.one}
          </span>
        </span>
        <motion.span
          aria-hidden
          className="grid h-[26px] w-[26px] place-items-center rounded-full"
          animate={{
            background: open ? RED : "rgba(226,35,26,0)",
            borderColor: open ? RED : "#000",
            color: open ? "#fff" : "#000",
            rotate: open ? 90 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{ border: "2px solid #000" }}
        >
          <motion.span
            animate={{ rotate: open ? -90 : 0 }}
            transition={{ duration: 0.3 }}
            className="grid place-items-center"
          >
            {open ? (
              <Minus size={14} strokeWidth={3} />
            ) : (
              <Plus size={14} strokeWidth={3} />
            )}
          </motion.span>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: EASE_OUT },
              opacity: { duration: 0.25 },
            }}
            className="overflow-hidden"
          >
            <div
              className="px-[18px] pb-5"
              style={{ borderTop: "1px solid #E4E2DC" }}
            >
              <ul className="mt-3.5">
                {p.points.map((pt) => (
                  <li
                    key={pt}
                    className="relative py-[7px] pl-[22px] text-[15.5px] md:text-[16px]"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[15px] h-2.5 w-2.5"
                      style={{ background: RED, borderRadius: "3px 3px 3px 0" }}
                    />
                    {pt}
                  </li>
                ))}
              </ul>
              <p
                className="mt-3 rounded-[10px] px-3.5 py-3 text-[15px]"
                style={{ background: p.potential ? "#fff" : "#F7F6F2" }}
              >
                <b style={{ color: RED }}>{p.measureLabel}</b> {p.measure}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Pillars() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Slide id="pillars" theme="paper">
      <Headline>Šta radimo, [[svakog meseca.]]</Headline>
      <Sub>
        Tri stuba koja rade zajedno, i dva za kasnije. Otvorite svaki za
        detalje.
      </Sub>
      <Visual className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {PILLARS.map((p, i) => (
          <Pillar
            key={p.title}
            p={p}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 06  Demo                                                                   */
/* ------------------------------------------------------------------------ */

function Steps({
  rows,
  dark = false,
  caption,
}: {
  rows: [string, string][];
  dark?: boolean;
  caption?: string;
}) {
  return (
    <ol className="mt-6 flex flex-col gap-4 md:mt-8">
      {caption && (
        <motion.li
          variants={item}
          aria-hidden
          className="text-[10px] uppercase tracking-[0.14em] lg:hidden"
          style={{ fontFamily: MONO, color: "#8A8A8A" }}
        >
          {caption}
        </motion.li>
      )}
      {rows.map(([k, v], i) => (
        <motion.li key={k} variants={item} className="flex gap-3.5">
          <span
            className="grid h-8 w-8 flex-none place-items-center text-[14px] font-black italic text-white"
            style={{ background: RED, borderRadius: "50% 50% 50% 12%" }}
          >
            {i + 1}
          </span>
          <span>
            <span className="block text-[16px] font-extrabold md:text-[17px]">
              {k}
            </span>
            <span
              className="mt-0.5 block text-[14.5px] leading-relaxed md:text-[15px]"
              style={{ color: dark ? "#B5B5B5" : "#6B6B6B" }}
            >
              {v}
            </span>
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

/* Each demo takes two slides: first the story, then the phone alone, drawn
   as large as the stage allows, so it reads as a phone to be touched. */
function Demo() {
  return (
    <Slide id="demo" theme="light">
      <Headline>Interaktivni Katalog. [[Probajte ga kao kupac.]]</Headline>
      <Sub>
        Na sledećem slajdu je pravi, klikabilan telefon. Od oglasa do koda za
        kasu za manje od minut.
      </Sub>
      <div className="max-w-2xl">
        <Steps
          caption="Šta kupac prolazi"
          rows={[
            [
              "Oglas na Instagramu i Facebooku",
              "Jedan klik vodi u katalog, bez instaliranja.",
            ],
            [
              "Najbliži maloprodajni objekat",
              "Uz lokaciju, ili izborom mesta.",
            ],
            ["Korpa koja računa", "Kupac vidi cenu i uštedu dok bira."],
            [
              "Kod za kasu i Viber",
              "NETOTAJNA12 za još 2%, pa jedan klik do Viber zajednice. Način primene koda usklađujemo sa vašim softverskim timom.",
            ],
          ]}
        />
      </div>
    </Slide>
  );
}

function DemoPhone() {
  return (
    <Slide id="demo-phone" theme="light" eyebrow={false} className="!py-4">
      <motion.div variants={pop} custom={2} className="w-full">
        <DemoStage>
          <CatalogDemo />
        </DemoStage>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 07  The app                                                                */
/* ------------------------------------------------------------------------ */

function TheApp() {
  return (
    <Slide id="app" theme="dark">
      <Headline>
        Neto aplikacija. [[Potencijal za kasnije.]] Nije deo ove ponude.
      </Headline>
      <Sub>
        Aplikacija nalik MojMaxi, kao poseban projekat posle pilota: kupac
        pokaže kod na kasi i dobije popust, na primer 200 din za račun preko
        2.000 din. Pre toga je potreban sastanak sa timom koji vodi artikle i
        softver, da razumemo postojeći sistem i bazu i povežemo ih sa
        aplikacijom. Telefon na sledećem slajdu radi kao pravi: dodirnite
        obaveštenje ili Neto ikonicu.
      </Sub>
      <div className="max-w-2xl">
        <Steps
          dark
          caption="Šta bi kupac dobio"
          rows={[
            [
              "Obaveštenje bez oglasa",
              "Nova akcija stiže na telefon, besplatno, svake nedelje.",
            ],
            [
              "Kod na kasi",
              "Kupac pokaže kod i dobije popust, npr. 200 din za račun preko 2.000.",
            ],
            [
              "Katalog uvek pri ruci",
              "Lista za kupovinu pre nego što uđe u maloprodajni objekat.",
            ],
          ]}
        />
      </div>
    </Slide>
  );
}

function AppPhone() {
  return (
    <Slide id="app-phone" theme="dark" eyebrow={false} className="!py-4">
      <motion.div variants={pop} custom={-2} className="w-full">
        <DemoStage>
          <AppDemo />
        </DemoStage>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 08  Pilot                                                                  */
/* ------------------------------------------------------------------------ */

function Pilot() {
  return (
    <Slide id="pilot" theme="red">
      <Headline>Ovako će izgledati saradnja.</Headline>
      <Sub>Tri koraka, redom. Svaki sledeći se oslanja na prethodni.</Sub>
      <Visual className="max-w-3xl">
        <Timeline
          steps={[
            {
              title: "Prvo",
              body: "Sastanak sa vašim softverskim timom: razjašnjavamo mogućnosti za promo kod i kako se sistem povezuje sa sajtom. Pravimo novi sajt sa Interaktivnim Katalogom i admin panelom za artikle i popuste.",
            },
            {
              title: "Drugo",
              body: "Snimamo prvi sadržaj, pokrećemo Meta kampanju za Novi Sad i okolinu i otvaramo Viber zajednicu. Svake nedelje šaljemo izveštaj i plan akcija za sledeću nedelju.",
            },
            {
              title: "Treće",
              body: "Gasimo ono što ne prodaje, pojačavamo ono što prodaje. Kad imamo brojke, zajedno odlučujemo o širenju na ceo lanac i o aplikaciji.",
            },
          ]}
        />
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 09  KPI                                                                    */
/* ------------------------------------------------------------------------ */

function Kpi() {
  const rows: [string, string][] = [
    ["Posete Interaktivnom Katalogu", "i izabrani proizvodi"],
    ["Klikovi na najbliži objekat", "iz kataloga i oglasa"],
    ["Prodaja artikala sa akcije", "u Novom Sadu i okolini, iz vaših podataka"],
    ["Članovi Viber zajednice", "rast nedeljno"],
  ];
  return (
    <Slide id="kpi" theme="light">
      <Headline>Šta pratimo, [[svake nedelje.]]</Headline>
      <Sub>
        Izveštaj stiže svake nedelje, sa objašnjenjem, a ne samo tabelom.
      </Sub>
      <Visual>
        <div className="max-w-3xl" style={{ borderTop: "2px solid #000" }}>
          {rows.map(([k, v]) => (
            <motion.div
              key={k}
              variants={item}
              className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3.5 py-4"
              style={{ borderBottom: "1px solid #E4E2DC" }}
            >
              <CheckCircle2
                size={18}
                className="translate-y-[3px]"
                style={{ color: RED }}
              />
              <b className="text-[17px] font-bold md:text-[18px]">{k}</b>
              <span
                className="text-right text-[14px]"
                style={{ color: "#6B6B6B" }}
              >
                {v}
              </span>
            </motion.div>
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 10  Proof                                                                  */
/* ------------------------------------------------------------------------ */

function Proof() {
  const cases: {
    logo: string;
    round?: boolean;
    name: string;
    where: string;
    stat: string;
    statLabel: string;
    body: string;
  }[] = [
    {
      logo: "/logos/ils-logo.webp",
      round: true,
      name: "Infinity Laser Studio",
      where: "Novi Sad, kompletna saradnja",
      stat: "Pun",
      statLabel: "kapacitet termina posle kampanje",
      body: "Sajt, sadržaj i oglasi iz jednog tima. Studio je došao do punog rasporeda.",
    },
    {
      logo: "/logos/egotike.webp",
      name: "EgoTike",
      where: "online prodaja patika",
      stat: "~11x",
      statLabel: "povrat na ad budžet za 17 dana",
      body: "Više ciklusa kampanja i kreativa.",
    },
  ];
  return (
    <Slide id="proof" theme="paper">
      <Headline>Šta je ovaj tim [[već uradio.]]</Headline>
      <Sub>
        Skeylo je agencija iz Novog Sada. Radimo dugoročno, sa malim brojem
        klijenata, da bi svaki dobio pun tim.
      </Sub>
      <Visual className="grid gap-4 md:grid-cols-2">
        {cases.map((c, i) => (
          <motion.div
            key={c.name}
            variants={pop}
            custom={i ? 1.5 : -1.5}
            className="bg-black px-5 py-[22px] text-white"
            style={{ borderRadius: NETO_RADIUS }}
          >
            <div className="flex items-center gap-3.5">
              <Image
                src={c.logo}
                alt={`${c.name} logo`}
                width={64}
                height={64}
                className={`h-16 w-16 flex-none object-contain ${c.round ? "rounded-full" : "rounded-[14px_14px_14px_4px] bg-white p-1.5"}`}
              />
              <div>
                <b className="block text-[22px] font-extrabold italic leading-[1.1]">
                  {c.name}
                </b>
                <small
                  className="mt-0.5 block text-[14px]"
                  style={{ color: "#9A9A9A" }}
                >
                  {c.where}
                </small>
              </div>
            </div>
            <div
              className="mt-[18px] flex items-baseline gap-3 py-3.5"
              style={{
                borderTop: "1px dashed #444",
                borderBottom: "1px dashed #444",
              }}
            >
              <strong
                className="text-[44px] font-black italic leading-none"
                style={{ color: RED }}
              >
                {c.stat}
              </strong>
              <span
                className="text-[15px] leading-[1.3]"
                style={{ color: "#DDD" }}
              >
                {c.statLabel}
              </span>
            </div>
            <p className="mt-3 text-[15px]" style={{ color: "#BDBDBD" }}>
              {c.body}
            </p>
          </motion.div>
        ))}
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 11  Price                                                                  */
/* ------------------------------------------------------------------------ */

function Price() {
  return (
    <Slide id="price" theme="dark">
      <Headline center>Ceo tim. [[Jedna cena.]]</Headline>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        <motion.div variants={item}>
          <PriceTag
            forWhom="Ceo tim za Neto diskonte"
            amount="3.500"
            currency="€"
            per="mesečno + 20% PDV"
            items={[
              "Strateg i media buyer",
              "Video producent i direktor postprodukcije",
              "Dva video editora",
              "Informacione tehnologije",
              "Organizatorka snimanja",
              "Novi sajt sa Interaktivnim Katalogom",
              "Admin panel za artikle i popuste",
              "Sva oprema i alati",
              "Nedeljni izveštaj i poziv",
            ]}
          />
        </motion.div>
        <div>
          <motion.div
            variants={item}
            className="mt-4 lg:mt-0"
            style={{ borderTop: "1px solid #333" }}
          >
            {[
              ["Troškovi modela", "okvirno 800 €"],
              ["Ad budžet, plaća se direktno Meti", "od 1.500 €"],
              ["Trajanje pilota", "90 dana"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-4 py-4 text-[16px]"
                style={{ borderBottom: "1px solid #333" }}
              >
                <span style={{ color: "#B5B5B5" }}>{k}</span>
                <b className="whitespace-nowrap">{v}</b>
              </div>
            ))}
          </motion.div>
          <motion.p
            variants={item}
            className="mt-[18px] text-[14px]"
            style={{ color: "#8A8A8A" }}
          >
            Plaćanje je na početku svakog meseca saradnje. Troškovi modela i ad
            budžet se dogovaraju pre svakog meseca. Posle pilota zajedno
            odlučujemo o nastavku.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-10 text-[14px]"
            style={{ color: "#8A8A8A" }}
          >
            <strong className="block text-[22px] font-extrabold italic text-white">
              Svaki dinar je bitan.
            </strong>
            I svaki dinar u marketingu. Skeylo, Novi Sad
          </motion.div>
        </div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */

export const SLIDES: {
  id: string;
  label: string;
  theme: Theme;
  Component: () => React.JSX.Element;
}[] = [
  { id: "cover", label: "Neto × Skeylo", theme: "dark", Component: Cover },
  { id: "facts", label: "Gde ste sada", theme: "light", Component: Facts },
  { id: "crew", label: "Vaš tim", theme: "paper", Component: Crew },
  { id: "pillars", label: "Šta radimo", theme: "paper", Component: Pillars },
  {
    id: "demo",
    label: "Interaktivni Katalog",
    theme: "light",
    Component: Demo,
  },
  {
    id: "demo-phone",
    label: "Interaktivni Katalog: demo",
    theme: "light",
    Component: DemoPhone,
  },
  {
    id: "app",
    label: "Aplikacija (kasnije)",
    theme: "dark",
    Component: TheApp,
  },
  {
    id: "app-phone",
    label: "Aplikacija: demo",
    theme: "dark",
    Component: AppPhone,
  },
  { id: "pilot", label: "Tok saradnje", theme: "red", Component: Pilot },
  { id: "kpi", label: "Šta pratimo", theme: "light", Component: Kpi },
  { id: "proof", label: "Šta smo uradili", theme: "paper", Component: Proof },
  { id: "versus", label: "Koliko to košta", theme: "dark", Component: Versus },
  { id: "price", label: "Ponuda", theme: "dark", Component: Price },
];
