"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Film,
  Image as ImageIcon,
  ListChecks,
  Camera,
  MicVocal,
  Palette,
  Quote,
  Repeat,
  Scissors,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  X,
} from "lucide-react";
import { formatPrice, getPackage, priceLabelFull } from "@/lib/packages";
import PodcastQuizPopup from "@/components/site/PodcastQuizPopup";
import YouTubePlayer from "@/components/site/YouTubePlayer";
import InstagramPlayer from "@/components/site/InstagramPlayer";
import PodcastMic, { MIC_INTRO_DURATION } from "@/components/site/PodcastMic";
import AnimatedLetters, {
  lettersDuration,
} from "@/components/site/AnimatedLetters";

const GOLD = "#f0b656";
const ORANGE = "#d87928";

const VSL_VIDEO_ID = "pfTMNetaMbw";
/**
 * Instagram Reels (9:16) - primeri gotovih klipova iz Podcast Simulation sesija.
 * Oba se otvaraju na Instagramu (drugi nalog je isključio embed, pa su
 * ujednačeni). Ukloni `href` da se klip pušta u iframe-u na sajtu.
 */
const CASE_STUDY_CLIPS = [
  {
    postId: "DdTazNytouO",
    thumbnail: "/podcast/case-study-instagram.webp",
    title: "Podcast Simulation - primer gotovog klipa (1)",
    href: "https://www.instagram.com/reel/DdTazNytouO/",
  },
  {
    postId: "DbawIsoM9_I",
    thumbnail: "/podcast/case-study-instagram-2.webp",
    title: "Podcast Simulation - primer gotovog klipa (2)",
    href: "https://www.instagram.com/reel/DbawIsoM9_I/",
  },
];

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

/**
 * Hero tekst ulazi tek kad mikrofon završi zoom-out (vidi PodcastMic):
 * badge → naslov slovo po slovo → podnaslov → pokazivač. `custom` je delay u
 * sekundama.
 */
const heroFadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      type: "spring" as const,
      stiffness: 170,
      damping: 24,
    },
  }),
};
const HERO_TEXT_START = MIC_INTRO_DURATION - 0.25;
const HERO_TITLE_START = HERO_TEXT_START + 0.08;

const ctaCls =
  "group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#f0b656] to-[#d87928] px-4 py-2.5 text-sm font-extrabold leading-tight text-[#0a0a0a] shadow-lg shadow-[#f0b656]/20 transition-transform hover:-translate-y-0.5 sm:px-7 sm:py-4 sm:text-base";

/** Brand "S" mark used as the list bullet in place of a plain checkmark. */
function LogoCheck({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.webp"
      alt=""
      aria-hidden
      width={62}
      height={96}
      className={`object-contain ${className}`}
    />
  );
}

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

/** Mesto za sliku - zameni `image` putanjom kad fotografije iz studija budu spremne. */
function StepMedia({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-dashed lg:aspect-[4/3]"
      style={{
        borderColor: `${GOLD}40`,
        background: `linear-gradient(160deg, ${GOLD}0f, transparent)`,
      }}
    >
      <ImageIcon className="size-8 opacity-30" style={{ color: GOLD }} />
    </div>
  );
}

const pillars = [
  {
    icon: Timer,
    desc: "Jedan termin mesečno. Dođete, sednete, pričate.",
  },
  {
    icon: Film,
    desc: "Montirani vertikalni klipovi, spremni za objavu.",
  },
  {
    icon: CalendarDays,
    desc: "Daily upload - frekvencija na kojoj algoritam počinje ozbiljno da radi za Vas.",
  },
];

const steps = [
  {
    icon: ListChecks,
    title: "Pripremamo 30 pitanja",
    desc: "Pre termina istražujemo Vašu industriju i sastavljamo 30 pitanja na koja Vaši kupci zaista traže odgovore. Vi ne učite nikakav scenario.",
  },
  {
    icon: CalendarCheck,
    title: "Dolazite u studio",
    desc: "Moderan prostor je spreman, oprema podešena, kamerman kontroliše set. Vi samo sednete.",
  },
  {
    icon: MicVocal,
    title: "Voditelj vodi razgovor",
    desc: "Tri sata opuštenog razgovora. Voditelj postavlja pitanja tako da odgovarate s lakoćom, prekida Vas ako skrenete s teme i izvlači ono što publika želi da čuje.",
  },
  {
    icon: Scissors,
    title: "Montiramo i dostavljamo 30 klipova",
    desc: "Sečemo razgovor na 30 kratkih videa u vertikalnom formatu za Reels, TikTok i Shorts, šaljemo Google Drive link sa gotovim videima i podešavamo ManyChat automaciju sa soft CTA-om.",
  },
];

