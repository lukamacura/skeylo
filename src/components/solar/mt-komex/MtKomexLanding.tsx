"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building,
  CalendarClock,
  ClipboardCheck,
  FileSignature,
  HardHat,
  Mail,
  Phone,
  Play,
  PlugZap,
  Quote,
  Ruler,
  Sun,
  Calculator as CalcIcon,
  Factory,
  Leaf,
  Receipt,
  SunMedium,
  TrendingUp,
  Warehouse,
  LayoutGrid,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CalculatorEmbed, { useIsWide } from "./CalculatorEmbed";
import SeasonChart, { PROFILES } from "./SeasonChart";
import {
  EMAIL,
  PHONE,
  PHONE_HREF,
  compute,
  euro,
  kwText,
  scrollToId,
  yearsText,
} from "./shared";

/* ───────────── Pomoćne ───────────── */

const IMG = "/calculator/mt-komex";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { type: "spring" as const, stiffness: 140, damping: 22 },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#fbae17]">
      {children}
    </p>
  );
}

function H2({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-[28px] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px] ${className}`}
    >
      {children}
    </h2>
  );
}

function CtaButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#fbae17] px-6 py-3 sm:whitespace-nowrap text-base font-extrabold text-[#141414] shadow-[0_12px_36px_-12px_rgba(251,174,23,0.8)] transition hover:-translate-y-0.5 hover:brightness-105 ${className}`}
    >
      {children}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

/* ───────────── Sadržaj ───────────── */

const HEADLINE: [string, string] = [
  "Vaš krov već može da plaća račun za struju.",
  "Samo još niste izračunali koliko.",
];

const TRUST = [
  "Od 1993.",
  "200+ elektrana",
  "300.000 ugrađenih panela",
  "ISO 9001 · 14001 · 45001",
];
const BRANDS = [
  "Huawei",
  "Fronius",
  "Canadian Solar",
  "AIKO",
  "Luxor Solar",
  "K2 Systems",
];

const MYTHS = [
  {
    icon: Building,
    q: "„To je za velike firme i državne projekte.“",
    a: "Elektrana od 30 kW na krovu male firme računa se po istoj logici kao ona od 5 MW. Razlika je samo u brojkama.",
  },
  {
    icon: FileSignature,
    q: "„Nemam vremena za papirologiju i dozvole.“",
    a: "Mi vodimo projekat od prvog crteža do upotrebne dozvole. Vi potpisujete.",
  },
  {
    icon: Banknote,
    q: "„Nemam slobodnog novca za to.“",
    a: "Pomažemo oko razgovora sa bankama i finansijskim institucijama. Mnogi projekti se otplaćuju iz uštede na računu.",
  },
];

const FIT = [
  {
    icon: Receipt,
    title: "Račun preko 1.000 € mesečno",
    text: "Što je veći račun, to se elektrana brže vraća.",
  },
  {
    icon: SunMedium,
    title: "Radite danju",
    text: "Struja sa krova troši se odmah, dok mašine i klime rade.",
  },
  {
    icon: LayoutGrid,
    title: "Krov ili zemljište od 300 m²",
    text: "Dovoljno mesta za elektranu koja ima smisla.",
  },
  {
    icon: Warehouse,
    title: "Ravan krov hale",
    text: "Najjednostavnija montaža, paneli se okreću ka jugu.",
  },
  {
    icon: TrendingUp,
    title: "Struja je među 3 najveća troška",
    text: "Svako poskupljenje ide direktno iz marže.",
  },
  {
    icon: Leaf,
    title: "Partneri pitaju za održivost",
    text: "Sopstvena zelena energija je argument kod kupaca i na tenderima.",
  },
];

