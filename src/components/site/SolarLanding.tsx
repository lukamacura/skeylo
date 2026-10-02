"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CalendarCheck,
  Check,
  Clapperboard,
  Globe,
  Megaphone,
  PhoneCall,
  Rocket,
  Search,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserX,
  Users,
  X,
  Clock,
  Hourglass,
  HelpCircle,
} from "lucide-react";
import ProfitQuizPopup from "@/components/site/ProfitQuizPopup";
import YouTubePlayer from "@/components/site/YouTubePlayer";
import BentoGrid from "@/components/site/BentoGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GOLD = "#f0b656";
const ORANGE = "#d87928";
const CALC_HREF = "/calculator/solar";
const LEAD_TYPE = "solar-landing-quiz";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      type: "spring" as const,
      stiffness: 150,
      damping: 22,
    },
  }),
};

const ctaCls =
  "group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-4 py-2.5 text-sm font-extrabold leading-tight text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-4 sm:text-base";

const ghostCls =
  "group inline-flex items-center justify-center gap-2 rounded-md border border-border bg-foreground/[0.03] px-4 py-2.5 text-sm font-bold leading-tight transition-colors hover:border-[#f0b656]/50 hover:text-[#f0b656] sm:px-7 sm:py-4 sm:text-base";

const gradientText = {
  background: `linear-gradient(100deg, ${GOLD}, ${ORANGE})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-sm font-semibold uppercase tracking-widest"
      style={{ color: GOLD }}
    >
      {children}
    </p>
  );
}

function IconBadge({
  icon: Icon,
  size = "md",
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${
        size === "lg" ? "size-12" : "size-11"
      }`}
      style={{ background: `${GOLD}22` }}
    >
      <Icon
        className={size === "lg" ? "size-6" : "size-5"}
        style={{ color: GOLD }}
      />
    </span>
  );
}

/* ───────────── SADRŽAJ ───────────── */

const pains = [
  {
    icon: HelpCircle,
    title: "Kupac ne zna da li mu se isplati",
    desc: "Solarna elektrana je velika investicija. Dok kupac ne vidi brojku - za koliko godina mu se vraća novac - neće ni da se javi.",
  },
  {
    icon: UserX,
    title: "Upiti bez ozbiljnih kupaca",
    desc: "Telefon zvoni, ali pola ljudi samo pita za cenu i nestane. Vaši ljudi troše sate na razgovore koji ne vode nigde.",
  },
  {
    icon: Hourglass,
    title: "Preporuke nisu sistem",
    desc: "Posao koji zavisi od preporuka ima dobre i loše mesece. Ne možete da planirate ekipe, nabavku ni rast.",
  },
  {
    icon: Users,
    title: "Agencije ne razumeju solar",
    desc: "Lepi postovi sa panelima na krovu ne prodaju. Prodaje poverenje, brojka uštede i jasan sledeći korak.",
  },
];

/* Kako marketing pretvara stranca u zakazan izlazak na teren. */
const funnel = [
  {
    icon: Megaphone,
    title: "Meta reklama",
    desc: "Vlasnik kuće sa visokim računom za struju vidi video na Facebooku ili Instagramu - ciljano po lokaciji i tipu objekta.",
  },
  {
    icon: Calculator,
    title: "Kalkulator uštede",
    desc: "Klikne i za minut sam izračuna koliko štedi i kada mu se elektrana isplati. Interes postaje konkretan broj.",
  },
  {
    icon: Clapperboard,
    title: "Video gradi poverenje",
    desc: "Na sajtu vidi vas, vaše montere i prave realizacije. Ne kupuje od nepoznate firme - kupuje od ljudi koje je već video.",
  },
  {
    icon: PhoneCall,
    title: "Topao upit stiže vama",
    desc: "Ostavlja kontakt zajedno sa računom za struju i podacima o krovu. Vaš prodavac zove kupca koji je već ubeđen.",
  },
];

