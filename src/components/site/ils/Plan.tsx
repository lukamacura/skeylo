import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import PlanEffects from "./PlanEffects";

const ROOT_ID = "ils-plan";
const MONTH = "oktobar";

/* Custom properties the stylesheet reads for staggered entrances. */
const delay = (d: string) => ({ "--d": d }) as CSSProperties;

/* Without JS nothing would ever be revealed, so undo the hidden states. */
const NO_JS = `.ils .rv,.ils .total,.ils .phase ul li{opacity:1;transform:none}.ils .laser{clip-path:none}.ils .bar i,.ils .tl-fill{transform:none}.ils .icon svg>*{stroke-dashoffset:0}`;

function SectionHead({
  num,
  step,
  title,
  sub,
}: {
  num: string;
  step: string;
  title: string;
  sub: string;
}) {
  return (
    <>
      <span className="bignum" aria-hidden="true">
        {num}
      </span>
      <p className="step rv">{step}</p>
      <div className="lz">
        <h2 className="laser">{title}</h2>
        <span className="lzbeam" aria-hidden="true" />
      </div>
      <p className="sub rv">{sub}</p>
    </>
  );
}

/* Icon shapes carry pathLength=1 so the stylesheet can draw them in. */
function Task({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="task rv">
      <div className="icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {icon}
        </svg>
      </div>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </article>
  );
}

const MIX = [
  { name: "Skečevi", n: 13 },
  { name: "Simulacije podkasta", n: 10 },
  { name: "Street interview-i", n: 6 },
  { name: "Iznenadni tretman", n: 1 },
];
const MIX_MAX = Math.max(...MIX.map((m) => m.n));

const TOTALS = [
  { n: 15, label: "zadataka" },
  { n: 30, label: "novih videa" },
  { n: 93, label: "story-ja" },
  { n: 2, label: "grada" },
];

const WEEKS = [
  {
    title: "Temelji i snimanje",
    items: [
      "Kreiranje nove neodoljive ponude",
      "Aktivacija Business Plus pretplate",
      "Plan objavljivanja story-ja",
      "Optimizacija ličnog profila dr Ane Kasap",
      "Kompletan rebranding",
      "Snimanje 6 street interview-a i simulacija podkasta",
      "Snimanje prvih 6 skečeva",
      "Početak izrade sistema zakazivanja i admin panela za Sombor",
    ],
  },
  {
    title: "Sombor i nove kreative",
    items: [
      "Završetak sistema zakazivanja i admin panela za Sombor",
      "Snimanje novih kreativa za plaćeni saobraćaj",
      "Montaža novih kreativa",
    ],
  },
  {
    title: "Kampanja u oba grada",
    items: [
      "Postavljanje novih kreativa u Ads Manager",
      "Pokretanje kampanje sa targetingom na Novi Sad i Sombor",
    ],
  },
  {
    title: "Ritam i analiza",
    items: ["Nastavak svakodnevnog objavljivanja", "Analiza rezultata meseca"],
  },
];