const STEPS = [
  {
    icon: CalcIcon,
    t: "Kalkulator i razgovor",
    d: "Izračunate okvirnu uštedu, naš inženjer vas zove i pregleda račune za struju.",
    tag: "Dan 1",
  },
  {
    icon: Ruler,
    t: "Uvid na terenu",
    d: "Dolazimo na objekat, proveravamo krov, statiku i priključak.",
  },
  {
    icon: ClipboardCheck,
    t: "Projekat i dozvole",
    d: "Projektujemo elektranu i vodimo svu dokumentaciju. Po potrebi vas povezujemo sa bankama.",
  },
  {
    icon: HardHat,
    t: "Izgradnja",
    d: "Sopstvene ekipe i oprema svetskih proizvođača. Termin planiramo tako da ne ometa vaš rad.",
  },
  {
    icon: PlugZap,
    t: "Priključenje i održavanje",
    d: "Tehnički prijem, upotrebna dozvola, a posle toga nadzor i održavanje.",
  },
];

const NUMBERS = [
  { v: "1993.", k: "od kada gradimo" },
  { v: "200+", k: "solarnih elektrana" },
  { v: "300.000", k: "ugrađenih panela" },
  { v: "150+ MW", k: "instalisane snage" },
];

const REFS = [
  {
    src: `${IMG}/krov-hala-montaza.jpg`,
    cap: "Krovna elektrana na komercijalnoj hali",
  },
  { src: `${IMG}/krov-beograd.jpg`, cap: "Krovna elektrana, Beograd" },
  {
    src: `${IMG}/polje-gorazde.jpg`,
    cap: "Elektrana na zemljištu, Goražde (BiH)",
  },
  { src: `${IMG}/polje-zalazak.jpg`, cap: "Elektrana na zemljištu, Srbija" },
];

const CERTS = ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 50001", "ISO 27001"];

const FAQ = [
  {
    q: "Da li se isplati ako imam mali objekat?",
    a: "Zavisi od potrošnje, ne od veličine firme. Kalkulator vam za 60 sekundi kaže da li vredi razgovarati.",
  },
  {
    q: "Šta ako moj krov ne može da nosi panele?",
    a: "Statiku proveravamo pre ponude. Ako krov nije pogodan, razmatramo elektranu na zemljištu.",
  },
  { q: "Ko vodi papirologiju?", a: "Mi — od projekta do upotrebne dozvole." },
  {
    q: "Kako da finansiram investiciju?",
    a: "Sopstvena sredstva ili kredit. Povezujemo vas sa finansijskim institucijama koje rade ovakve projekte.",
  },
  {
    q: "Šta se dešava sa viškom struje?",
    a: "Kao kupac-proizvođač, višak možete predati u mrežu po važećim pravilima. Inženjer vam objasni šta to znači za vaš objekat.",
  },
  {
    q: "Kolika je garancija?",
    a: "Paneli i invertori dolaze sa garancijama proizvođača, a na radove dajemo sopstvenu garanciju. Tačne uslove za vaš projekat dobijate u ponudi.",
  },
  {
    q: "Da li izgradnja ometa rad?",
    a: "Termin planiramo zajedno, tako da posao ne stane ni jedan dan.",
  },
];

/* ───────────── Priče ───────────── */

type Persona = {
  key: "dragan" | "milan";
  icon: typeof Factory;
  where: string;
  tag: string;
  title: string;
  before: string[];
  insight: string;
  calcIntro: string;
  after: string[];
  chartLabel: string;
  profile: readonly number[];
  highlight: [number, number];
};