const pillars = [
  {
    icon: Clapperboard,
    title: "Video produkcija",
    lead: "Snimamo kod vas, na terenu.",
    items: [
      "Montaža elektrane od prvog panela do puštanja u rad",
      "Video svedočanstva zadovoljnih klijenata",
      "Vlasnik i tim ispred kamere - lice firme",
      "Kratki formati za reklame, Reels i TikTok",
    ],
  },
  {
    icon: Globe,
    title: "Sajt koji prodaje",
    lead: "Brz, jasan i napravljen da donosi upite.",
    items: [
      "Kalkulator uštede u bojama vašeg brenda",
      "Galerija realizacija i video svedočanstva",
      "Forma koja skuplja račun, tip krova i lokaciju",
      "Optimizovan za telefon - odakle dolazi 80% posetilaca",
    ],
  },
  {
    icon: Megaphone,
    title: "Meta reklame",
    lead: "Kampanje koje vodimo i optimizujemo svaki dan.",
    items: [
      "Istraživanje tržišta i uglova koji prodaju",
      "Ciljanje vlasnika kuća i firmi u vašoj regiji",
      "Testiranje kreativa - gasimo slabe, skaliramo jake",
      "Izveštaj: koliko upita, po kojoj ceni, od koje reklame",
    ],
  },
];

const inHouse = [
  "Videograf + oprema",
  "Web developer",
  "Media buyer za Meta reklame",
  "Copywriter i strateg",
  "Vaše vreme da sve to koordinirate",
];

const withUs = [
  "Jedan tim, jedan kontakt, jedan ugovor",
  "Video, sajt i reklame rade kao jedan sistem",
  "Iskustvo iz kampanja koje već donose novac",
  "Vi se bavite montažom, mi upitima",
];

const steps = [
  {
    icon: CalendarCheck,
    title: "Besplatna konsultacija",
    desc: "Razgovaramo o vašim kapacitetima, regiji i prosečnoj vrednosti projekta. Izlazite sa planom, bez obaveze.",
  },
  {
    icon: Search,
    title: "Strategija i snimanje",
    desc: "Istražujemo konkurenciju i kupce, pišemo scenarija i dolazimo na teren da snimimo materijal.",
  },
  {
    icon: Globe,
    title: "Sajt + kalkulator",
    desc: "Pravimo sajt sa kalkulatorom uštede prilagođenim vašim cenama i paketima.",
  },
  {
    icon: Rocket,
    title: "Kampanje i skaliranje",
    desc: "Puštamo Meta reklame, pratimo cenu po upitu i povećavamo budžet tamo gde se isplati.",
  },
];

const faqs = [
  {
    q: "Infinity Laser Studio nije solarna firma - zašto bi to radilo kod mene?",
    a: "Ne prodajemo isti oglas svima, prodajemo isti sistem: reklama koja privlači pravu osobu, sajt koji je pretvara u upit i video koji gradi poverenje. Za solar je taj sistem još bitniji, jer je odluka veća i kupac traži dokaz pre nego što se javi. Zato sistem dobija kalkulator uštede i video sa vaših realizacija.",
  },
  {
    q: "Koliko košta?",
    a: "Cena zavisi od broja snimanja, obima sajta i regije koju pokrivamo, pa je dogovaramo na konsultaciji. Budžet za reklame plaćate direktno Meti - mi ga ne naplaćujemo i ne prolazi kroz nas.",
  },
  {
    q: "Za koliko vremena kreću upiti?",
    a: "Sajt i prve kreative su spremni u nekoliko nedelja od snimanja. Prvi upiti stižu čim se kampanja pusti, a prvih nekoliko nedelja služi da nađemo reklame sa najnižom cenom po upitu.",
  },
  {
    q: "Moram li da imam sajt ili društvene mreže?",
    a: "Ne. Ako ih imate - nadograđujemo. Ako nemate - pravimo sve od nule, uključujući Meta Business nalog.",
  },
  {
    q: "Mogu li da vidim kalkulator pre saradnje?",
    a: "Da - demo je javan i možete ga isprobati odmah. Na vašem sajtu dobija vaš logo, boje, cene i kontakt.",
  },
];

/* ───────────── STRANICA ───────────── */