export default function Plan({ fontClass = "" }: { fontClass?: string }) {
  return (
    <div id={ROOT_ID} className={`ils ${fontClass}`} lang="sr-Latn">
      <noscript>
        <style>{NO_JS}</style>
      </noscript>
      <div className="progress" aria-hidden="true">
        <i />
      </div>

      <header className="hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <canvas className="dust" aria-hidden="true" />
        <svg className="inf" viewBox="0 0 400 200" aria-hidden="true">
          <defs>
            <filter
              id="ils-glow"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            id="ils-lem"
            className="track"
            pathLength={1}
            d="M200,100 C240,38 345,38 345,100 C345,162 240,162 200,100 C160,38 55,38 55,100 C55,162 160,162 200,100 Z"
          />
          <g className="orbg" filter="url(#ils-glow)">
            <circle className="orb" r="2.6">
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                <mpath href="#ils-lem" />
              </animateMotion>
            </circle>
          </g>
        </svg>
        <div className="beam" aria-hidden="true" />

        <div className="hero-in">
          <div className="brandrow fx" style={delay(".1s")}>
            <Image
              className="logo"
              src="/logo.webp"
              alt="Skeylo"
              width={2000}
              height={717}
              sizes="120px"
              priority
            />
            <div className="brandtext">
              <strong>Infinity Laser Studio</strong>
              <span>Pripremio Skeylo Tim</span>
            </div>
          </div>
          <div className="hero-main">
            <h1>
              <span className="pre fx" style={delay(".3s")}>
                Marketing plan za
              </span>
              <span className="okt" aria-label={MONTH}>
                {MONTH.split("").map((c, i) => (
                  <span
                    key={i}
                    className="ch"
                    aria-hidden="true"
                    style={{ "--i": i } as CSSProperties}
                  >
                    {c}
                  </span>
                ))}
              </span>
            </h1>
            <p className="lede fx" style={delay("1.7s")}>
              Oktobar je mesec u kome Sombor dobija svoj sistem zakazivanja i
              admin panel, Infinity prolazi kroz kompletan rebranding, a Meta
              reklame se prvi put prikazuju u oba grada.
            </p>
          </div>
        </div>
        <div className="cue" aria-hidden="true">
          <span>Skrolujte</span>
          <i />
        </div>
      </header>

      <div className="page">
        <div className="letter rv">
          <p className="salute">Poštovani,</p>
          <p>
            pred Vama je plan za oktobar 2026. Zadaci su podeljeni u tri
            oblasti: sajt, sadržaj i profil sa rastom. Na kraju dokumenta nalazi
            se raspored po nedeljama, kako biste u svakom trenutku znali šta je
            u toku i šta sledi.
          </p>
          <div className="totals">
            {TOTALS.map((t) => (
              <div key={t.label} className="total">
                <b data-count={t.n}>{t.n}</b>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WEB */}
        <section>
          <SectionHead
            num="01"
            step="Oblast 1 od 3"
            title="Sajt i zakazivanje"
            sub="Dva zadatka koja pripremaju sajt za novi izgled i za Sombor."
          />

          <Task
            title="Redizajn celog sajta"
            icon={
              <>
                <rect
                  pathLength={1}
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2.5"
                />
                <path pathLength={1} d="M3 9h18M8 13h8M8 16h5" />
              </>
            }
          >
            <p>
              Sve stranice sajta prelaze na novi vizuelni identitet, isti onaj
              koji već koristi novi sistem zakazivanja.
            </p>
          </Task>

          <Task
            title="Sistem zakazivanja i admin panel za Sombor"
            icon={
              <>
                <rect
                  pathLength={1}
                  x="3.5"
                  y="5"
                  width="17"
                  height="15"
                  rx="2.5"
                />
                <path
                  pathLength={1}
                  d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"
                />
              </>
            }
          >
            <p>
              Sombor dobija sopstveni tok zakazivanja, kao i admin panel preko
              kog se upravlja somborskim terminima.
            </p>
          </Task>
        </section>

        {/* CONTENT */}
        <section>
          <SectionHead
            num="02"
            step="Oblast 2 od 3"
            title="Sadržaj"
            sub="Najveći deo oktobra. Sedam zadataka, od reklama do svakodnevnih story-ja."
          />

          <article className="featured idle rv">
            <span className="spot" aria-hidden="true" />
            <span className="pill">Najveći fokus</span>
            <h3>30 novih videa</h3>
            <p>
              Četiri formata, svaki sa svojom ulogom. Podkast gradi poverenje
              kroz stručnost, skečevi i street interview-i donose doseg, a
              iznenadni tretman prikazuje sirovo iskustvo dolaska u studio.
            </p>
            <div className="mix">
              {MIX.map((m) => (
                <div key={m.name} className="mixrow">
                  <span className="name">{m.name}</span>
                  <span className="bar">
                    <i
                      style={{
                        width: `${((m.n / MIX_MAX) * 100).toFixed(1)}%`,
                      }}
                    />
                  </span>
                  <span className="n" data-count={m.n}>
                    {m.n}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <Task
            title="Osvežavanje reklama"
            icon={
              <path
                pathLength={1}
                d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"
              />
            }
          >
            <p>
              Nova serija kreativa za Meta kampanje, pravljena za publiku oba
              grada. Poruke i scene biće prilagođene tako da podjednako govore
              klijentima iz Novog Sada i iz Sombora.
            </p>
          </Task>

          <Task
            title="Iznenadni tretman sa ženom sa ulice"
            icon={
              <>
                <circle pathLength={1} cx="12" cy="8" r="3.5" />
                <path
                  pathLength={1}
                  d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5M18.5 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"
                />
              </>
            }
          >
            <p>
              Prilazimo slučajnoj prolaznici i nudimo joj tretman u studiju.
              Kamera prati sirovo iskustvo dolaska u studio, bez scenarija.
            </p>
          </Task>

          <Task
            title="Redizajn Infinity logotipa"
            icon={
              <>
                <path
                  pathLength={1}
                  d="M12 3.5c3 2.5 5 5 5 8.5a5 5 0 0 1-10 0c0-3.5 2-6 5-8.5z"
                />
                <path pathLength={1} d="M12 9v9" />
              </>
            }
          >
            <p>
              Osvežen znak brenda, usklađen sa novim izgledom sajta i sistema
              zakazivanja.
            </p>
          </Task>

          <Task
            title="Tri story-ja svakog dana"
            icon={
              <>
                <circle cx="12" cy="12" r="8.5" strokeDasharray="3 2.2" />
                <circle pathLength={1} cx="12" cy="12" r="4.5" />
              </>
            }
          >
            <p>
              Ukupno 93 story-ja u oktobru. Kroz story-je gradimo bližu vezu sa
              pratiocima: pokazujemo svakodnevicu studija i ljude iza njega, i
              redovno ih direktno pozivamo da zakažu termin.
            </p>
          </Task>
        </section>

        {/* GENERAL */}
        <section>
          <SectionHead
            num="03"
            step="Oblast 3 od 3"
            title="Profil i rast"
            sub="Šest zadataka koji jačaju poverenje u nalog, donose novu ponudu i šire publiku na Sombor."
          />

          <Task
            title="Plava kvačica kroz Business Plus pretplatu"
            icon={
              <>
                <path
                  pathLength={1}
                  d="M12 3l2.3 1.7 2.8-.2.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.2L12 21l-2.3-1.7-2.8.2-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.2z"
                />
                <path pathLength={1} d="M8.8 12l2.2 2.2 4.2-4.4" />
              </>
            }
          >
            <p>
              Plava kvačica pored imena je prvo što nov pratilac primeti. Nalog
              odmah deluje kao proveren i ozbiljan brend, što mnogo znači nekome
              ko prvi put razmišlja kome da poveri svoju kožu.
            </p>
            <p className="more">
              Uz kvačicu profil dobija bolju poziciju u pretrazi i istaknuto
              prikazivanje, a na profilu možemo da navedemo do tri adrese, što
              znači i Novi Sad i Sombor. Tu su i zaštita od lažnih naloga koji
              se predstavljaju kao studio, brža podrška Mete i 2 linka mesečno
              na Reels-ima. Kvačica se dodeljuje nakon Metine provere biznisa,
              zato pretplatu aktiviramo na samom početku meseca. Prva nedelja je
              besplatna.
            </p>
            <p className="meta">21,49 € (oko 2.520 RSD) mesečno</p>
          </Task>

          <Task
            title="Optimizacija profila dr Ane Kasap"
            icon={
              <>
                <circle pathLength={1} cx="12" cy="8.5" r="4" />
                <path pathLength={1} d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
              </>
            }
          >
            <p>
              Lični profil dr Ane Kasap uređujemo tako da jasno prenosi njeno
              iskustvo i vodi pratioce ka studiju.
            </p>
          </Task>

          <Task
            title="Poseban highlight za svaku nedoumicu"
            icon={
              <>
                <path
                  pathLength={1}
                  d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5z"
                />
                <path pathLength={1} d="M12 8.2v3.2M12 13.3v.1" />
              </>
            }
          >
            <p>
              Svaka česta nedoumica dobija svoj highlight na profilu. Na primer,
              highlight „STERILNO” sa fotografijama čistog prostora i porukom da
              se studio čisti svako veče, ili highlight o bolu sa edukativnim
              slikama koje objašnjavaju zašto tretman ne boli.
            </p>
          </Task>

          <Task
            title="Plan za story-je"
            icon={
              <>
                <rect
                  pathLength={1}
                  x="4"
                  y="3.5"
                  width="16"
                  height="17"
                  rx="2.5"
                />
                <path pathLength={1} d="M8 8h8M8 12h8M8 16h5" />
              </>
            }
          >
            <p>
              Nedeljni plan tema i formata, kako bi tri story-ja dnevno bila
              održiva i raznovrsna kroz ceo mesec.
            </p>
          </Task>

          <Task
            title="Nova neodoljiva ponuda"
            icon={
              <>
                <rect
                  pathLength={1}
                  x="3.5"
                  y="9"
                  width="17"
                  height="11"
                  rx="2"
                />
                <path
                  pathLength={1}
                  d="M3.5 13h17M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"
                />
              </>
            }
          >
            <p>
              Umesto dosadašnje garancije pravimo novu ponudu koja će nositi
              reklame u oba grada. Definišemo je na samom početku meseca, kako
              bi ušla u nove kreative i u Brankine pozive na kraju street
              interview-a.
            </p>
          </Task>

          <Task
            title="Proširenje reklama na Sombor"
            icon={
              <>
                <path
                  pathLength={1}
                  d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"
                />
                <circle pathLength={1} cx="12" cy="10" r="2.4" />
              </>
            }
          >
            <p>
              Reklame počinju da se prikazuju i publici u Somboru čim budu
              spremni sistem zakazivanja za Sombor i nove kreative.
            </p>
          </Task>
        </section>

        {/* TIMELINE */}
        <section>
          <SectionHead
            num="04"
            step="Raspored"
            title="Oktobar po nedeljama"
            sub="Prve dve nedelje su za snimanje i pripremu, a u trećoj nove kreative i Sombor kreću zajedno."
          />

          <div className="tlwrap">
            <span className="tl-fill" aria-hidden="true" />
            <ol className="timeline">
              {WEEKS.map((w, i) => (
                <li key={w.title} className="phase rv">
                  <span className="dot">{i + 1}</span>
                  <p className="when">{i + 1}. nedelja</p>
                  <h3>{w.title}</h3>
                  <ul>
                    {w.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <p className="ongoing rv">
            Kroz ceo mesec: oko 7 novih videa nedeljno i 3 story-ja svakog dana.
          </p>
        </section>

        <footer className="rv">
          <p>Za sva pitanja i predloge stojimo Vam na raspolaganju.</p>
          <p className="sig">Filip, Skeylo Tim</p>
        </footer>
      </div>

      <PlanEffects rootId={ROOT_ID} />
    </div>
  );
}
