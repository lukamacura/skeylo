"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BellRing,
  BookOpen,
  Boxes,
  Brain,
  CalendarClock,
  Check,
  Clapperboard,
  Clock,
  Database,
  FileText,
  Globe,
  Layers,
  Lightbulb,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PenLine,
  Phone,
  Receipt,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import {
  BLUE,
  BLUE_DEEP,
  Count,
  GRAD,
  GREEN,
  Headline,
  MONO,
  NAVY,
  Slide,
  Sub,
  Visual,
  item,
  pop,
  useSlideActive,
  useTheme,
  wa,
  type DeckSlide,
} from "./kit";

type Icon = React.ElementType;

/* ------------------------------------------------------------------------ */
/* Prices. The cards, the value slide and the comparison read from these.   */
/* ------------------------------------------------------------------------ */
const PRICE_RENEW = "~30 €";
const PRICE_REDESIGN = 350;
const PRICE_OS = 950;
const EUR_RSD = 117.2;

/* Ciklon's own numbers, from the counter on the old site. */
const SOLD = 2325;

const gradText: CSSProperties = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/* ------------------------------------------------------------------------ */
/* Small pieces                                                              */
/* ------------------------------------------------------------------------ */

function Tile({ icon: I, size = 20 }: { icon: Icon; size?: number }) {
  return (
    <span
      className="grid h-10 w-10 flex-none place-items-center rounded-xl text-[#071521] md:h-11 md:w-11"
      style={{ background: GRAD }}
    >
      <I size={size} />
    </span>
  );
}

function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const t = useTheme();
  return (
    <motion.div
      variants={pop}
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: t.card, border: `1px solid ${t.line}`, ...style }}
    >
      {children}
    </motion.div>
  );
}

function Feature({ icon, title }: { icon: Icon; title: string }) {
  return (
    <Card className="flex items-center gap-3 !py-3">
      <Tile icon={icon} size={18} />
      <p className="text-[14px] font-bold leading-tight md:text-[15px]">
        {title}
      </p>
    </Card>
  );
}

function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <motion.p
      variants={item}
      className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] md:text-[12px]"
      style={{ fontFamily: MONO, color: t.hl }}
    >
      {children}
    </motion.p>
  );
}

/* MacBook Pro: black glass lid with the notch and camera, a thin aluminium
   rim, the browser inside, and the base with its thumb cut-out. Sized in
   container units, so it is the same object at any width. */
function MacBook({
  url,
  children,
  className = "",
  dark = false,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={className} style={{ containerType: "inline-size" }}>
      <div className="relative">
        {/* lid */}
        <div
          className="relative mx-auto"
          style={{
            width: "89%",
            padding: "1.05cqw 1.05cqw 1.45cqw",
            borderRadius: "2.3cqw 2.3cqw 0.5cqw 0.5cqw",
            background: "#0A0A0B",
            boxShadow:
              "0 0 0 0.1cqw #C9CDD2, 0 0 0 0.28cqw #6B7077, inset 0 0 0 0.12cqw #2A2A2D",
          }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center justify-center"
            style={{
              width: "8cqw",
              height: "1.35cqw",
              background: "#0A0A0B",
              borderRadius: "0 0 0.7cqw 0.7cqw",
            }}
          >
            <i
              className="block rounded-full"
              style={{
                width: "0.48cqw",
                height: "0.48cqw",
                background:
                  "radial-gradient(circle at 35% 35%, #4A5D7E, #0B0F18 70%)",
              }}
            />
          </span>
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: "0.9cqw 0.9cqw 0.12cqw 0.12cqw",
              background: dark ? "#1B2430" : "#fff",
            }}
          >
            <div
              className="relative flex items-center"
              style={{
                height: "2.5cqw",
                padding: "0 1.1cqw",
                background: dark ? "#232E3B" : "#F1F3F5",
                borderBottom: dark
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid #E3E7EB",
              }}
            >
              <span className="flex" style={{ gap: "0.45cqw" }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <i
                    key={c}
                    className="block rounded-full"
                    style={{
                      width: "0.75cqw",
                      height: "0.75cqw",
                      background: c,
                    }}
                  />
                ))}
              </span>
              <span
                className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
                style={{
                  width: "40%",
                  height: "1.55cqw",
                  gap: "0.4cqw",
                  fontSize: "0.85cqw",
                  borderRadius: "0.4cqw",
                  background: dark ? "rgba(255,255,255,0.07)" : "#fff",
                  color: dark ? "#9AA7B4" : "#5B6B77",
                  boxShadow: dark ? "none" : "0 0 0 1px #E3E7EB",
                }}
              >
                <Lock
                  style={{ width: "0.8cqw", height: "0.8cqw" }}
                  className="flex-none"
                />
                <span className="truncate">{url}</span>
              </span>
            </div>
            {children}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(118deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)",
              }}
            />
          </div>
        </div>
        {/* hinge + base */}
        <div
          className="relative mx-auto"
          style={{
            width: "89.6%",
            height: "0.55cqw",
            background: "linear-gradient(180deg,#2B2D31,#5A5E64)",
            borderRadius: "0 0 0.3cqw 0.3cqw",
          }}
        />
        <div
          className="relative"
          style={{
            height: "2.1cqw",
            marginTop: "-0.15cqw",
            borderRadius:
              "0.2cqw 0.2cqw 3cqw 3cqw / 0.2cqw 0.2cqw 1.9cqw 1.9cqw",
            background:
              "linear-gradient(180deg,#F4F5F7 0%,#DADDE1 22%,#B9BDC2 60%,#8C9097 88%,#6E737A 100%)",
            boxShadow: "inset 0 0.08cqw 0 #fff",
          }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: "15cqw",
              height: "0.75cqw",
              borderRadius: "0 0 1.2cqw 1.2cqw",
              background: "linear-gradient(180deg,#8E9298,#C9CCD0)",
              boxShadow: "inset 0 0.1cqw 0.2cqw rgba(0,0,0,0.25)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="absolute -z-10 rounded-[50%] blur-xl"
          style={{
            left: "6%",
            right: "6%",
            bottom: "-1.6cqw",
            height: "2.4cqw",
            background: "rgba(7,21,33,0.45)",
          }}
        />
      </div>
    </div>
  );
}

function Shot({
  src,
  alt,
  w,
  h,
  aspect = "16 / 10",
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  aspect?: string;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: aspect }}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
    </div>
  );
}

/* iPhone 16 Pro: titanium band with the buttons, black bezel, Dynamic
   Island, status bar and home indicator. `bar` paints the status bar in
   the page's own colour and pushes the screenshot below it, the way Safari
   shows a site; without it the page runs under the bar. */