export default function SolarLanding() {
  return (
    <div className="relative pb-24 sm:pb-28">
      {/* ───────────── HERO ───────────── */}
      <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-20 md:pt-24 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="hero-grid absolute inset-0" />
          <div className="hero-radial absolute inset-0" />
          <div className="hero-glow absolute left-1/2 top-0 h-[20rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px] sm:h-[24rem] sm:w-[80%] md:h-[28rem]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background sm:h-48" />
        </div>

        <div className="container-x relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-[#f0b656]/30 bg-[#f0b656]/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: GOLD }}
            >
              <Sun className="size-3.5" />
              Za vlasnike solarnih firmi
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-5 text-balance text-3xl font-extrabold leading-[1.08] sm:mt-6 sm:text-5xl sm:leading-[1.02] lg:text-6xl"
            >
              Ljudi već traže solarne panele.{" "}
              <span style={gradientText}>Da li nalaze vas?</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
            >
              Dobijate{" "}
              <strong className="font-semibold text-foreground">
                kompletnu marketing agenciju
              </strong>{" "}
              - video produkciju, sajt sa{" "}
              <strong className="font-semibold text-foreground">
                kalkulatorom uštede
              </strong>{" "}
              i{" "}
              <strong className="font-semibold text-foreground">
                Meta reklame
              </strong>{" "}
              koje dovode kupce spremne za ponudu. Vi montirate, mi punimo
              kalendar.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center"
            >
              <ProfitQuizPopup leadType={LEAD_TYPE}>
                <button type="button" className={ctaCls}>
                  Zakažite besplatnu konsultaciju
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </ProfitQuizPopup>
              <Link
                href={CALC_HREF}
                target="_blank"
                rel="noopener"
                className={ghostCls}
              >
                <Calculator className="size-5" />
                Isprobajte kalkulator
              </Link>
            </motion.div>

            {/* Tri stuba na prvi pogled */}
            <motion.ul
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:mt-12 sm:gap-4"
            >
              {[
                { icon: Clapperboard, label: "Video produkcija" },
                { icon: Globe, label: "Sajt + kalkulator" },
                { icon: Megaphone, label: "Meta reklame" },
              ].map((p) => (
                <li
                  key={p.label}
                  className="flex flex-col items-center gap-2 rounded-2xl card-glass px-2 py-4 sm:py-5"
                >
                  <p.icon
                    className="size-5 sm:size-6"
                    style={{ color: GOLD }}
                  />
                  <span className="text-xs font-semibold leading-tight sm:text-sm">
                    {p.label}
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ───────────── PROBLEM ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Zvuči poznato?</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Posla ima - ali ne dolazi{" "}
              <span className="text-gradient">kad vam treba</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5">
            {pains.map((p, i) => (
              <motion.div
                key={p.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="flex gap-4 rounded-2xl card-glass p-5 sm:p-6"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  <p.icon className="size-5 text-red-400" />
                </span>
                <div>
                  <h3 className="font-bold sm:text-lg">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── KAKO MARKETING DONOSI POSAO ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Kako marketing radi za vas</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Od reklame do{" "}
              <span className="text-gradient">zakazanog izlaska na teren</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Ne pravimo postove radi lajkova. Gradimo sistem koji svakog dana
              dovodi vlasnike kuća i firmi koji su već izračunali da im se
              elektrana isplati.
            </p>
          </div>

          <ol className="relative mx-auto mt-10 grid max-w-5xl gap-4 sm:mt-14 md:grid-cols-4 md:gap-5">
            {funnel.map((f, i) => (
              <motion.li
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="relative flex gap-4 rounded-2xl card-glass p-5 md:flex-col md:gap-0 md:p-6"
              >
                <div className="flex items-center gap-3 md:justify-between">
                  <IconBadge icon={f.icon} />
                  <span
                    className="hidden font-display text-3xl font-extrabold opacity-30 md:block"
                    style={{ color: GOLD }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div className="md:mt-5">
                  <h3 className="font-bold sm:text-lg">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
                {i < funnel.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 md:block"
                    style={{ color: GOLD }}
                  />
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── KALKULATOR ───────────── */}
      <section className="py-12 md:py-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-[#f0b656]/30 p-6 sm:p-8 md:p-14 grain">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full blur-[110px]"
              style={{ background: `${GOLD}33` }}
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div>
                <SectionLabel>Vaše tajno oružje</SectionLabel>
                <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                  Kalkulator koji{" "}
                  <span className="text-gradient">prodaje umesto vas</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                  Posetilac odgovori na 6 kratkih pitanja i vidi{" "}
                  <strong className="font-semibold text-foreground">
                    za koliko godina mu se paneli isplate
                  </strong>
                  . Umesto „koliko košta?“ dobijate upit od nekoga ko je već
                  video da mu se isplati - sa podacima koji vam trebaju za
                  ponudu.
                </p>

                <ul className="mt-7 space-y-3">
                  {[
                    "Kupac sam sebe ubeđuje - brojkom, ne pričom",
                    "Svaki upit stiže sa računom za struju i podacima o krovu",
                    "Vaš logo, boje, cene i kontakt - izgleda kao vaš alat",
                    "Najjači materijal za reklame: „Izračunajte uštedu za 60 sekundi“",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${GOLD}22` }}
                      >
                        <Check className="size-3.5" style={{ color: GOLD }} />
                      </span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={CALC_HREF}
                  target="_blank"
                  rel="noopener"
                  className={`${ctaCls} mt-8 w-full sm:w-auto`}
                >
                  Isprobajte kalkulator uživo
                  <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Živi demo u okviru telefona (samo desktop - na telefonu vodi dugme) */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                className="hidden justify-center lg:flex"
              >
                <div
                  className="relative h-[640px] w-[320px] overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-[#07090d] shadow-2xl"
                  style={{ boxShadow: `0 30px 80px -30px ${GOLD}66` }}
                >
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900"
                  />
                  <iframe
                    src={CALC_HREF}
                    title="Demo: kalkulator uštede za solarne panele"
                    loading="lazy"
                    className="size-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── TRI STUBA = CELA AGENCIJA ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Šta dobijate</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Cela marketing agencija -{" "}
              <span className="text-gradient">jedan tim</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Video, sajt i reklame rade samo kad su povezani. Zato ih radimo
              zajedno.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="flex flex-col rounded-3xl card-glass p-6 sm:p-7"
              >
                <IconBadge icon={p.icon} size="lg" />
                <h3 className="mt-5 text-xl font-extrabold sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.lead}</p>
                <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: GOLD }}
                      />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* In-house vs Skeylo */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:mt-16 md:grid-cols-2 md:gap-5">
            <div className="rounded-3xl border border-border p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Da sve gradite sami
              </p>
              <ul className="mt-5 space-y-3">
                {inHouse.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                      <X className="size-3 text-red-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-3xl border p-6 sm:p-7"
              style={{
                borderColor: `${GOLD}55`,
                background: `linear-gradient(160deg, ${GOLD}14, transparent)`,
              }}
            >
              <p
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: GOLD }}
              >
                Sa Skeylo timom
              </p>
              <ul className="mt-5 space-y-3">
                {withUs.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <Check className="size-3 text-green-500" />
                    </span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── REZULTATI (isti kao na glavnoj) ───────────── */}
      <BentoGrid
        teamLabel="Vaš posvećeni tim"
        cta={
          <>
            <h3 className="text-lg font-bold sm:text-2xl">
              Sledeći rezultati mogu biti vaši.
            </h3>
            <ProfitQuizPopup leadType={LEAD_TYPE}>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:py-3 sm:text-base"
              >
                Besplatna konsultacija
                <ArrowUpRight className="size-4" />
              </button>
            </ProfitQuizPopup>
          </>
        }
      />

      {/* ───────────── CASE STUDY ───────────── */}
      <section className="relative py-12 md:py-20">
        <div className="container-x">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5"
          >
            <span className="relative inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border card-glass p-2 sm:size-16 md:size-20">
              <Image
                src="/logos/ils-logo.webp"
                alt="Infinity Laser Studio logo"
                width={80}
                height={80}
                sizes="(min-width: 768px) 80px, (min-width: 640px) 64px, 56px"
                className="size-full object-contain"
              />
            </span>
            <div className="min-w-0">
              <SectionLabel>Studija slučaja</SectionLabel>
              <h2 className="mt-1 text-balance text-2xl font-extrabold sm:mt-2 sm:text-4xl lg:text-5xl">
                Infinity Laser Studio
              </h2>
            </div>
          </motion.div>

          <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
            <motion.article
              custom={0}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="flex h-full flex-col rounded-3xl card-glass p-6 md:p-8"
            >
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <ArrowDownRight className="size-3.5 text-red-400" />
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      Problem.{" "}
                    </span>
                    <span className="text-muted-foreground">
                      Infinity Laser Studio je sve termine zakazivao ručno, bez
                      marketinga.
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                    <TrendingUp className="size-3.5 text-green-500" />
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      Rešenje.{" "}
                    </span>
                    <span className="text-muted-foreground">
                      Napravili smo sajt sa sistemom za zakazivanje i pokrenuli
                      Meta kampanje sa 20 novih kreativa.
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <span
                    className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${GOLD}22` }}
                  >
                    <Sun className="size-3.5" style={{ color: GOLD }} />
                  </span>
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">
                      Za vas.{" "}
                    </span>
                    <span className="text-muted-foreground">
                      Isti sistem - reklama, sajt koji pretvara posetu u upit i
                      video koji gradi poverenje - uz kalkulator uštede umesto
                      zakazivanja.
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center sm:mt-auto sm:pt-6">
                {[
                  { value: "1.245.000", label: "RSD prihoda za 3 meseca" },
                  { value: "~100", label: "online zakazivanja / mesec" },
                  { value: "4.14x", label: "povrat na uloženo" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="font-display text-base font-extrabold text-gradient sm:text-2xl lg:text-3xl">
                      {r.value}
                    </div>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {r.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.article>

            <div className="lg:flex lg:items-center">
              <YouTubePlayer
                videoId="8ZlDwuFZnYQ"
                title="Infinity Laser Studio - studija slučaja"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PROCES ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel>Kako krećemo</SectionLabel>
            <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Vi radite elektrane -{" "}
              <span className="text-gradient">mi radimo sve ostalo</span>
            </h2>
          </div>

          <ol className="mx-auto mt-10 grid max-w-5xl gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-2xl card-glass p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <IconBadge icon={s.icon} />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Korak {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-bold sm:text-lg">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <SectionLabel>Pitanja</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                Pre nego što se javite
              </h2>
            </div>
            <Accordion type="single" collapsible className="mt-8 sm:mt-10">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="border-border">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline sm:text-lg">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground sm:text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="py-12 md:py-20">
        <div className="container-x">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card px-5 py-12 text-center sm:px-6 sm:py-16 md:px-16 md:py-20 grain"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]"
            />
            <h2 className="relative text-balance text-3xl font-extrabold sm:text-5xl">
              Sezona ne čeka.{" "}
              <span className="text-gradient">Napunite kalendar montaža.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:mt-5 sm:text-lg">
              Na besplatnoj konsultaciji dobijate plan za vašu regiju: koje
              reklame, koji video i koliko upita realno možete da očekujete.
            </p>
            <div className="relative mt-8 flex justify-center sm:mt-9">
              <ProfitQuizPopup leadType={LEAD_TYPE}>
                <button type="button" className={`${ctaCls} w-full sm:w-auto`}>
                  Zakažite besplatnu konsultaciju
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </button>
              </ProfitQuizPopup>
            </div>
            <div className="relative mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              {[
                { icon: Users, label: "Jedan tim za sve" },
                { icon: Clock, label: "Odgovor za manje od 48h" },
                { icon: ShieldCheck, label: "Bez obaveze posle razgovora" },
              ].map((g) => (
                <div
                  key={g.label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <g.icon className="size-4 text-primary" />
                  {g.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── FIXED BOTTOM CTA ───────────── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
        <div className="container-x flex items-center gap-2 py-2 sm:justify-between sm:gap-4 sm:py-3">
          <p className="hidden text-sm font-semibold sm:block">
            Video, sajt i Meta reklame za vašu solarnu firmu
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href={CALC_HREF}
              target="_blank"
              rel="noopener"
              aria-label="Isprobajte kalkulator"
              className={`${ghostCls} shrink-0 px-3`}
            >
              <Calculator className="size-5" />
              <span className="hidden sm:inline">Kalkulator</span>
            </Link>
            <ProfitQuizPopup leadType={LEAD_TYPE}>
              <button type="button" className={`${ctaCls} flex-1 sm:flex-none`}>
                Besplatna konsultacija
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 sm:size-5" />
              </button>
            </ProfitQuizPopup>
          </div>
        </div>
      </div>
    </div>
  );
}
