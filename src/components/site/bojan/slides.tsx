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
  UserPlus,
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
import {
  Bar,
  NetoLogo,
  PriceTag,
  StoreDots,
  Ticker,
  Timeline,
} from "./visuals";
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
            Šest ljudi i kompletna oprema rade za Neto u celom Novom Sadu,
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
    [<Count key="a" to={24} />, "radnje u Novom Sadu i okolini"],
    [<Count key="b" to={37} delay={0.1} />, "radnji u celom lancu"],
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
      <Headline>Novi Sad je pun Neto radnji. [[Grad to još ne zna.]]</Headline>
      <Sub>
        Mreža je već tu. Jedna kampanja za ceo grad može da pokrene sve radnje
        odjednom.
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
        uđu u radnju. Mi hoćemo da ga čuje ceo Novi Sad.
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
  costLabel: string;
  cost: string;
  gear?: boolean;
}[] = [
  {
    name: "Luka Macura",
    role: "Web developer i CRO",
    img: "/people/luka.webp",
    does: [
      "Pravi ceo novi Neto sajt",
      "Na sajtu gradi Interaktivni Katalog: lokacija, proizvodi i kalkulator uštede",
      "Prati gde ljudi odustaju na sajtu i to popravlja",
    ],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
  },
  {
    name: "Mihajlo Obradović",
    role: "Video producent i direktor postprodukcije",
    img: "/people/mihac.webp",
    does: [
      "Na terenu realizuje skripte koje Filip napiše",
      "Snima u radnjama i po Novom Sadu, sa modelima i voditeljem",
      "Nadgleda sve što montažeri rade, do finalne verzije",
    ],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
  },
  {
    name: "Filip Ruvčeski",
    role: "Strateg i media buyer",
    img: "/people/filip.webp",
    does: [
      "Piše skripte i osmišljava sve oglase i sadržaj",
      "Pravi mesečni plan akcija zajedno sa vama",
      "Vodi Meta kampanju za ceo Novi Sad i okolinu",
      "Svake nedelje šalje izveštaj i objašnjava brojke",
    ],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
  },
  {
    name: "Nina Kostić",
    role: "Organizacija snimanja",
    img: "/people/nina.webp",
    does: [
      "Dogovara termine snimanja sa poslovođama radnji",
      "Organizuje modele, rekvizite i lokacije",
    ],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
  },
  {
    name: "Stefan Stojanović",
    role: "Video editor",
    img: "/people/stefan.webp",
    does: ["Montira video sadržaj", "Kreira dizajne i grafike"],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
  },
  {
    name: "Luka Kuzmanović",
    role: "Video editor",
    img: "/people/kuzma.webp",
    does: ["Montira video sadržaj", "Kreira dizajne i grafike"],
    costLabel: "Na minimalcu, sa doprinosima",
    cost: "~870 €",
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
    one: "Jedna kampanja za ceo Novi Sad, od oglasa do kase",
    points: [
      "Oglas poziva: „Klikni dole i pogledaj gde je tvoj najbliži Neto market“.",
      "Uz dozvolu za lokaciju, Interaktivni Katalog odmah prikazuje najbližu radnju i akcije.",
      "Kupac bira šta mu treba, a katalog uživo računa cenu i koliko štedi.",
      "Na kraju dobija kod NETOTAJNA12 za dodatnih 5% popusta na kasi.",
    ],
    measureLabel: "Merimo:",
    measure:
      "koliko kodova je iskorišćeno na kasama. Tačno vidimo koliko ljudi je kampanja dovela u Neto.",
  },
  {
    icon: Video,
    title: "Sadržaj koji prodaje „Svaki dinar je bitan“",
    one: "Profesionalna produkcija, snimanje po celom Novom Sadu",
    points: [
      "„Korpa od 2.000 dinara“: koliko toga stane u korpu kod vas.",
      "Ulične ankete po Novom Sadu, sa pravim Novosađanima.",
      "Serijal sa vašim zaposlenima. Poznata lica grade poverenje i osećaj „naše radnje“.",
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
    icon: UserPlus,
    title: "Zapošljavanje",
    one: "Kasiri i magacioneri, bez čekanja na oglase",
    points: [
      "Kampanje za posao sa prijavom u dva klika, direktno na telefonu.",
      "Ciljamo ljude iz Novog Sada i okoline koji traže posao.",
      "Kratki video iz radnje, da kandidat zna gde dolazi.",
    ],
    measureLabel: "Merimo:",
    measure: "cenu po prijavi i cenu po zaposlenom.",
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
      "Lični nalozi, sa ličnim kodom za popust za svakog kupca.",
      "Notifikacije kad izađe nova akcija, bez plaćanja oglasa.",
      "Digitalna kartica lojalnosti i istorija kupovine.",
      "Interaktivni Katalog uvek pri ruci, na početnom ekranu.",
    ],
    measureLabel: "Kada:",
    measure:
      "tek posle pilota, ako Interaktivni Katalog pokaže da se ljudi redovno vraćaju. Radi se kao poseban projekat, sa posebnom ponudom. Primer kako bi mogla da izgleda je dva slajda dalje.",
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
        Četiri stuba koja rade zajedno, i dva za kasnije. Otvorite svaki za
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

/* On a phone the order is headline, phone, steps: the thing to touch comes
   before the reading. The text wrapper is `contents` there, so headline and
   steps are grid items that straddle the phone; on a wide screen it is a
   normal column beside the phone. */
function Demo() {
  return (
    <Slide id="demo" theme="light" className="!py-5 md:!py-7">
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
        <div className="contents lg:block">
          <div className="order-1">
            <Headline>
              Interaktivni Katalog. [[Probajte ga kao kupac.]]
            </Headline>
            <Sub>
              Telefon ispod je pravi, klikabilan primer. Od oglasa do koda za
              kasu za manje od minut.
            </Sub>
          </div>
          <div className="order-3">
            <Steps
              caption="Šta kupac prolazi"
              rows={[
                [
                  "Oglas na Instagramu i Facebooku",
                  "Jedan klik vodi u katalog, bez instaliranja.",
                ],
                ["Najbliža radnja", "Uz lokaciju, ili izborom mesta."],
                ["Korpa koja računa", "Kupac vidi cenu i uštedu dok bira."],
                [
                  "Kod za kasu",
                  "NETOTAJNA12 za još 5%. Svaki iskorišćen kod je merljiv.",
                ],
              ]}
            />
          </div>
        </div>
        <motion.div
          variants={pop}
          custom={2}
          className="order-2 w-full lg:order-none lg:w-[340px]"
        >
          <DemoStage radius={46}>
            <CatalogDemo />
          </DemoStage>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 07  The app                                                                */
/* ------------------------------------------------------------------------ */

function TheApp() {
  return (
    <Slide id="app" theme="dark" className="!py-5 md:!py-7">
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
        <div className="contents lg:block">
          <div className="order-1">
            <Headline>
              Neto aplikacija. [[Potencijal za kasnije.]] Nije deo ove ponude.
            </Headline>
            <Sub>
              Ovo je primer kuda može da ide posle pilota, kao poseban projekat.
              Telefon ispod radi kao pravi: dodirnite obaveštenje ili Neto
              ikonicu i vidite lični nalog, lični kod, karticu lojalnosti i
              akcije.
            </Sub>
          </div>
          <div className="order-3">
            <Steps
              dark
              caption="Šta bi kupac dobio"
              rows={[
                [
                  "Obaveštenje bez oglasa",
                  "Nova akcija stiže na telefon, besplatno, svake nedelje.",
                ],
                ["Lični kod i Neto Klub", "Poeni, vaučeri, kartica na kasi."],
                [
                  "Katalog uvek pri ruci",
                  "Lista za kupovinu pre nego što uđe u radnju.",
                ],
              ]}
            />
          </div>
        </div>
        <motion.div
          variants={pop}
          custom={-2}
          className="order-2 w-full lg:order-none lg:w-[350px]"
        >
          <DemoStage radius={60}>
            <AppDemo />
          </DemoStage>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 08  Pilot                                                                  */
/* ------------------------------------------------------------------------ */

function Pilot() {
  return (
    <Slide id="pilot" theme="red">
      <Headline>Prvih 90 dana je test, a ne obećanje.</Headline>
      <Sub>
        Kampanja ide za Novi Sad i okolinu. Radnje van tog područja služe za
        poređenje. Razliku vidite na svojim kasama i kroz iskorišćene kodove.
      </Sub>
      <Visual className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <StoreDots />
          <div className="mt-5 flex flex-wrap gap-x-[22px] gap-y-2.5 text-[15px]">
            <span className="inline-flex items-center gap-2">
              <i
                className="inline-block h-3.5 w-3.5 bg-white"
                style={{ borderRadius: "50% 50% 50% 20%" }}
              />
              Novi Sad i okolina, sa kampanjom
            </span>
            <span className="inline-flex items-center gap-2">
              <i
                className="inline-block h-3.5 w-3.5"
                style={{
                  borderRadius: "50% 50% 50% 20%",
                  boxShadow: "inset 0 0 0 2px #fff",
                }}
              />
              Ostala mesta, za poređenje
            </span>
          </div>
        </div>
        <Timeline
          steps={[
            {
              title: "Mesec 1: postavka",
              body: "Pravimo novi sajt sa Interaktivnim Katalogom, obučavamo kasire za kod, snimamo prvi sadržaj i pokrećemo kampanju za ceo Novi Sad.",
            },
            {
              title: "Mesec 2: optimizacija",
              body: "Nedeljne akcije rade punim tempom. Gasimo ono što ne prodaje, pojačavamo ono što prodaje.",
            },
            {
              title: "Mesec 3: rezultat",
              body: "Poredimo promet u Novom Sadu sa ostalim mestima i brojimo iskorišćene kodove. Zajedno odlučujemo o širenju na ceo lanac.",
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
    ["Iskorišćeni kodovi", "na kasama"],
    ["Posete Interaktivnom Katalogu", "i izabrani proizvodi"],
    ["Prodaja artikala sa akcije", "u Novom Sadu"],
    ["Članovi Viber zajednice", "rast nedeljno"],
    ["Cena po zaposlenom", "kampanje za posao"],
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
              "Web developer",
              "Organizatorka snimanja",
              "Novi sajt sa Interaktivnim Katalogom",
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
            Troškovi modela i ad budžet se dogovaraju pre svakog meseca. Posle
            pilota zajedno odlučujemo o nastavku.
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
  /* A slide with a clickable phone: the bar asks for it to be tried first. */
  demo?: boolean;
}[] = [
  { id: "cover", label: "Neto × Skeylo", theme: "dark", Component: Cover },
  { id: "facts", label: "Gde ste sada", theme: "light", Component: Facts },
  { id: "crew", label: "Vaš tim", theme: "paper", Component: Crew },
  { id: "versus", label: "Koliko to košta", theme: "dark", Component: Versus },
  { id: "pillars", label: "Šta radimo", theme: "paper", Component: Pillars },
  {
    id: "demo",
    label: "Interaktivni Katalog",
    theme: "light",
    Component: Demo,
    demo: true,
  },
  {
    id: "app",
    label: "Aplikacija (kasnije)",
    theme: "dark",
    Component: TheApp,
    demo: true,
  },
  { id: "pilot", label: "Prvih 90 dana", theme: "red", Component: Pilot },
  { id: "kpi", label: "Šta pratimo", theme: "light", Component: Kpi },
  { id: "proof", label: "Šta smo uradili", theme: "paper", Component: Proof },
  { id: "price", label: "Ponuda", theme: "dark", Component: Price },
];