function PhoneFrame({
  children,
  className = "",
  bar,
}: {
  children: ReactNode;
  className?: string;
  bar?: string;
}) {
  const btn = (side: "left" | "right", top: string, h: string) => (
    <span
      aria-hidden
      className="absolute"
      style={{
        [side]: "-0.9cqw",
        top,
        height: h,
        width: "1.3cqw",
        borderRadius: "0.6cqw",
        background: "linear-gradient(90deg,#55595F,#9A9EA4 50%,#55595F)",
      }}
    />
  );
  return (
    <div className={className} style={{ containerType: "inline-size" }}>
      <div className="relative">
        {btn("left", "17%", "6cqw")}
        {btn("left", "24%", "11.5cqw")}
        {btn("left", "31.5%", "11.5cqw")}
        {btn("right", "27%", "17cqw")}
        <div
          className="relative"
          style={{
            padding: "1.25cqw",
            borderRadius: "17cqw",
            background:
              "linear-gradient(140deg,#B4B7BC 0%,#6E7279 22%,#3A3D42 50%,#62666C 78%,#A9ACB1 100%)",
            boxShadow:
              "0 50px 80px -30px rgba(7,21,33,0.65), 0 18px 30px -18px rgba(7,21,33,0.5)",
          }}
        >
          <div
            style={{
              padding: "3cqw",
              borderRadius: "15.8cqw",
              background: "#000",
              boxShadow: "inset 0 0 0 0.35cqw #15161A",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: "390 / 844",
                borderRadius: "12.6cqw",
                background: bar ?? "#000",
              }}
            >
              <div
                className="absolute inset-x-0 bottom-0"
                style={{ top: bar ? "12.5cqw" : 0 }}
              >
                {children}
              </div>
              <div
                className="absolute inset-x-0 top-0 z-10 flex items-center justify-between font-semibold text-white"
                style={{
                  height: "12.5cqw",
                  padding: "1.6cqw 9cqw 0 11cqw",
                  fontSize: "4.1cqw",
                }}
              >
                <span>9:41</span>
                <span className="flex items-center" style={{ gap: "1.4cqw" }}>
                  <span
                    className="flex items-end"
                    style={{ gap: "0.5cqw", height: "3cqw" }}
                  >
                    {[40, 60, 80, 100].map((p) => (
                      <i
                        key={p}
                        className="block bg-white"
                        style={{
                          width: "0.9cqw",
                          height: `${p}%`,
                          borderRadius: "0.3cqw",
                        }}
                      />
                    ))}
                  </span>
                  <span
                    className="block"
                    style={{
                      width: "6.6cqw",
                      height: "3.2cqw",
                      borderRadius: "1.1cqw",
                      border: "0.35cqw solid rgba(255,255,255,0.45)",
                      padding: "0.35cqw",
                    }}
                  >
                    <i
                      className="block h-full bg-white"
                      style={{ width: "80%", borderRadius: "0.5cqw" }}
                    />
                  </span>
                </span>
              </div>
              <span
                aria-hidden
                className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black"
                style={{ top: "2.6cqw", width: "29cqw", height: "8.4cqw" }}
              >
                <i
                  className="absolute rounded-full"
                  style={{
                    right: "3cqw",
                    top: "2.5cqw",
                    width: "3.4cqw",
                    height: "3.4cqw",
                    background:
                      "radial-gradient(circle at 35% 35%, #2C3B55, #05070B 70%)",
                  }}
                />
              </span>
              <span
                aria-hidden
                className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/80"
                style={{ bottom: "2.2cqw", width: "34cqw", height: "1.3cqw" }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 32%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneShot({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={390}
      height={844}
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  );
}

/* Water rising behind the dark title slides. */
function Bubbles() {
  const dots = [
    [8, 14, 0],
    [18, 8, 2.2],
    [27, 18, 1.1],
    [41, 10, 3.4],
    [55, 22, 0.6],
    [63, 12, 2.8],
    [72, 16, 1.7],
    [84, 9, 0.3],
    [92, 20, 2.5],
    [35, 6, 4.1],
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute -top-1/3 left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(closest-side, ${BLUE}55, transparent)`,
        }}
      />
      <div
        className="absolute -bottom-1/3 right-0 h-[60vh] w-[70vw] rounded-full opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(closest-side, ${GREEN}55, transparent)`,
        }}
      />
      {dots.map(([left, size, delay], i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-40px] rounded-full"
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            border: `1.5px solid ${BLUE}88`,
            background: `${BLUE}14`,
          }}
          animate={{ y: [0, -900], opacity: [0, 0.9, 0] }}
          transition={{
            duration: 9 + (i % 4),
            delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* The new Ciklon site, drawn in code. Everything inside is sized in        */
/* container units, so it is the same page at any width.                    */
/* ------------------------------------------------------------------------ */
const cq = (n: number): CSSProperties => ({ fontSize: `${n}cqw` });

const PRODUCTS = [
  {
    src: "/clients/ciklon/proizvod.webp",
    name: "P'URE Balans",
    tag: "Reverzna osmoza",
  },
  {
    src: "/clients/ciklon/proizvod2.webp",
    name: "Kabinet Soft",
    tag: "Omekšivač",
  },
  {
    src: "/clients/ciklon/proizvod3.webp",
    name: "Baterija 3u1",
    tag: "Slavina",
  },
  {
    src: "/clients/ciklon/proizvod4.webp",
    name: "SALTECH Plus",
    tag: "So za omekšivač",
  },
];

function SiteDesktop() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        containerType: "inline-size",
        aspectRatio: "16 / 10",
        background: NAVY,
      }}
    >
      <div
        aria-hidden
        className="absolute rounded-full blur-3xl"
        style={{
          right: "-8%",
          top: "-20%",
          width: "60%",
          height: "90%",
          background: `radial-gradient(closest-side, ${BLUE}66, transparent)`,
        }}
      />
      <div
        aria-hidden
        className="absolute rounded-full blur-3xl"
        style={{
          left: "-10%",
          bottom: "-40%",
          width: "50%",
          height: "80%",
          background: `radial-gradient(closest-side, ${GREEN}40, transparent)`,
        }}
      />

      {/* nav */}
      <div
        className="relative flex items-center"
        style={{ padding: "2.2cqw 4cqw" }}
      >
        <Image
          src="/clients/ciklon/logo.webp"
          alt=""
          width={640}
          height={384}
          style={{ height: "3.6cqw", width: "auto" }}
        />
        <div
          className="flex text-white/75"
          style={{
            ...cq(1.15),
            gap: "2.6cqw",
            marginLeft: "auto",
            marginRight: "2.6cqw",
          }}
        >
          <span>Proizvodi</span>
          <span>Servis</span>
          <span>Iznajmljivanje</span>
          <span>Blog</span>
          <span>Kontakt</span>
        </div>
        <span
          className="flex items-center rounded-full font-bold text-[#071521]"
          style={{
            ...cq(1.1),
            background: GRAD,
            padding: "0.8cqw 1.6cqw",
            gap: "0.6cqw",
          }}
        >
          <Phone style={{ width: "1.2cqw", height: "1.2cqw" }} /> 060 384 8880
        </span>
      </div>

      {/* hero */}
      <div
        className="relative grid grid-cols-[1.15fr_1fr] items-center"
        style={{ padding: "1.5cqw 4cqw 0" }}
      >
        <div>
          <span
            className="inline-flex items-center rounded-full text-white/80"
            style={{
              ...cq(1),
              padding: "0.5cqw 1.2cqw",
              gap: "0.6cqw",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <i
              className="rounded-full"
              style={{ width: "0.7cqw", height: "0.7cqw", background: GREEN }}
            />
            Od 2017. · 2.325 ugrađenih aparata
          </span>
          <p
            className="font-extrabold text-white"
            style={{
              ...cq(5.4),
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              marginTop: "1.6cqw",
            }}
          >
            Čista voda.
            <br />
            <span style={gradText}>Iz svake česme.</span>
          </p>
          <p
            className="text-[#A9BCCB]"
            style={{
              ...cq(1.35),
              lineHeight: 1.45,
              marginTop: "1.6cqw",
              maxWidth: "34cqw",
            }}
          >
            Filteri, omekšivači i servis za dom i firmu. Ugradnja, zamena
            filtera i podsetnik kad je vreme.
          </p>
          <div className="flex" style={{ gap: "1cqw", marginTop: "2.2cqw" }}>
            <span
              className="rounded-full font-bold text-[#071521]"
              style={{ ...cq(1.2), background: GRAD, padding: "1cqw 2cqw" }}
            >
              Besplatna provera vode
            </span>
            <span
              className="rounded-full font-bold text-white"
              style={{
                ...cq(1.2),
                padding: "1cqw 2cqw",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Pogledaj filtere
            </span>
          </div>
        </div>
        <div className="relative" style={{ height: "31cqw" }}>
          <div
            className="absolute"
            style={{
              inset: "3cqw 4cqw 0 6cqw",
              borderRadius: "42% 12% 42% 12%",
              background: GRAD,
              opacity: 0.95,
            }}
          />
          <Image
            src="/clients/ciklon/proizvod.webp"
            alt="P'URE Balans filter"
            width={473}
            height={528}
            className="absolute"
            style={{
              left: "50%",
              bottom: "0",
              height: "100%",
              width: "auto",
              transform: "translateX(-46%)",
            }}
          />
          <div
            className="absolute flex items-center rounded-xl bg-white text-[#0B1B26] shadow-xl"
            style={{
              left: "-2cqw",
              bottom: "4cqw",
              padding: "1cqw 1.4cqw",
              gap: "1cqw",
            }}
          >
            <span
              className="grid place-items-center rounded-lg text-[#071521]"
              style={{ width: "3cqw", height: "3cqw", background: GRAD }}
            >
              <BellRing style={{ width: "1.5cqw", height: "1.5cqw" }} />
            </span>
            <span style={{ ...cq(1), lineHeight: 1.25 }}>
              <b>Vreme je za zamenu</b>
              <br />
              <span className="text-[#5B6B77]">Javljamo vam sami</span>
            </span>
          </div>
        </div>
      </div>

      {/* products */}
      <div
        className="absolute inset-x-0 bottom-0 grid grid-cols-4"
        style={{ gap: "1.2cqw", padding: "0 4cqw 2.4cqw" }}
      >
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="flex items-center rounded-xl"
            style={{
              gap: "1cqw",
              padding: "0.9cqw",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="relative flex-none rounded-lg bg-white"
              style={{ width: "4.6cqw", height: "4.6cqw" }}
            >
              <Image
                src={p.src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-[8%]"
              />
            </span>
            <span className="min-w-0">
              <b className="block truncate text-white" style={cq(1.1)}>
                {p.name}
              </b>
              <span className="block truncate text-[#A9BCCB]" style={cq(0.9)}>
                {p.tag}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteMobile() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ containerType: "inline-size", background: NAVY }}
    >
      <div
        aria-hidden
        className="absolute rounded-full blur-2xl"
        style={{
          right: "-30%",
          top: "8%",
          width: "110%",
          height: "40%",
          background: `radial-gradient(closest-side, ${BLUE}66, transparent)`,
        }}
      />
      <div
        className="relative flex items-center justify-between"
        style={{ padding: "13cqw 6cqw 4cqw" }}
      >
        <Image
          src="/clients/ciklon/logo.webp"
          alt=""
          width={640}
          height={384}
          style={{ height: "9cqw", width: "auto" }}
        />
        <Menu
          className="text-white"
          style={{ width: "7cqw", height: "7cqw" }}
        />
      </div>
      <div className="relative" style={{ padding: "2cqw 6cqw" }}>
        <p
          className="font-extrabold text-white"
          style={{ ...cq(11.5), lineHeight: 0.98, letterSpacing: "-0.03em" }}
        >
          Čista voda.
          <br />
          <span style={gradText}>Iz svake česme.</span>
        </p>
        <p
          className="text-[#A9BCCB]"
          style={{ ...cq(4), lineHeight: 1.4, marginTop: "4cqw" }}
        >
          Filteri, omekšivači i servis za dom i firmu.
        </p>
        <span
          className="block rounded-full text-center font-bold text-[#071521]"
          style={{
            ...cq(4),
            background: GRAD,
            padding: "3.4cqw",
            marginTop: "5cqw",
          }}
        >
          Besplatna provera vode
        </span>
      </div>
      <div className="relative" style={{ height: "62cqw", marginTop: "4cqw" }}>
        <div
          className="absolute"
          style={{
            inset: "2cqw 12cqw 0",
            borderRadius: "42% 12% 42% 12%",
            background: GRAD,
          }}
        />
        <Image
          src="/clients/ciklon/proizvod.webp"
          alt=""
          width={473}
          height={528}
          className="absolute"
          style={{ left: "16%", bottom: 0, width: "68%", height: "auto" }}
        />
      </div>
      <div
        className="relative grid grid-cols-2"
        style={{ gap: "3cqw", padding: "5cqw 6cqw" }}
      >
        {PRODUCTS.slice(1, 3).map((p) => (
          <div
            key={p.name}
            className="rounded-xl bg-white/[0.06]"
            style={{ padding: "3cqw" }}
          >
            <span
              className="relative block rounded-lg bg-white"
              style={{ height: "22cqw" }}
            >
              <Image
                src={p.src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-[8%]"
              />
            </span>
            <b className="mt-[2cqw] block truncate text-white" style={cq(3.4)}>
              {p.name}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* 1. Cover                                                                  */
/* ------------------------------------------------------------------------ */
function Cover() {
  return (
    <Slide eyebrow={false} backdrop={<Bubbles />}>
      <motion.div
        variants={item}
        className="mb-8 flex items-center gap-4 md:mb-12"
      >
        <span className="rounded-2xl bg-white px-4 py-2.5">
          <Image
            src="/clients/ciklon/logo.webp"
            alt="Ciklon Filters"
            width={640}
            height={384}
            className="h-9 w-auto md:h-11"
          />
        </span>
        <span className="text-2xl font-light text-white/40">×</span>
        <span className="text-[22px] font-extrabold tracking-tight md:text-[26px]">
          Skeylo
        </span>
      </motion.div>
      <Headline size="xl">
        {"Nikola, Ciklon zaslužuje [[sistem koji prodaje.]]"}
      </Headline>
      <Sub>Tri opcije, sa cenama. Ti biraš.</Sub>
      <motion.div
        variants={item}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-[#A9BCCB] md:text-[12px]"
        style={{ fontFamily: MONO }}
      >
        <span>Ponuda · novembar 2026</span>
        <span>Luka Macura · Skeylo</span>
        <span className="text-[#52C1EA]">Strelice ili prevuci →</span>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 2. The old site                                                           */
/* ------------------------------------------------------------------------ */
const FLAWS: [Icon, string][] = [
  [Server, "Sajt je ugašen"],
  [Mail, "Forma ne šalje poruke"],
  [TriangleAlert, "Dugmad ne vode nigde"],
  [FileText, "„Lorem ipsum“ i „100$“ u kodu"],
  [PenLine, "Greške u tekstu"],
  [Search, "Google ne vidi proizvode"],
];

function OldSite() {
  return (
    <Slide wide>
      <div className="grid items-center gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
        <div>
          <Headline size="lg">{"Ciklon danas. [[Sajt koji ćuti.]]"}</Headline>
          <motion.ul
            variants={item}
            className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1"
          >
            {FLAWS.map(([I, text]) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-[14px] font-semibold md:text-[16px]"
              >
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#E5484D] text-white">
                  <I size={14} />
                </span>
                {text}
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div variants={item} className="relative pb-6 pr-[12%]">
          <MacBook url="ciklonfilters.com">
            <Shot
              src="/clients/ciklon/stari-desktop.webp"
              alt="Stari sajt Ciklon Filters"
              w={1440}
              h={900}
            />
          </MacBook>
          <PhoneFrame
            bar="#333333"
            className="absolute bottom-0 right-0 w-[21%]"
          >
            <PhoneShot
              src="/clients/ciklon/stari-mobilni.webp"
              alt="Stari sajt na telefonu"
            />
          </PhoneFrame>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 3. The numbers the site hides                                             */
/* ------------------------------------------------------------------------ */
const NUMBERS = [
  { n: SOLD, label: "prodatih aparata" },
  { n: 1120, label: "servisa" },
  { n: 955, label: "iznajmljenih aparata" },
  { n: 2017, label: "od godine", plain: true },
];

function Numbers() {
  const t = useTheme();
  return (
    <Slide backdrop={<Bubbles />}>
      <Headline size="lg">{"Iza Ciklona je [[ozbiljan posao.]]"}</Headline>
      <Visual>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {NUMBERS.map((x, i) => (
            <Card key={x.label}>
              <p
                className="text-[clamp(2.2rem,7vw,3.8rem)] font-extrabold leading-none tracking-tight"
                style={gradText}
              >
                {x.plain ? x.n : <Count to={x.n} delay={0.2 + i * 0.1} />}
              </p>
              <p
                className="mt-2 text-[14px] md:text-[16px]"
                style={{ color: t.muted }}
              >
                {x.label}
              </p>
            </Card>
          ))}
        </div>
      </Visual>
      <Sub>
        Svaki od tih kupaca jednom mora da zameni filter. Danas to niko ne
        prati.
      </Sub>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 4. Who builds it: the photos, large                                       */
/* ------------------------------------------------------------------------ */
const PHOTOS = [
  {
    src: "/people/luka.webp",
    w: 1500,
    h: 2000,
    cap: "Luka Macura · Skeylo",
    pos: "50% 25%",
  },
  {
    src: "/clients/ciklon/luka-rad.webp",
    w: 1758,
    h: 2160,
    cap: "Svaki projekat lično",
    pos: "50% 40%",
  },
  {
    src: "/people/luka/radni-sto.webp",
    w: 1126,
    h: 2000,
    cap: "Radni sto, svaki dan",
    pos: "50% 55%",
  },
];

function Who() {
  return (
    <Slide theme="light" wide>
      <Headline>{"Ja pravim. [[Ja i odgovaram.]]"}</Headline>
      <Visual>
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {PHOTOS.map((p, i) => (
            <motion.figure
              key={p.src}
              variants={pop}
              className="relative overflow-hidden rounded-[20px] shadow-[0_30px_60px_-30px_rgba(7,21,33,0.5)]"
              style={{ rotate: i === 1 ? 0 : i === 0 ? -1.2 : 1.2 }}
            >
              <Image
                src={p.src}
                alt={p.cap}
                width={p.w}
                height={p.h}
                sizes="(min-width: 1024px) 30vw, 33vw"
                className="aspect-[3/4] h-auto max-h-[62vh] w-full object-cover"
                style={{ objectPosition: p.pos }}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-[11px] font-bold text-white md:px-4 md:pb-3.5 md:text-[15px]">
                {p.cap}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 5. Last site                                                              */
/* ------------------------------------------------------------------------ */
function LastSite() {
  const t = useTheme();
  return (
    <Slide theme="light" wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Headline>{"Moj poslednji sajt. [[Balsoa Consulting.]]"}</Headline>
        <motion.a
          variants={item}
          href="https://www.balsoaconsulting.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-bold"
          style={{ background: t.card, border: `1px solid ${t.line}` }}
        >
          balsoaconsulting.com{" "}
          <ArrowUpRight size={16} style={{ color: BLUE_DEEP }} />
        </motion.a>
      </div>
      <Visual>
        <div className="relative pb-8 pl-[10%]">
          <MacBook url="balsoaconsulting.com" dark>
            <Shot
              src="/clients/ciklon/balsoa-desktop.webp"
              alt="Sajt Balsoa Consulting"
              w={1440}
              h={900}
            />
          </MacBook>
          <PhoneFrame
            bar="#0B0D10"
            className="absolute bottom-0 left-0 w-[17%]"
          >
            <PhoneShot
              src="/clients/ciklon/balsoa-mobilni.webp"
              alt="Balsoa Consulting na telefonu"
            />
          </PhoneFrame>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 6. Three ways                                                             */
/* ------------------------------------------------------------------------ */
const OPTIONS = [
  {
    tag: "Opcija 1",
    name: "Obnova",
    price: PRICE_RENEW,
    per: "godišnje",
    line: "Stari sajt, opet online.",
    icon: RefreshCw,
  },
  {
    tag: "Opcija 2",
    name: "Novi sajt",
    price: `${PRICE_REDESIGN} €`,
    per: "jednom · domen uključen",
    line: "Next.js, blog, bez hostinga.",
    icon: Sparkles,
  },
  {
    tag: "Opcija 3",
    name: "Operativni sistem",
    price: `${PRICE_OS} €`,
    per: "jednom · novi sajt uključen",
    line: "Sajt + ERP + baza znanja + AI agent.",
    icon: Layers,
    best: true,
  },
];

function ThreeWays() {
  const t = useTheme();
  return (
    <Slide>
      <Headline size="lg">{"Tri puta. [[Ti biraš.]]"}</Headline>
      <Visual>
        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_1fr_1.25fr] md:gap-4">
          {OPTIONS.map((o) => (
            <motion.div
              key={o.name}
              variants={pop}
              className="relative flex flex-col rounded-2xl p-5 md:p-6"
              style={{
                background: o.best
                  ? "linear-gradient(160deg, rgba(82,193,234,0.18), rgba(120,191,66,0.12))"
                  : t.card,
                border: o.best ? `1.5px solid ${BLUE}` : `1px solid ${t.line}`,
                boxShadow: o.best
                  ? "0 30px 60px -30px rgba(82,193,234,0.5)"
                  : undefined,
              }}
            >
              {o.best && (
                <span
                  className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#071521]"
                  style={{ background: GRAD, fontFamily: MONO }}
                >
                  Preporuka
                </span>
              )}
              <div className="flex items-center gap-3">
                <Tile icon={o.icon} />
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.16em]"
                    style={{ fontFamily: MONO, color: t.muted }}
                  >
                    {o.tag}
                  </p>
                  <p className="text-[19px] font-extrabold">{o.name}</p>
                </div>
              </div>
              <p
                className="mt-5 text-[clamp(2rem,6vw,2.9rem)] font-extrabold leading-none tracking-tight"
                style={o.best ? gradText : undefined}
              >
                {o.price}
              </p>
              <p
                className="mt-1.5 text-[12px]"
                style={{ color: t.muted, fontFamily: MONO }}
              >
                {o.per}
              </p>
              <p className="mt-4 text-[15px] font-semibold leading-snug">
                {o.line}
              </p>
            </motion.div>
          ))}
        </div>
      </Visual>
      <Sub>
        Razlika između novog sajta i celog sistema:{" "}
        <b className="text-white">{PRICE_OS - PRICE_REDESIGN} €.</b>
      </Sub>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 7. Option 1: renew                                                        */
/* ------------------------------------------------------------------------ */
function Renew() {
  const t = useTheme();
  const yes = ["Stari sajt online", "Domen + hosting (GoDaddy)", "SSL"];
  const no = [
    "Iste greške",
    "Forma ne radi",
    "Bez bloga",
    "Hosting svake godine",
  ];
  return (
    <Slide theme="cream">
      <Label>Opcija 1 · Obnova</Label>
      <Headline size="lg">{"Isti sajt. [[Opet online.]]"}</Headline>
      <Visual>
        <div className="grid gap-4 md:grid-cols-[auto_1fr_1fr] md:gap-5">
          <Card className="flex flex-col justify-center md:min-w-[230px]">
            <p className="text-[clamp(2.6rem,9vw,4rem)] font-extrabold leading-none tracking-tight">
              {PRICE_RENEW}
            </p>
            <p
              className="mt-2 text-[13px]"
              style={{ color: t.muted, fontFamily: MONO }}
            >
              svake godine
            </p>
          </Card>
          <Card>
            {yes.map((x) => (
              <p
                key={x}
                className="flex items-center gap-2.5 py-1.5 text-[15px] font-semibold md:text-[16px]"
              >
                <Check
                  size={17}
                  style={{ color: GREEN }}
                  className="flex-none"
                />{" "}
                {x}
              </p>
            ))}
          </Card>
          <Card>
            {no.map((x) => (
              <p
                key={x}
                className="flex items-center gap-2.5 py-1.5 text-[15px] md:text-[16px]"
                style={{ color: t.muted }}
              >
                <Minus size={17} className="flex-none" /> {x}
              </p>
            ))}
          </Card>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 8. Option 2: the new site                                                 */
/* ------------------------------------------------------------------------ */
const REDESIGN: [Icon, string][] = [
  [Zap, "Next.js · hosting 0 €"],
  [PenLine, "Blog koji pišete sami"],
  [ShoppingBag, "Stranica za svaki filter"],
  [MessageCircle, "Upiti na mejl i WhatsApp"],
  [CalendarClock, "Zakazivanje provere vode"],
];

function Redesign() {
  const t = useTheme();
  return (
    <Slide theme="light" wide>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <Label>Opcija 2 · Novi sajt</Label>
          <Headline>{"Novi Ciklon. [[350 €.]]"}</Headline>
        </div>
        <motion.p
          variants={item}
          className="pb-1.5 text-[13px] md:text-[14px]"
          style={{ color: t.muted, fontFamily: MONO }}
        >
          jednom · domen uključen · hosting 0 €
        </motion.p>
      </div>
      <Visual className="!mt-6">
        <div className="grid items-center gap-6 lg:grid-cols-[1.55fr_0.45fr] lg:gap-8">
          <div className="relative pb-[5%] pr-[13%]">
            <MacBook url="ciklonfilters.com">
              <SiteDesktop />
            </MacBook>
            <PhoneFrame className="absolute bottom-0 right-0 w-[18%]">
              <SiteMobile />
            </PhoneFrame>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {REDESIGN.map(([I, title]) => (
              <Feature key={title} icon={I} title={title} />
            ))}
          </div>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 9. Option 3: the operating system                                         */
/* ------------------------------------------------------------------------ */
const MODULES: [Icon, string][] = [
  [Sparkles, "Novi sajt"],
  [Users, "Klijenti i aparati"],
  [Wrench, "Servis i zamena filtera"],
  [RefreshCw, "Iznajmljivanje"],
  [Boxes, "Magacin"],
  [Truck, "Teren i rute"],
  [Receipt, "Računovodstvo"],
  [Brain, "Baza znanja + AI"],
];

const STEPS = [
  "Upoznavanje firme",
  "Radnici",
  "Logistika i knjige",
  "Izrada",
  "Obuka",
];

function OS() {
  const t = useTheme();
  const active = useSlideActive();
  return (
    <Slide>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <Label>Opcija 3 · Preporuka</Label>
          <Headline size="lg">{"Ceo Ciklon u [[jednom sistemu.]]"}</Headline>
        </div>
        <motion.div variants={item} className="pb-1 text-right">
          <p
            className="text-[clamp(2.6rem,8vw,4.2rem)] font-extrabold leading-none tracking-tight"
            style={gradText}
          >
            {PRICE_OS} €
          </p>
          <p
            className="mt-1 text-[12px] md:text-[13px]"
            style={{ color: t.muted, fontFamily: MONO }}
          >
            jednom · novi sajt uključen
          </p>
        </motion.div>
      </div>
      <Visual>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          {MODULES.map(([I, title], i) => (
            <Card
              key={title}
              className="flex items-center gap-3 !p-3.5 md:!p-4"
              style={i === 0 ? { border: `1px solid ${BLUE}` } : undefined}
            >
              <I
                size={20}
                style={{ color: i === 0 ? GREEN : BLUE }}
                className="flex-none"
              />
              <p className="text-[14px] font-bold leading-tight md:text-[16px]">
                {title}
              </p>
            </Card>
          ))}
        </div>
      </Visual>
      <motion.div variants={item} className="mt-8 md:mt-10">
        <div className="relative grid grid-cols-5 gap-1">
          <div
            className="absolute left-[10%] right-[10%] top-[13px] h-[2px]"
            style={{ background: t.line }}
          >
            <motion.i
              className="absolute -top-[4px] block h-2.5 w-2.5 rounded-full"
              style={{ background: GREEN }}
              initial={{ left: "0%" }}
              animate={active ? { left: ["0%", "100%"] } : { left: "0%" }}
              transition={{
                duration: 3,
                delay: 0.8,
                repeat: Infinity,
                repeatDelay: 0.4,
                ease: "easeInOut",
              }}
            />
          </div>
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="relative flex flex-col items-center text-center"
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-extrabold text-[#071521]"
                style={{ background: GRAD }}
              >
                {i + 1}
              </span>
              <span className="mt-2 text-[11px] font-semibold leading-tight md:text-[14px]">
                {s}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 10. What the system is worth: Nikola puts in his own numbers              */
/* ------------------------------------------------------------------------ */
const rsd = (n: number) => Math.round(n).toLocaleString("de-DE");

function Value() {
  const t = useTheme();
  const [share, setShare] = useState(20);
  const [price, setPrice] = useState(4000);

  const services = Math.round((SOLD * share) / 100);
  const yearly = services * price;
  const cost = PRICE_OS * EUR_RSD;
  const payback = price > 0 ? Math.ceil(cost / price) : 0;

  return (
    <Slide>
      <Headline size="lg">{"950 € se [[vrati samo.]]"}</Headline>
      <Sub>
        Sistem podseti svakog kupca kad mu ističe filter. Upiši svoje brojke.
      </Sub>
      <Visual>
        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr] md:gap-5">
          <Card className="space-y-6">
            <label className="block">
              <span className="flex items-baseline justify-between text-[14px] font-semibold md:text-[15px]">
                Koliko od {rsd(SOLD)} kupaca se vrati godišnje
                <b className="text-[20px]" style={{ color: BLUE }}>
                  {share}%
                </b>
              </span>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={share}
                onChange={(e) => setShare(Number(e.target.value))}
                className="mt-3 w-full accent-[#52C1EA]"
              />
            </label>
            <label className="block">
              <span className="text-[14px] font-semibold md:text-[15px]">
                Prosečna zamena filtera (RSD)
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                value={price}
                onChange={(e) =>
                  setPrice(Math.max(0, Number(e.target.value) || 0))
                }
                className="mt-2 w-full rounded-xl bg-white/[0.06] px-4 py-3 text-[20px] font-bold text-white outline-none focus:ring-2 focus:ring-[#52C1EA]"
                style={{ border: `1px solid ${t.line}` }}
              />
            </label>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-[clamp(1.9rem,5vw,2.8rem)] font-extrabold leading-none tracking-tight">
                {rsd(services)}
              </p>
              <p
                className="mt-2 text-[13px] md:text-[14px]"
                style={{ color: t.muted }}
              >
                zamena godišnje
              </p>
            </Card>
            <Card>
              <p className="text-[clamp(1.9rem,5vw,2.8rem)] font-extrabold leading-none tracking-tight">
                {rsd(payback)}
              </p>
              <p
                className="mt-2 text-[13px] md:text-[14px]"
                style={{ color: t.muted }}
              >
                zamena i sistem je otplaćen
              </p>
            </Card>
            <Card
              className="col-span-2"
              style={{ border: `1.5px solid ${BLUE}` }}
            >
              <p
                className="text-[clamp(2.1rem,6vw,3.4rem)] font-extrabold leading-none tracking-tight"
                style={gradText}
              >
                {rsd(yearly)} RSD
              </p>
              <p
                className="mt-2 text-[13px] md:text-[14px]"
                style={{ color: t.muted }}
              >
                godišnje, samo od podsetnika · za 3 godine {rsd(yearly * 3)} RSD
              </p>
            </Card>
          </div>
        </div>
      </Visual>
      <motion.div
        variants={item}
        className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] md:text-[15px]"
      >
        {(
          [
            [Clock, "Manje papira i poziva"],
            [ShieldCheck, "Nijedan kupac ne propadne"],
            [TrendingUp, "Brojke uživo, svaki dan"],
          ] as [Icon, string][]
        ).map(([I, x]) => (
          <span key={x} className="flex items-center gap-2 font-semibold">
            <I size={17} style={{ color: GREEN }} /> {x}
          </span>
        ))}
      </motion.div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 11. Knowledge base (RAG)                                                  */
/* ------------------------------------------------------------------------ */
const SOURCES: [Icon, string][] = [
  [BookOpen, "Uputstva"],
  [Receipt, "Cenovnici"],
  [FileText, "Ugovori"],
  [Wrench, "Servisni zapisi"],
  [Lightbulb, "Iskustvo radnika"],
];

function Knowledge() {
  const t = useTheme();
  return (
    <Slide theme="cream">
      <Headline size="lg">{"Svako zna [[sve što firma zna.]]"}</Headline>
      <Sub>Radnik pita, sistem odgovara iz vaših dokumenata.</Sub>
      <Visual>
        <div className="grid items-center gap-4 md:grid-cols-[0.7fr_auto_1.3fr] md:gap-6">
          <div className="flex flex-wrap gap-2 md:flex-col">
            {SOURCES.map(([I, label]) => (
              <Card
                key={label}
                className="flex items-center gap-2.5 !px-3.5 !py-2.5"
              >
                <I size={17} style={{ color: BLUE_DEEP }} />
                <span className="text-[13px] font-semibold md:text-[15px]">
                  {label}
                </span>
              </Card>
            ))}
          </div>
          <motion.div
            variants={pop}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-[#071521] md:h-20 md:w-20"
            style={{ background: GRAD }}
          >
            <Database size={30} />
          </motion.div>
          <Card className="overflow-hidden !p-0">
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: `1px solid ${t.line}` }}
            >
              <Brain size={16} style={{ color: BLUE_DEEP }} />
              <span className="text-[13px] font-bold">Ciklon baza znanja</span>
              <span
                className="ml-auto text-[10px] uppercase tracking-[0.12em]"
                style={{ fontFamily: MONO, color: t.muted }}
              >
                primer
              </span>
            </div>
            <div className="space-y-3 p-4">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#E8F6FC] px-3.5 py-2.5 text-[14px] md:text-[15px]">
                Klijent ima P&apos;URE Balans od marta. Šta menjam?
              </div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="w-fit max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[14px] leading-snug md:text-[15px]"
                style={{ background: t.bg }}
              >
                Tri predfiltera. Membrana ostaje još ~16 meseci.
                <span
                  className="mt-2 block text-[11px]"
                  style={{ fontFamily: MONO, color: t.muted }}
                >
                  Izvor: Uputstvo P&apos;URE Balans · Servisni karton
                </span>
              </motion.div>
            </div>
          </Card>
        </div>
      </Visual>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 12. The AI agent                                                          */
/* ------------------------------------------------------------------------ */
const TASKS = [
  { who: "Jelena M. · Liman 3", what: "Ističe filter danas", a: "Pozovi" },
  { who: "Dragan P. · Veternik", what: "Servis sutra 10:30", a: "Potvrdi" },
  { who: "Kafić Dunav · Centar", what: "Kasni uplata 12 dana", a: "SMS" },
];

function Agent() {
  const t = useTheme();
  return (
    <Slide theme="light">
      <div className="grid items-center gap-7 md:grid-cols-[1fr_1fr] md:gap-12">
        <div>
          <Headline>
            {"AI agent. [[Svako jutro]] zna koga treba zvati."}
          </Headline>
          <motion.div variants={item} className="mt-7 grid grid-cols-2 gap-3">
            {(
              [
                [BarChart3, "Analizira"],
                [Target, "Predlaže"],
                [BellRing, "Podseća"],
                [MessageCircle, "Odgovara"],
              ] as [Icon, string][]
            ).map(([I, a]) => (
              <span
                key={a}
                className="flex items-center gap-2.5 text-[15px] font-bold md:text-[17px]"
              >
                <I size={19} style={{ color: BLUE_DEEP }} /> {a}
              </span>
            ))}
          </motion.div>
          <motion.p
            variants={item}
            className="mt-6 text-[13px]"
            style={{ color: t.muted, fontFamily: MONO }}
          >
            Isti agent već radi u Infinity Laser Studiju.
          </motion.p>
        </div>

        <motion.div
          variants={pop}
          className="overflow-hidden rounded-3xl text-white shadow-[0_40px_80px_-30px_rgba(7,21,33,0.6)]"
          style={{
            background: NAVY,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-[#071521]"
              style={{ background: GRAD }}
            >
              <Sparkles size={17} />
            </span>
            <div>
              <p className="text-[14px] font-bold">Ciklon asistent</p>
              <p className="text-[11px] text-[#A9BCCB]">
                Ponedeljak, 8:00 · primer
              </p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl rounded-tl-md bg-white/[0.07] px-3.5 py-3 text-[14px] leading-relaxed"
            >
              Ove nedelje ističe filter kod <b>14 klijenata</b>. Marko neka
              krene od Limana.
            </motion.p>
            {TASKS.map((x, i) => (
              <motion.div
                key={x.who}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.18 }}
                className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5"
              >
                <Phone size={15} className="flex-none text-[#52C1EA]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{x.who}</p>
                  <p className="truncate text-[11.5px] text-[#A9BCCB]">
                    {x.what}
                  </p>
                </div>
                <span
                  className="flex-none rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#071521]"
                  style={{ background: GRAD }}
                >
                  {x.a}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 13. Proof: Infinity Laser Studio                                          */
/* ------------------------------------------------------------------------ */
function InfinityProof() {
  const t = useTheme();
  return (
    <Slide wide>
      <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <Label>Dokaz · već radi</Label>
          <Headline>{"Infinity Laser Studio. [[Isti sistem.]]"}</Headline>
          <motion.div variants={item} className="mt-7">
            <p
              className="text-[clamp(2.8rem,8vw,5rem)] font-extrabold leading-none tracking-tight"
              style={gradText}
            >
              <Count to={4000000} suffix="+" duration={1.8} delay={0.3} />
            </p>
            <p
              className="mt-2 text-[14px] md:text-[16px]"
              style={{ color: t.muted }}
            >
              RSD prošlog meseca · Novi Sad + Sombor
            </p>
          </motion.div>
        </div>
        <motion.div variants={item}>
          <MacBook url="infinity · control center" dark>
            <Shot
              src="/clients/ciklon/infinity-os.webp"
              alt="Infinity Laser Studio kontrolni centar"
              w={1205}
              h={1068}
              aspect="1205 / 760"
            />
          </MacBook>
          <p
            className="mt-3 text-[11px]"
            style={{ fontFamily: MONO, color: t.muted }}
          >
            Pravi ekran · imena klijentkinja zamućena
          </p>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 14. Potential, later                                                      */
/* ------------------------------------------------------------------------ */
const CHANNELS: [Icon, string][] = [
  [Target, "Meta"],
  [Search, "Google"],
  [Clapperboard, "Video"],
  [Mail, "Email i SMS"],
];

function Potential() {
  return (
    <Slide theme="light" wide>
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr] md:gap-10">
        <div>
          <Label>Potencijal · kasnije</Label>
          <Headline size="lg">
            {"Kad sistem radi, [[dovodimo kupce.]]"}
          </Headline>
          <motion.div variants={item} className="mt-7 flex flex-wrap gap-2.5">
            {CHANNELS.map(([I, a]) => (
              <span
                key={a}
                className="flex items-center gap-2 rounded-full bg-[#F3F7FA] px-4 py-2.5 text-[14px] font-bold md:text-[16px]"
              >
                <I size={17} style={{ color: BLUE_DEEP }} /> {a}
              </span>
            ))}
          </motion.div>
        </div>
        <motion.div variants={item}>
          <Image
            src="/site/skeylo_team.webp"
            alt="Skeylo tim"
            width={1536}
            height={1024}
            sizes="50vw"
            className="h-auto w-full"
          />
        </motion.div>
      </div>
    </Slide>
  );
}

/* ------------------------------------------------------------------------ */
/* 15. Choose                                                                */
/* ------------------------------------------------------------------------ */
type Cell = boolean;
const ROWS: [Icon, string, Cell, Cell, Cell][] = [
  [Globe, "Sajt online", true, true, true],
  [Sparkles, "Novi dizajn, bez hostinga", false, true, true],
  [PenLine, "Blog i stranice proizvoda", false, true, true],
  [Users, "Klijenti, servis, magacin, teren", false, false, true],
  [BellRing, "Podsetnik za zamenu filtera", false, false, true],
  [Receipt, "Računovodstvo i radnici", false, false, true],
  [Brain, "Baza znanja i AI agent", false, false, true],
];

const PICKS = [
  {
    name: "Obnova",
    price: PRICE_RENEW,
    per: "godišnje",
    icon: RefreshCw,
    msg: "Zdravo Luka, biram Opciju 1: obnovu postojećeg sajta.",
  },
  {
    name: "Novi sajt",
    price: `${PRICE_REDESIGN} €`,
    per: "jednom",
    icon: Sparkles,
    msg: `Zdravo Luka, biram Opciju 2: novi sajt za ${PRICE_REDESIGN} €.`,
  },
  {
    name: "Sistem",
    price: `${PRICE_OS} €`,
    per: "jednom · sajt uključen",
    icon: Layers,
    msg: `Zdravo Luka, biram Opciju 3: operativni sistem za Ciklon (${PRICE_OS} €). Kad možemo da se vidimo?`,
    best: true,
  },
];

const COLS = "grid-cols-[1.35fr_repeat(2,minmax(0,0.85fr))_minmax(0,1.1fr)]";

function Mark({ v, best = false }: { v: Cell; best?: boolean }) {
  if (!v)
    return (
      <span
        aria-label="ne"
        className="mx-auto block h-[2px] w-3 rounded-full bg-white/15"
      />
    );
  return (
    <span
      aria-label="da"
      className={`mx-auto grid place-items-center rounded-full ${best ? "h-7 w-7 text-[#071521]" : "h-6 w-6 text-[#52C1EA]"}`}
      style={
        best
          ? { background: GRAD, boxShadow: "0 0 18px rgba(82,193,234,0.45)" }
          : { background: "rgba(82,193,234,0.12)" }
      }
    >
      <Check size={best ? 16 : 13} strokeWidth={3} />
    </span>
  );
}

function Choose() {
  const t = useTheme();
  return (
    <Slide backdrop={<Bubbles />}>
      <Headline size="lg">{"Izaberi. [[Krećemo odmah.]]"}</Headline>
      <Visual className="!mt-10">
        <div
          className="relative rounded-3xl px-3 py-2 md:px-6"
          style={{
            background: "rgba(14,34,51,0.75)",
            border: `1px solid ${t.line}`,
            backdropFilter: "blur(8px)",
          }}
        >
          {/* The recommended column: a lit card behind the third option. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 grid ${COLS} gap-2 px-3 md:px-6`}
          >
            <span />
            <span />
            <span />
            <span
              className="-my-5 rounded-[22px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(82,193,234,0.20), rgba(120,191,66,0.10))",
                border: `1.5px solid ${BLUE}`,
                boxShadow: "0 30px 70px -20px rgba(82,193,234,0.45)",
              }}
            />
          </div>

          {/* header */}
          <div className={`relative grid ${COLS} items-end gap-2 pb-4 pt-5`}>
            <span
              className="pb-1 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: t.muted }}
            >
              Šta dobijaš
            </span>
            {PICKS.map((p) => {
              const I = p.icon;
              return (
                <div
                  key={p.name}
                  className="relative flex flex-col items-center text-center"
                >
                  {p.best && (
                    <span
                      className="absolute -top-9 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#071521] md:text-[11px]"
                      style={{ background: GRAD }}
                    >
                      Preporuka
                    </span>
                  )}
                  <span
                    className="mb-2 hidden h-9 w-9 place-items-center rounded-xl md:grid"
                    style={
                      p.best
                        ? { background: GRAD, color: "#071521" }
                        : {
                            background: "rgba(255,255,255,0.07)",
                            color: t.muted,
                          }
                    }
                  >
                    <I size={18} />
                  </span>
                  <p
                    className="text-[13px] font-bold md:text-[16px]"
                    style={{ color: p.best ? "#fff" : t.muted }}
                  >
                    {p.name}
                  </p>
                  <p
                    className="mt-0.5 text-[20px] font-extrabold leading-none tracking-tight md:text-[30px]"
                    style={p.best ? gradText : undefined}
                  >
                    {p.price}
                  </p>
                  <p
                    className="mt-1 text-[10px] md:text-[12px]"
                    style={{ color: t.muted }}
                  >
                    {p.per}
                  </p>
                </div>
              );
            })}
          </div>

          {/* rows */}
          {ROWS.map(([I, label, a, b, c]) => (
            <div
              key={label}
              className={`relative grid ${COLS} items-center gap-2 py-2.5 md:py-3`}
              style={{ borderTop: `1px solid ${t.line}` }}
            >
              <span className="flex items-center gap-2.5 text-[12px] font-semibold leading-tight md:text-[15px]">
                <I
                  size={16}
                  className="hidden flex-none md:block"
                  style={{ color: t.muted }}
                />
                {label}
              </span>
              <Mark v={a} />
              <Mark v={b} />
              <Mark v={c} best />
            </div>
          ))}

          {/* buttons */}
          <div
            className={`relative grid ${COLS} items-center gap-2 pb-4 pt-4`}
            style={{ borderTop: `1px solid ${t.line}` }}
          >
            <span />
            {PICKS.map((p) => (
              <a
                key={p.name}
                href={wa(p.msg)}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-full px-1 text-center font-extrabold transition-transform hover:-translate-y-0.5 ${p.best ? "mx-1.5 py-2.5 text-[12px] md:mx-3 md:py-3.5 md:text-[16px]" : "py-2 text-[11px] md:py-2.5 md:text-[14px]"}`}
                style={
                  p.best
                    ? {
                        background: GRAD,
                        color: "#071521",
                        boxShadow: "0 12px 30px -10px rgba(82,193,234,0.7)",
                      }
                    : {
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: t.muted,
                      }
                }
              >
                {p.best ? "Biram sistem" : "Biram"}
              </a>
            ))}
          </div>
        </div>
      </Visual>
      <motion.p
        variants={item}
        className="mt-6 text-[12px]"
        style={{ color: t.muted }}
      >
        Cene bez PDV-a · važi 30 dana
      </motion.p>
    </Slide>
  );
}

export const SLIDES: DeckSlide[] = [
  { id: "naslov", label: "Ciklon × Skeylo", theme: "dark", Component: Cover },
  { id: "danas", label: "Stari sajt", theme: "dark", Component: OldSite },
  { id: "brojke", label: "Brojke", theme: "dark", Component: Numbers },
  { id: "ko", label: "Ko pravi", theme: "light", Component: Who },
  {
    id: "balsoa",
    label: "Poslednji sajt",
    theme: "light",
    Component: LastSite,
  },
  { id: "opcije", label: "Tri opcije", theme: "dark", Component: ThreeWays },
  { id: "obnova", label: "Opcija 1: obnova", theme: "cream", Component: Renew },
  {
    id: "sajt",
    label: "Opcija 2: novi sajt",
    theme: "light",
    Component: Redesign,
  },
  {
    id: "sistem",
    label: "Opcija 3: operativni sistem",
    theme: "dark",
    Component: OS,
  },
  {
    id: "vrednost",
    label: "Vrednost sistema",
    theme: "dark",
    Component: Value,
  },
  { id: "znanje", label: "Baza znanja", theme: "cream", Component: Knowledge },
  { id: "agent", label: "AI agent", theme: "light", Component: Agent },
  {
    id: "infinity",
    label: "Dokaz: Infinity",
    theme: "dark",
    Component: InfinityProof,
  },
  {
    id: "potencijal",
    label: "Potencijal",
    theme: "light",
    Component: Potential,
  },
  { id: "izbor", label: "Izbor", theme: "dark", Component: Choose },
];