const PERSONAS: Persona[] = [
  {
    key: "dragan",
    icon: Factory,
    where: "Proizvodna firma · Novi Sad",
    tag: "Primer vlasnika firme — lik je izmišljen, račun za struju verovatno nije.",
    title:
      "Dragan je mislio da su solarne elektrane za velike sisteme i državu. Nije izračunao.",
    before: [
      "Dragan ima proizvodnu firmu sa 40 zaposlenih u okolini Novog Sada. Mašine, kompresori i klima rade od 7 do 15h, a račun za struju je posle plata najveći trošak u firmi. Svako poskupljenje oseti se direktno u marži.",
      "O solarnim panelima je znao samo jedno: „to je za velike“. Nije znao koliko bi koštalo, ko bi to radio, ni da li krov hale uopšte može da nosi panele.",
    ],
    insight:
      "Firma koja radi danju troši struju baš onda kada sunce proizvodi. Skoro sve što krov napravi potroši se odmah, bez gubitaka i bez čekanja.",
    calcIntro:
      "Dragan je u kalkulator uneo prosečan mesečni račun od 1.500 €, tip objekta i površinu krova hale. Kalkulator je pokazao:",
    after: [
      "Inženjer MT-Komexa je izašao na teren, proverio statiku krova i dokumentaciju. Projekat, dozvole, izgradnju i priključenje vodio je MT-Komex. Dragan je potpisao ugovor i nastavio da vodi firmu.",
      "Danas deo struje za mašine dolazi sa njegovog krova. A kada strani kupci pitaju za održivu proizvodnju, ima šta da im pokaže.",
    ],
    chartLabel: "Potrošnja firme",
    profile: PROFILES.smena,
    highlight: [7, 15],
  },
  {
    key: "milan",
    icon: Warehouse,
    where: "Distributivni centar · Kragujevac",
    tag: "Primer vlasnika firme — lik je izmišljen.",
    title: "Milanov krov ima 2.000 kvadrata. Do sada je samo čuvao kišu.",
    before: [
      "Milan vodi distributivni centar kod Kragujevca. Rasveta, rashladne komore, punjači za viljuškare i kancelarije rade od jutra do večeri, šest dana nedeljno. Račun za struju raste svake godine, a cene usluga ne mogu da prate taj tempo.",
      "O solarnoj elektrani je razmišljao, ali su ga zaustavila tri pitanja: da li krov hale može da nosi panele, ko će da vodi papirologiju i odakle novac za investiciju.",
    ],
    insight:
      "Veliki, ravan krov i potrošnja tokom celog dana. To je skoro idealan profil za elektranu na krovu.",
    calcIntro:
      "Milan je u kalkulator uneo prosečan račun od 2.500 € i površinu krova hale od 2.000 m². Rezultat:",
    after: [
      "MT-Komex je proverio statiku krova, uradio projekat i ishodovao dozvole. Za finansiranje je Milan dobio kontakte i podršku u razgovoru sa bankom. Izgradnja je planirana tako da ne ometa rad magacina.",
      "Danas Milan zna tačno koliko ga košta svaka paleta koja prođe kroz magacin. I zna da će ta cena manje zavisiti od cene struje.",
    ],
    chartLabel: "Potrošnja magacina",
    profile: PROFILES.ceoDan,
    highlight: [7, 19],
  },
];