const youDo = [
  "Dođete u studio jednom mesečno na 3 sata.",
  "Odgovarate na pitanja koja smo pripremili.",
  "Objavite gotov klip - jedan dnevno.",
];

const weDo = [
  "Istražujemo Vašu industriju i pišemo 30 pitanja",
  "Obezbeđujemo moderan studio spreman za snimanje",
  "Voditelj vodi razgovor i izvlači najbolje odgovore",
  "Dve kamere, studijski mikrofoni, rasveta i kamerman na setu",
  "Montiramo svih 30 klipova u vertikalnom formatu",
  "Podešavamo ManyChat automaciju i soft CTA",
];

const noMore = [
  "Smišljati teme",
  "Učiti scenario",
  "Montirati",
  "Razmišljati šta objaviti sutra",
];

const valueStack = [
  {
    title:
      "Detaljno istraživanje Vaše industrije i 30 pitanja sa najvećim viralnim potencijalom",
    value: 100,
  },
  { title: "Moderan prostor spreman za snimanje", value: 50 },
  {
    title:
      "Voditelj koji vodi razgovor i izvlači tačno ono što publika želi da čuje",
    value: 150,
  },
  {
    title:
      "Dve kamere iz više uglova, dva studijska mikrofona, profesionalna rasveta i kamerman puna 3 sata",
    value: 450,
  },
  {
    title:
      "Kompletna montaža svih 30 klipova i Google Drive link sa gotovim videima",
    value: 400,
  },
  {
    title:
      "ManyChat comment-to-DM automacija i soft CTA koji publiku vodi u Vaš prodajni funnel",
    value: 100,
  },
];

const stackTotal = valueStack.reduce((sum, v) => sum + v.value, 0);

const monthlyPerks = [
  "Svakog meseca novih 30 videa",
  "3 meseca daily upload-a bez prekida",
  "Prioritet pri zakazivanju termina",
];

const oneTimePerks = [
  "Jedan termin od 3 sata",
  "30 montiranih klipova",
  "Idealno za probu pre tromesečnog paketa",
];

/** Na setu i u montaži menjamo izgled, da 30 klipova ne bi dosadilo publici. */
const variety = [
  {
    icon: Camera,
    title: "Na setu",
    items: ["Uglove kamera", "Odevne kombinacije", "Pozadine", "Osvetljenje"],
  },
  {
    icon: Palette,
    title: "U montaži",
    items: ["Stil animacija", "Stil teksta", "Ritam rezova"],
  },
];

const alternatives = [
  {
    title: "Sami kreirate sadržaj",
    desc: "Na svojim leđima nosite posao celog kontent tima - teme, snimanje, montažu i objave.",
  },
  {
    title: "Studio koji iznajmljuje samo prostor",
    desc: "Fensi prostor ne vredi ništa ako na setu nemate nekoga ko tačno zna kako da Vas vodi.",
  },
  {
    title: 'Izrežirani "fejk" podkasti',
    desc: 'Vidi se da je namešteno. Publika pomisli "evo još jednog fejk podkasta" i skroluje dalje.',
  },
  {
    title: "Skupa marketing agencija",
    desc: "Nerealan deo mesečne zarade - a bez proizvoda koji već donosi keš, agencijski fee se ne isplati.",
  },
];

const realConversation = [
  "Voditelj je u kadru - set izgleda kao da ste stvarno došli kao gost",
  "Spontani prekidi, osmesi, reakcije i pravi ton u glasu",
  "Publika se fokusira na Vašu poruku, jer oseća da je razgovor stvaran",
];