function PersonaStory({
  p,
  flip,
  onCta,
}: {
  p: Persona;
  flip: boolean;
  onCta: () => void;
}) {
  const r = useMemo(
    () =>
      p.key === "dragan"
        ? compute({
            usage: "danju",
            region: "vojvodina",
            billUnit: "eur",
            bill: 1500,
            space: "krov",
            area: 800,
            roof: "ravan",
          })
        : compute({
            usage: "danju",
            region: "sumadija",
            billUnit: "eur",
            bill: 2500,
            space: "krov",
            area: 2000,
            roof: "ravan",
          }),
    [p.key],
  );
  const Icon = p.icon;

  const visual = (
    <div className="rounded-3xl border border-white/10 bg-[#121826] p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[#fbae17]/12">
          <Icon className="size-5 text-[#fbae17]" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-white">
            {p.key === "dragan" ? "Dragan" : "Milan"}
          </p>
          <p className="text-xs text-[#8a94a8]">{p.where}</p>
        </div>
      </div>
      <SeasonChart
        profile={p.profile}
        useLabel={p.chartLabel}
        highlight={p.highlight}
      />
      <blockquote className="mt-6 border-l-[3px] border-[#fbae17] pl-4 font-display text-lg font-semibold leading-snug text-white sm:text-xl">
        {p.insight}
      </blockquote>
    </div>
  );

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Vizual: poklapanje potrošnje i sunca. Na telefonu ide posle "Pre". */}
        <motion.div
          {...reveal}
          className={`hidden lg:sticky lg:top-24 lg:block ${flip ? "lg:order-2" : ""}`}
        >
          {visual}
        </motion.div>

        <motion.div {...reveal} className={flip ? "lg:order-1" : ""}>
          <p className="mb-4 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] italic leading-snug text-[#aab3c5]">
            {p.tag}
          </p>
          <H2 className="!text-[26px] sm:!text-[34px]">{p.title}</H2>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#8a94a8]">
            Pre
          </p>
          <div className="mt-2 space-y-3 text-[16px] leading-relaxed text-[#c4cbd8]">
            {p.before.map((t) => (
              <p key={t.slice(0, 20)}>{t}</p>
            ))}
          </div>

          <div className="mt-7 lg:hidden">{visual}</div>

          <div className="mt-7 rounded-2xl border border-[#fbae17]/30 bg-[#fbae17]/[0.06] p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#fbae17]">
              <CalcIcon className="size-4" /> Trenutak sa kalkulatorom
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#c4cbd8]">
              {p.calcIntro}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { k: "Preporučena elektrana", v: `${kwText(r.kwp)} kW` },
                { k: "Procena investicije", v: euro(r.investment) },
                { k: "Ušteda godišnje", v: euro(r.annualSaving) },
                {
                  k: "Povrat investicije",
                  v: `${yearsText(r.paybackYears)} god.`,
                },
              ].map((t) => (
                <div key={t.k} className="rounded-xl bg-[#0b101b]/70 p-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#8a94a8]">
                    {t.k}
                  </dt>
                  <dd className="mt-0.5 font-display text-xl font-bold tabular-nums text-white">
                    {t.v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-[#8a94a8]">
              A paneli rade 25+ godina.
            </p>
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#8a94a8]">
            Posle
          </p>
          <div className="mt-2 space-y-3 text-[16px] leading-relaxed text-[#c4cbd8]">
            {p.after.map((t) => (
              <p key={t.slice(0, 20)}>{t}</p>
            ))}
          </div>

          <CtaButton onClick={onCta} className="mt-8 w-full sm:w-auto">
            Izračunaj za svoju firmu
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── Stranica ───────────── */

export default function MtKomexLanding() {
  const [calcOpen, setCalcOpen] = useState(false);
  const wide = useIsWide();
  const [showBar, setShowBar] = useState(false);

  // Mobilna CTA traka: posle heroja, ali ne preko kalkulatora i finalnog CTA-a.
  useEffect(() => {
    const hero = document.getElementById("hero");
    const hide = ["kalkulator", "kontakt"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const state = { pastHero: false, hidden: new Set<Element>() };
    const update = () => setShowBar(state.pastHero && state.hidden.size === 0);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) state.pastHero = !e.isIntersecting;
        else if (e.isIntersecting) state.hidden.add(e.target);
        else state.hidden.delete(e.target);
      }
      update();
    });
    if (hero) io.observe(hero);
    hide.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Na telefonu kalkulator odmah ide preko celog ekrana; na desktopu skrol do ugrađenog.
  const goCalc = () => {
    if (wide) scrollToId("kalkulator");
    else setCalcOpen(true);
  };

  const [h1a, h1b] = HEADLINE;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0d1220] text-[#eef1f6] [padding-bottom:env(safe-area-inset-bottom)]">
        {/* Header */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-[#0d1220]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Image
              src={`${IMG}/logo.svg`}
              alt="MT-Komex"
              width={93}
              height={45}
              priority
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-2">
              <a
                href={PHONE_HREF}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#c4cbd8] hover:text-white sm:inline-flex"
              >
                <Phone className="size-4 text-[#fbae17]" /> {PHONE}
              </a>
              <a
                href={PHONE_HREF}
                aria-label="Pozovite inženjera"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 sm:hidden"
              >
                <Phone className="size-4 text-[#fbae17]" />
              </a>
              <button
                type="button"
                onClick={() => goCalc()}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#fbae17] px-4 text-sm font-extrabold text-[#141414]"
              >
                Izračunaj uštedu
              </button>
            </div>
          </div>
        </header>

        {/* 1. Hero */}
        <section
          id="hero"
          className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-16"
        >
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: "easeOut" }}
          >
            <Image
              src={`${IMG}/krov-hala-montaza.jpg`}
              alt="Ekipa MT-Komexa montira solarnu elektranu na krovu hale"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[70%_center]"
            />
          </motion.div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(13,18,32,0.55)_0%,rgba(13,18,32,0.78)_45%,#0d1220_100%)] lg:bg-[linear-gradient(90deg,rgba(13,18,32,0.96)_0%,rgba(13,18,32,0.8)_45%,rgba(13,18,32,0.2)_100%)]" />

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-14 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="max-w-2xl"
            >
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#fbae17]/30 bg-[#0d1220]/60 px-3.5 py-1.5 text-xs font-semibold text-[#fbd27a] backdrop-blur">
                <Sun className="size-3.5" /> Za vlasnike firmi sa velikim
                računom za struju
              </p>
              <h1 className="font-display text-[36px] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[68px]">
                {h1a} <span className="text-[#fbae17]">{h1b}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#c4cbd8] sm:text-lg">
                MT-Komex 30 godina projektuje i gradi elektrane — više od 200
                solarnih elektrana, preko 150 MW. Unesite svoj mesečni račun i
                za 60 sekundi vidite koliko vaš objekat može da uštedi i za
                koliko godina se investicija vraća.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <CtaButton
                  onClick={() => goCalc()}
                  className="w-full sm:w-auto"
                >
                  Izračunaj uštedu za moj objekat
                </CtaButton>
                <button
                  type="button"
                  onClick={() => scrollToId("video")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-3 text-[15px] font-semibold text-white/90 hover:text-[#fbae17]"
                >
                  <span className="flex size-8 items-center justify-center rounded-full border border-white/30">
                    <Play className="size-3.5 fill-current" />
                  </span>
                  Pogledaj kako to izgleda kod našeg klijenta
                </button>
              </div>
              <p className="mt-3 text-xs text-[#aab3c5]">
                Besplatno · bez obaveze · bez ostavljanja broja telefona za
                osnovni rezultat
              </p>
            </motion.div>
          </div>

          {/* Traka poverenja */}
          <div className="border-t border-white/[0.08] bg-[#0d1220]/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-[13px] font-semibold text-[#c4cbd8] sm:px-6">
              {TRUST.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-[#fbae17]" /> {t}
                </span>
              ))}
              <span className="text-[#7d879b] lg:ml-auto">
                Oprema: Huawei · Fronius · Canadian Solar · AIKO
              </span>
            </div>
          </div>
        </section>

        {/* 2. Zvuči poznato */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div {...reveal} className="max-w-3xl">
              <Eyebrow>Zvuči poznato?</Eyebrow>
              <H2>
                Većina vlasnika firmi nikad nije izračunala. Zato što misle
                jedno od ovoga:
              </H2>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {MYTHS.map((m, i) => (
                <motion.div
                  key={m.q}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.08 }}
                  className="rounded-3xl border border-white/10 bg-[#121826] p-6"
                >
                  <m.icon className="size-6 text-[#fbae17]" />
                  <p className="mt-4 font-display text-xl font-bold leading-snug text-white">
                    {m.q}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#aab3c5]">
                    {m.a}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.p
              {...reveal}
              className="mt-12 text-center font-display text-xl font-semibold text-white sm:text-2xl"
            >
              Hajde da vidimo kako to izgleda na dva primera.{" "}
              <span className="text-[#fbae17]">Možda prepoznate sebe.</span>
            </motion.p>
          </div>
        </section>

        {/* 3–4. Priče */}
        <div className="border-y border-white/[0.06] bg-[#0a0f1a]">
          {PERSONAS.map((p, i) => (
            <div
              key={p.key}
              className={i > 0 ? "border-t border-white/[0.06]" : ""}
            >
              <PersonaStory p={p} flip={i % 2 === 1} onCta={goCalc} />
            </div>
          ))}
        </div>

        {/* 5. Za koga još */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div {...reveal} className="max-w-3xl">
              <Eyebrow>Za koga je ovo</Eyebrow>
              <H2>
                Ako se prepoznajete u bar dve stavke, ova računica je za vas.
              </H2>
            </motion.div>
            <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {FIT.map((c, i) => {
                return (
                  <motion.button
                    key={c.title}
                    type="button"
                    {...reveal}
                    transition={{ ...reveal.transition, delay: i * 0.05 }}
                    onClick={goCalc}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-[#121826] p-4 text-left transition-colors hover:border-[#fbae17]/50 sm:flex-row sm:gap-4 sm:p-5"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fbae17]/12">
                      <c.icon className="size-5 text-[#fbae17]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] font-bold leading-tight text-white sm:text-lg">
                        {c.title}
                      </span>
                      <span className="mt-1 block text-[13px] leading-snug text-[#aab3c5] sm:text-sm sm:leading-relaxed">
                        {c.text}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#fbae17]">
                        Izračunaj{" "}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Kalkulator — naš kalkulator uštede, ugrađen kao na sajtu */}
        <section
          id="kalkulator"
          className="scroll-mt-16 bg-[radial-gradient(ellipse_at_top,rgba(251,174,23,0.12),transparent_60%)] px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
              <Eyebrow>Kalkulator uštede</Eyebrow>
              <H2>Dragan i Milan su izračunali. Sad je vaš red.</H2>
              <p className="mt-5 text-[17px] leading-relaxed text-[#c4cbd8]">
                Šest kratkih pitanja, 60 sekundi. Vidite koliko panela staje na
                vaš krov, koliko košta elektrana, novi račun za struju i za
                koliko godina se investicija vraća.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#c4cbd8]">
                {[
                  "Rezultat odmah, bez kontakta",
                  "Detaljna računica od inženjera za 24h",
                  "Bez obaveze",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="size-4 text-[#fbae17]" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div {...reveal} className="mt-10 min-w-0">
              <CalculatorEmbed
                frameless
                open={calcOpen}
                onOpenChange={setCalcOpen}
                height={800}
              />
            </motion.div>
          </div>
        </section>

        {/* 7. Video studija slučaja */}
        <section
          id="video"
          className="scroll-mt-16 px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <motion.div {...reveal} className="text-center">
              <Eyebrow>Studija slučaja</Eyebrow>
              <H2>Dosta primera. Ovako izgleda kod pravog klijenta.</H2>
              <p className="mx-auto mt-4 max-w-2xl text-[16px] text-[#aab3c5]">
                Vlasnik firme priča kako je bilo pre, šta ga je ubedilo, kako je
                tekla izgradnja i šta pokazuju brojke posle godinu dana.
              </p>
            </motion.div>
            <motion.div
              {...reveal}
              className="group relative mt-10 aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 sm:aspect-video"
            >
              <Image
                src={`${IMG}/krov-beograd.jpg`}
                alt="Krovna solarna elektrana MT-Komexa"
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-[#0d1220]/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex size-20 items-center justify-center rounded-full bg-[#fbae17] text-[#141414] shadow-[0_0_0_12px_rgba(251,174,23,0.18)] sm:size-24">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#fbae17]/30" />
                  <Play className="relative ml-1 size-8 fill-current sm:size-10" />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <p className="font-display text-lg font-bold text-white sm:text-2xl">
                  Klijent MT-Komexa · krovna elektrana u radu
                </p>
                <p className="mt-1 text-sm text-[#c4cbd8]">
                  2–3 minuta · pre, izgradnja, brojke posle godinu dana
                </p>
              </div>
            </motion.div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                ["— kW", "snaga elektrane"],
                ["— €", "ušteda godišnje"],
                ["— god.", "povrat investicije"],
              ].map(([u, k]) => (
                <div
                  key={k}
                  className="rounded-2xl border border-white/10 bg-[#121826] p-4 text-center"
                >
                  <p className="font-display text-xl font-bold whitespace-nowrap text-[#fbae17] sm:text-2xl">
                    {u}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8a94a8] sm:text-xs">
                    {k}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Kako radimo */}
        <section className="border-y border-white/[0.06] bg-[#0a0f1a] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div {...reveal}>
              <Eyebrow>Kako radimo</Eyebrow>
              <H2>
                Od kalkulatora do upotrebne dozvole. Vi vodite firmu, mi vodimo
                projekat.
              </H2>
              <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 lg:block">
                <Image
                  src={`${IMG}/polje-gorazde.jpg`}
                  alt="Ekipa MT-Komexa na izgradnji elektrane"
                  fill
                  sizes="560px"
                  className="object-cover"
                />
              </div>
            </motion.div>
            <ol className="relative">
              <span className="absolute bottom-8 left-[21px] top-8 w-px bg-gradient-to-b from-[#fbae17] via-[#fbae17]/30 to-transparent" />
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.t}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.06 }}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-[#fbae17]/40 bg-[#121826]">
                    <s.icon className="size-5 text-[#fbae17]" />
                  </span>
                  <div className="pt-1.5">
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-white">
                      <span className="text-[#fbae17]">{i + 1}.</span> {s.t}
                      {s.tag && (
                        <span className="rounded-full bg-[#fbae17]/15 px-2 py-0.5 text-[11px] font-bold text-[#fbae17]">
                          {s.tag}
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#aab3c5]">
                      {s.d}
                    </p>
                  </div>
                </motion.li>
              ))}
              <motion.li
                {...reveal}
                className="mt-8 flex gap-3 rounded-2xl border border-white/10 bg-[#121826] p-4 text-sm text-[#aab3c5]"
              >
                <CalendarClock className="size-5 shrink-0 text-[#fbae17]" />
                Okvirno trajanje od ugovora do proizvodnje dobijate u ponudi —
                zavisi od snage elektrane i dozvola.
              </motion.li>
            </ol>
          </div>
        </section>

        {/* 9. Dokazi */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div {...reveal} className="max-w-3xl">
              <Eyebrow>Dokazi</Eyebrow>
              <H2>30 godina. 200 elektrana. Nijedna nije bila prva.</H2>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
              {NUMBERS.map((n) => (
                <motion.div
                  key={n.k}
                  {...reveal}
                  className="bg-[#121826] p-5 sm:p-7"
                >
                  <p className="font-display text-3xl font-extrabold tracking-tight text-[#fbae17] sm:text-5xl">
                    {n.v}
                  </p>
                  <p className="mt-1 text-sm text-[#aab3c5]">{n.k}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {REFS.map((r) => (
                <motion.figure
                  key={r.src}
                  {...reveal}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={r.src}
                    alt={r.cap}
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-3 text-xs font-semibold leading-snug text-white sm:text-sm">
                    {r.cap}
                  </figcaption>
                </motion.figure>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <motion.div
                {...reveal}
                className="rounded-3xl border border-white/10 bg-[#121826] p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a94a8]">
                  Sertifikati
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CERTS.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      <BadgeCheck className="size-4 text-[#fbae17]" /> {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#8a94a8]">
                  Partneri i oprema
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BRANDS.map((b) => (
                    <span
                      key={b}
                      className="flex h-12 items-center justify-center rounded-xl bg-white/[0.04] font-display text-[15px] font-bold tracking-tight text-[#c4cbd8]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </motion.div>
              <motion.div
                {...reveal}
                className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#fbae17]/25 bg-gradient-to-br from-[#fbae17]/[0.12] to-[#121826] p-6"
              >
                <Quote className="size-8 text-[#fbae17]" />
                <p className="mt-4 font-display text-xl font-semibold leading-snug text-white">
                  Zašto firme danas ne treba da čekaju — u jednoj rečenici.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#fbae17] text-[#141414]">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                  <div>
                    <p className="font-bold text-white">Miloš Kostić</p>
                    <p className="text-sm text-[#aab3c5]">
                      CEO, MT-Komex · video izjava
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section className="border-t border-white/[0.06] bg-[#0a0f1a] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <motion.div {...reveal}>
              <Eyebrow>Česta pitanja</Eyebrow>
              <H2>Pitanja koja čujemo od svakog vlasnika.</H2>
              <p className="mt-4 text-[15px] text-[#aab3c5]">
                Nije vam odgovoreno?{" "}
                <a
                  href={PHONE_HREF}
                  className="font-semibold text-[#fbae17] underline-offset-4 hover:underline"
                >
                  Pozovite inženjera
                </a>
                .
              </p>
            </motion.div>
            <motion.div {...reveal}>
              <Accordion
                type="single"
                collapsible
                defaultValue="0"
                className="rounded-3xl border border-white/10 bg-[#121826] px-5 sm:px-7"
              >
                {FAQ.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={String(i)}
                    className="border-white/10"
                  >
                    <AccordionTrigger className="py-5 font-display text-base font-bold text-white hover:no-underline sm:text-lg">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[15px] leading-relaxed text-[#aab3c5]">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* 11. Finalni CTA */}
        <section
          id="kontakt"
          className="relative isolate overflow-hidden px-4 py-20 sm:px-6 sm:py-28"
        >
          <Image
            src={`${IMG}/polje-zalazak.jpg`}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-[#0d1220]/85" />
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <H2 className="sm:!text-5xl">
              Dragan je izračunao za 60 sekundi.{" "}
              <span className="text-[#fbae17]">Koliko čeka vaš krov?</span>
            </H2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#c4cbd8]">
              Svaki mesec bez elektrane je još jedan pun račun za struju.
              Proverite brojke danas — bez obaveze.
            </p>
            <CtaButton
              onClick={() => goCalc()}
              className="mt-8 w-full sm:w-auto"
            >
              Izračunaj uštedu za moj objekat
            </CtaButton>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-[15px] sm:flex-row sm:gap-6">
              <span className="text-[#8a94a8]">Više volite razgovor?</span>
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2 font-semibold text-white hover:text-[#fbae17]"
              >
                <Phone className="size-4 text-[#fbae17]" /> {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 font-semibold text-white hover:text-[#fbae17]"
              >
                <Mail className="size-4 text-[#fbae17]" /> {EMAIL}
              </a>
            </div>
          </motion.div>
        </section>

        <footer className="border-t border-white/[0.06] px-4 py-8 pb-28 sm:px-6 sm:pb-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[#7d879b] sm:flex-row">
            <Image
              src={`${IMG}/logo.svg`}
              alt="MT-Komex"
              width={70}
              height={34}
              className="h-7 w-auto opacity-80"
            />
            <p>
              © {new Date().getFullYear()} MT-Komex d.o.o. · Projektovanje i
              izgradnja elektrana od 1993.
            </p>
          </div>
        </footer>

        {/* Mobilna CTA traka */}
        <motion.div
          initial={false}
          animate={{ y: showBar ? 0 : 120 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d1220]/90 p-3 backdrop-blur-xl [padding-bottom:max(12px,env(safe-area-inset-bottom))] sm:hidden"
        >
          <button
            type="button"
            onClick={() => goCalc()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fbae17] py-3.5 text-[15px] font-extrabold text-[#141414]"
          >
            Izračunaj uštedu za moj objekat <ArrowRight className="size-5" />
          </button>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