export default function PodcastSimulationLanding() {
  const pkg = getPackage("podcast-simulation")!;
  /** Trenutak kad poslednje slovo naslova završi animaciju. */
  const heroTitleEnd =
    HERO_TITLE_START +
    lettersDuration(pkg.heroTitle) -
    0.18 +
    lettersDuration(pkg.heroHighlight);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative pb-20 sm:pb-24">
        {/* ───────────── HERO ───────────── */}
        <section className="relative isolate overflow-hidden pt-16 pb-12 sm:pt-20 md:pt-24 md:pb-20">
          {/* Ista atmosfera kao na glavnoj landing stranici: mreža → sjaj → fade. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="hero-grid absolute inset-0" />
            <div className="hero-radial absolute inset-0" />
            <div className="hero-glow absolute left-1/2 top-0 h-[20rem] w-[130%] -translate-x-1/2 rounded-full bg-primary/20 blur-[90px] sm:h-[24rem] sm:w-[80%] md:h-[28rem]" />
            {/* dekorativni mikrofon iza naslova */}
            <PodcastMic className="absolute left-1/2 top-14 w-[220px] -translate-x-1/2 sm:top-16 sm:w-[280px] md:top-20 md:w-[320px]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background sm:h-48" />
          </div>
          <div className="container-x relative">
            <Link
              href="/#paketi"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Svi paketi
            </Link>

            <div className="mx-auto mt-6 max-w-4xl text-center">
              <motion.div
                custom={HERO_TEXT_START}
                variants={heroFadeUp}
                initial="hidden"
                animate="show"
                className="inline-flex items-center gap-2 rounded-full border border-[#f0b656]/30 bg-[#f0b656]/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: GOLD }}
              >
                <Sparkles className="size-3.5" />
                {pkg.heroKicker}
              </motion.div>

              <h1 className="mt-5 text-balance text-3xl font-extrabold leading-[1.08] sm:mt-6 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
                <AnimatedLetters
                  text={pkg.heroTitle}
                  delay={HERO_TITLE_START}
                />{" "}
                <AnimatedLetters
                  text={pkg.heroHighlight}
                  delay={
                    HERO_TITLE_START + lettersDuration(pkg.heroTitle) - 0.18
                  }
                  gradient={[GOLD, ORANGE]}
                  className="whitespace-nowrap"
                />
              </h1>

              <motion.p
                custom={heroTitleEnd - 0.12}
                variants={heroFadeUp}
                initial="hidden"
                animate="show"
                className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
              >
                Za samo{" "}
                <strong className="font-semibold text-foreground">
                  3 sata mesečno
                </strong>{" "}
                proizvodimo 30 videa koji dokazuju Vašu stručnost i grade{" "}
                <strong className="font-semibold text-foreground">
                  neupitan autoritet
                </strong>{" "}
                u Vašoj niši.
              </motion.p>

              {/* ── Pokazivač na VSL ── */}
              <motion.div
                custom={heroTitleEnd + 0.02}
                variants={heroFadeUp}
                initial="hidden"
                animate="show"
                className="mt-10 flex flex-col items-center gap-2 sm:mt-12"
              >
                <p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
                  Ako gradite lični brend i želite da budete prva opcija kada
                  kupci pomisle na Vaš proizvod
                </p>
                <p className="text-base font-semibold sm:text-lg">
                  Pogledajte video do kraja
                </p>
                <motion.span
                  aria-hidden
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex"
                >
                  <ArrowDown className="size-7" style={{ color: GOLD }} />
                </motion.span>
              </motion.div>
            </div>

            {/* ── VSL ── */}
            <div className="mx-auto mt-4 max-w-4xl sm:mt-6">
              <YouTubePlayer
                videoId={VSL_VIDEO_ID}
                title="Podcast Simulation"
                caption="Podcast Simulation"
              />
            </div>
          </div>
        </section>

        {/* ───────────── 3h → 30 videa → 30 dana ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Kako to funkcioniše</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Snimite jednom,{" "}
                <span className="text-gradient">objavljujte svaki dan</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Jedan termin u studiju od 3 sata pokriva ceo mesec sadržaja. A
                30 klipova mesečno znači daily upload - pa se vreme potrebno da
                izgradite autoritet i prepoznatljivost svodi na minimum.
              </p>
            </div>

            <ol className="mt-12 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-6">
              {pkg.stats.map((s, i) => {
                const pillar = pillars[i];
                return (
                  <li key={s.label} className="contents">
                    <motion.div
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-60px" }}
                      className="rounded-2xl card-glass p-6 text-center sm:p-7"
                    >
                      <span
                        className="mx-auto inline-flex size-11 items-center justify-center rounded-xl"
                        style={{ background: `${GOLD}22` }}
                      >
                        <pillar.icon
                          className="size-5"
                          style={{ color: GOLD }}
                        />
                      </span>
                      <div className="mt-4 font-display text-5xl font-extrabold text-gradient sm:text-6xl">
                        {s.value}
                      </div>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {pillar.desc}
                      </p>
                    </motion.div>
                    {i < pkg.stats.length - 1 && (
                      <div aria-hidden className="flex justify-center">
                        <ArrowDown
                          className="size-6 md:hidden"
                          style={{ color: GOLD }}
                        />
                        <ArrowRight
                          className="hidden size-6 md:block"
                          style={{ color: GOLD }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ───────────── DAN SNIMANJA ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Dan snimanja</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Ovako izgleda Vaših{" "}
                <span className="text-gradient">3 sata</span>
              </h2>
            </div>

            <div className="mt-12 space-y-10 sm:mt-16 sm:space-y-14">
              {steps.map((s, i) => (
                <motion.div
                  key={s.title}
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
                >
                  <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex size-11 items-center justify-center rounded-xl"
                        style={{ background: `${GOLD}22` }}
                      >
                        <s.icon className="size-5" style={{ color: GOLD }} />
                      </span>
                      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Korak {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold sm:text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>

                  <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                    <StepMedia alt={`${s.title} - Podcast Simulation`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── STUDIJA SLUČAJA ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Ovako izgleda <span className="text-gradient">gotov klip</span>
              </h2>
            </motion.div>

            <div className="mx-auto mt-10 grid max-w-[320px] gap-6 sm:max-w-[760px] sm:grid-cols-2 sm:gap-8 md:mt-14">
              {CASE_STUDY_CLIPS.map((clip) => (
                <InstagramPlayer
                  key={clip.postId}
                  postId={clip.postId}
                  thumbnail={clip.thumbnail}
                  title={clip.title}
                  href={clip.href}
                  aspect="aspect-[9/16]"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── RAZNOVRSNOST ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>30 klipova, nula dosade</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Publici <span className="text-gradient">neće dosaditi</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Mislite da je 30 klipova u podcast formatu previše? Svaki klip
                izgleda drugačije - iako je sve snimljeno u istom terminu.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              {variety.map((v, i) => (
                <motion.div
                  key={v.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="rounded-3xl border border-border card-glass p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-11 items-center justify-center rounded-xl"
                      style={{ background: `${GOLD}22` }}
                    >
                      <v.icon className="size-5" style={{ color: GOLD }} />
                    </span>
                    <h3 className="text-lg font-bold sm:text-xl">
                      {v.title} menjamo
                    </h3>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {v.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <LogoCheck className="mt-0.5 size-4 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-balance text-center text-base font-semibold sm:text-lg">
              Vaša priča i vrednost drže publiku zalepljenu za ekran - a ne
              mesto na kom sedite.
            </p>
          </div>
        </section>

        {/* ───────────── JEDNOSTAVNOST ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Jednostavnost</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Vi pričate,{" "}
                <span className="text-gradient">mi radimo sve ostalo</span>
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {/* Vaš deo */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl border border-border card-glass p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-11 items-center justify-center rounded-xl"
                      style={{ background: `${GOLD}22` }}
                    >
                      <MicVocal className="size-5" style={{ color: GOLD }} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Vaš deo posla
                      </p>
                      <h3 className="text-lg font-bold sm:text-xl">
                        Šta Vi radite
                      </h3>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    ~3 sata mesečno
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {youDo.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <LogoCheck className="mt-0.5 size-5 shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Naš deo */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl gold-frame border border-transparent bg-gradient-to-b from-[#f0b656]/[0.12] via-card to-card p-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-11 items-center justify-center rounded-xl"
                      style={{ background: `${GOLD}22` }}
                    >
                      <Sparkles className="size-5" style={{ color: GOLD }} />
                    </span>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: GOLD }}
                      >
                        Naš deo posla
                      </p>
                      <h3 className="text-lg font-bold sm:text-xl">
                        Šta mi radimo
                      </h3>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-[#f0b656] to-[#d87928] px-2.5 py-1 text-[11px] font-bold text-[#0a0a0a]">
                    Sve ostalo
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {weDo.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <LogoCheck className="mt-0.5 size-5 shrink-0" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Šta više ne morate
              </p>
              <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {noMore.map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <X className="size-4 text-red-400/80" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────────── ALTERNATIVE ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto max-w-3xl text-center">
              <SectionLabel>Zašto baš ovako</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Šta ne radi - <span className="text-gradient">i šta radi</span>
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
              {alternatives.map((a, i) => (
                <motion.div
                  key={a.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="rounded-2xl border border-border card-glass p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2.5">
                    <X
                      className="size-5 shrink-0 text-red-400/80"
                      aria-hidden
                    />
                    <h3 className="font-bold">{a.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {a.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mx-auto mt-5 max-w-4xl rounded-3xl gold-frame border border-transparent bg-gradient-to-b from-[#f0b656]/[0.12] via-card to-card p-6 sm:p-8"
            >
              <div className="flex items-center gap-2.5">
                <LogoCheck className="size-5 shrink-0" />
                <h3 className="text-lg font-bold sm:text-xl">
                  Podcast Simulation: pravi razgovor, ne režija
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {realConversation.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <LogoCheck className="mt-0.5 size-5 shrink-0" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-16">
              <Quote
                className="mx-auto size-8 opacity-60"
                style={{ color: GOLD }}
                aria-hidden
              />
              <p className="mt-4 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
                Ljudi kupuju od ljudi koje znaju, koji im se dopadaju i kojima
                veruju.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Podcast Simulation gradi upravo to poverenje. Zato smo uvek
                imali drastično bolje rezultate na plaćenim oglasima čim bismo u
                strategiju ubacili ove klipove - čak i kad već imate proizvod i
                agenciju koja ga gura.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────── VALUE STACK ───────────── */}
        <section className="py-12 md:py-20">
          <div className="container-x">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <SectionLabel>Šta tačno dobijate</SectionLabel>
              <h2 className="mt-3 text-balance text-2xl font-extrabold sm:text-4xl md:text-5xl">
                Vrednost od{" "}
                <span className="text-gradient">
                  {formatPrice(stackTotal)}€
                </span>{" "}
                za {priceLabelFull(pkg)}
              </h2>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border card-glass">
              <ul className="divide-y divide-border">
                {valueStack.map((v, i) => (
                  <motion.li
                    key={v.title}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="flex items-start gap-4 p-5 sm:p-6"
                  >
                    <LogoCheck className="mt-0.5 size-6 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{v.title}</h3>
                    </div>
                    <span className="shrink-0 pl-2 text-sm font-semibold text-muted-foreground line-through sm:text-base">
                      {formatPrice(v.value)}€
                    </span>
                  </motion.li>
                ))}
              </ul>

              <div
                className="flex flex-col gap-1 border-t border-border p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:text-left"
                style={{ background: `${GOLD}0f` }}
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Ukupna vrednost
                </span>
                <span className="font-display text-2xl font-extrabold sm:text-3xl">
                  <span className="text-muted-foreground line-through">
                    {formatPrice(stackTotal)}€
                  </span>{" "}
                  <span className="text-gradient">
                    {formatPrice(pkg.price)}€
                  </span>{" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    / {pkg.priceNote}
                  </span>
                </span>
              </div>
              <p className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground sm:px-6 sm:text-sm">
                Kroz tromesečni paket. Samo jedan mesec:{" "}
                {formatPrice(pkg.oneTimePrice ?? 0)}€.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────── PONUDA ───────────── */}
        <section className="py-12 md:py-24">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-3xl border border-[#f0b656]/30 p-6 sm:p-8 md:p-14 grain">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full blur-[110px]"
                style={{ background: `${GOLD}33` }}
              />

              <div className="relative mx-auto max-w-2xl text-center">
                <SectionLabel>Ponuda</SectionLabel>
                <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
                  Izaberite kako želite da{" "}
                  <span className="text-gradient">sarađujemo</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                  Ista usluga, dva načina plaćanja. Svakog meseca dobijate 3
                  sata u studiju i 30 gotovih klipova.
                </p>
              </div>

              <div className="relative mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:mt-10 sm:grid-cols-2 sm:gap-5">
                {/* Tromesečni paket */}
                <motion.div
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="flex flex-col rounded-2xl gold-frame border border-transparent glow-gold bg-gradient-to-b from-[#f0b656]/[0.12] via-card to-card p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-gradient-to-r from-[#f0b656] to-[#d87928] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                      Preporučeno
                    </span>
                    <Repeat className="size-5" style={{ color: GOLD }} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">Tromesečni paket</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold sm:text-5xl">
                      {formatPrice(pkg.price)}€
                    </span>
                    <span className="text-muted-foreground">
                      / {pkg.priceNote}
                    </span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {monthlyPerks.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <LogoCheck className="mt-0.5 size-4 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Jedan mesec */}
                <motion.div
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="flex flex-col rounded-2xl border border-border card-glass p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-foreground/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Bez obaveze
                    </span>
                    <CalendarCheck className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">Samo jedan mesec</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold sm:text-5xl">
                      {formatPrice(pkg.oneTimePrice ?? 0)}€
                    </span>
                    <span className="text-muted-foreground">/ jedan mesec</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {oneTimePerks.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <LogoCheck className="mt-0.5 size-4 shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Garancija + jedan klijent po industriji */}
              <div className="relative mx-auto mt-5 grid max-w-3xl gap-4 text-left sm:grid-cols-2 sm:gap-5">
                <div className="flex gap-4 rounded-2xl border border-border card-glass p-5 sm:p-6">
                  <ShieldCheck
                    className="mt-0.5 size-6 shrink-0"
                    style={{ color: GOLD }}
                  />
                  <div>
                    <h3 className="font-bold">Garancija povraćaja novca</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Ako makar jedan video zakasni ijedan jedini minut -
                      vraćamo Vam apsolutno svaki dinar.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl border border-border card-glass p-5 sm:p-6">
                  <Users
                    className="mt-0.5 size-6 shrink-0"
                    style={{ color: GOLD }}
                  />
                  <div>
                    <h3 className="font-bold">Jedan klijent po industriji</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Ako Vaš konkurent zakaže poziv pre Vas, ne možemo da
                      radimo zajedno dok traje ugovor sa njim.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="relative mt-10 flex flex-col items-center gap-4 border-t border-border pt-8 text-center sm:mt-12 sm:pt-10">
                <PodcastQuizPopup>
                  <button type="button" className={ctaCls}>
                    Zakaži poziv
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </PodcastQuizPopup>

                <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                  Na kratkom sastanku vidimo da li ima smisla da ovo primenimo
                  na Vaš brend. Ako nema, reći ćemo Vam to otvoreno - a ako ima,
                  zakazujemo termin za prvo snimanje.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── FIXED BOTTOM CTA ───────────── */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="container-x flex flex-col items-center gap-1.5 py-2 sm:flex-row sm:justify-between sm:gap-4 sm:py-4">
            <div className="hidden items-baseline gap-1.5 sm:flex">
              <span className="font-display text-xl font-extrabold">
                {priceLabelFull(pkg)}
              </span>
              <span className="text-sm text-muted-foreground">
                kroz tromesečni paket
              </span>
            </div>

            <div className="flex w-full flex-col items-center gap-1 sm:w-auto sm:items-end sm:gap-1.5">
              <PodcastQuizPopup>
                <button type="button" className={`${ctaCls} w-full sm:w-auto`}>
                  Zakaži poziv
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 sm:size-5" />
                </button>
              </PodcastQuizPopup>
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center text-[10px] leading-tight text-muted-foreground sm:gap-x-3 sm:text-xs">
                <span>1 klijent po industriji</span>
                <span aria-hidden>·</span>
                <span>Potvrda na WhatsApp</span>
                <span aria-hidden className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline">Bez plaćanja na sajtu</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
