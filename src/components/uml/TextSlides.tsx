"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Package,
  PackageCheck,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { CLASSES } from "@/lib/uml/uml-data";
import {
  CLASS_DESCRIPTIONS,
  CLASS_INTRO,
  CONSISTENCY_HEAD,
  CONSISTENCY_INTRO,
  CONSISTENCY_ROWS,
  DECK_LINE,
  DECK_SUBTITLE,
  LIFECYCLE_LABEL,
  STUDENT_INDEX,
  STUDENT_NAME,
  SYSTEM_DESCRIPTION,
  USE_CASE_DESCRIPTIONS,
} from "@/lib/uml/uml-content";
import ClassDescription from "./ClassDescription";
import SlideHeading from "./SlideHeading";
import UseCaseDescriptionCard from "./UseCaseDescriptionCard";
import CourierVan from "./svg/CourierVan";
import { renderInline } from "./renderInline";

const delay = (d: number) => ({ "--d": d }) as CSSProperties;

const PILL_SPRING = {
  type: "spring",
  bounce: 0,
  visualDuration: 0.26,
} as const;

/* Slajd 1 */
export function TitleSlide() {
  return (
    <div className="uml-title">
      <div className="uml-title-copy">
        <p className="uml-title-line uml-rise">{DECK_LINE}</p>
        <h1 aria-label="Od skice do realizacije UML dijagrama">
          <span className="uml-title-row" aria-hidden>
            <span className="uml-word">
              <span style={delay(0)}>Od</span>
            </span>{" "}
            <span className="uml-scribbled">
              <span className="uml-word">
                <span style={delay(1)}>skice</span>
              </span>
              <svg viewBox="0 0 200 18" aria-hidden>
                <path
                  d="M3,11 C28,4 44,15 70,9 C96,3 112,14 138,8 C158,4 176,10 197,6"
                  pathLength={1}
                />
              </svg>
            </span>{" "}
            <span className="uml-word">
              <span style={delay(2)}>do</span>
            </span>
          </span>
          <span className="uml-title-row" aria-hidden>
            <span className="uml-title-block">
              <span className="uml-word">
                <span style={delay(3)}>realizacije</span>
              </span>
            </span>
          </span>
          <span className="uml-title-row" aria-hidden>
            <span className="uml-word">
              <span style={delay(4)}>UML</span>
            </span>{" "}
            <span className="uml-word">
              <span style={delay(5)}>dijagrama</span>
            </span>
          </span>
        </h1>
        <p className="uml-title-topic uml-rise" style={delay(7)}>
          {DECK_SUBTITLE}
        </p>
        <p className="uml-author uml-rise" style={delay(9)}>
          <span className="uml-author-name">{STUDENT_NAME}</span>
          <span className="uml-author-index">{STUDENT_INDEX}</span>
        </p>
      </div>
      <CourierVan />
    </div>
  );
}

/* Slajd 2 */
function Status({
  children,
  tone,
  icon: Icon,
  order,
}: {
  children: string;
  tone: string;
  icon: LucideIcon;
  order: number;
}) {
  return (
    <span className="uml-rise uml-status" data-tone={tone} style={delay(order)}>
      <Icon aria-hidden />
      {children}
    </span>
  );
}

function Connector({ order }: { order: number }) {
  return (
    <svg
      viewBox="0 0 64 20"
      aria-hidden
      className="uml-connector"
      style={delay(order)}
    >
      <path d="M2,10 H61 M53,3 L62,10 L53,17" pathLength={1} />
    </svg>
  );
}

/** Račvanje: visina prati dva statusa jedan ispod drugog. */
function ForkConnector({ order }: { order: number }) {
  return (
    <svg
      viewBox="0 0 76 84"
      aria-hidden
      className="uml-connector uml-connector-fork"
      style={delay(order)}
    >
      <path d="M2,42 C38,42 34,13 72,13 M64,6 L73,13 L64,20" pathLength={1} />
      <path d="M2,42 C38,42 34,71 72,71 M64,64 L73,71 L64,78" pathLength={1} />
    </svg>
  );
}

export function SystemSlide() {
  return (
    <div className="uml-layout">
      <header className="uml-head">
        <SlideHeading title="Opis sistema" mark="sistema" />
      </header>
      <div className="uml-system">
        <p className="uml-prose uml-rise" style={delay(1)}>
          {renderInline(SYSTEM_DESCRIPTION)}
        </p>
      </div>
      <section className="uml-lifecycle">
        <h3 className="uml-rise" style={delay(4)}>
          {LIFECYCLE_LABEL}
        </h3>
        {/* Isporučena i Vraćena su dva moguća kraja, pa stoje jedna ispod druge. */}
        <div
          className="uml-lifecycle-flow"
          role="img"
          aria-label="Kreirana, zatim Preuzeta, zatim Isporučena ili Vraćena"
        >
          <Status tone="iris" icon={Package} order={5}>
            Kreirana
          </Status>
          <Connector order={6} />
          <Status tone="sun" icon={Truck} order={7}>
            Preuzeta
          </Status>
          <ForkConnector order={8} />
          <ArrowRight className="uml-lifecycle-arrow" aria-hidden />
          <div className="uml-lifecycle-ends">
            <Status tone="teal" icon={PackageCheck} order={9}>
              Isporučena
            </Status>
            <Status tone="coral" icon={Undo2} order={10}>
              Vraćena
            </Status>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Bočna lista: strelice ↑/↓ biraju stavku dok je slajd aktivan, pa predavač
 * ne mora prvo da fokusira listu.
 */
function SideTabs<T extends { id: string }>({
  id,
  label,
  items,
  selected,
  active,
  onSelect,
  tabProps,
  children,
}: {
  id: string;
  label: string;
  items: T[];
  selected: number;
  active: boolean;
  onSelect: (index: number) => void;
  tabProps?: (item: T) => Record<string, string | undefined>;
  children: (item: T, index: number) => ReactNode;
}) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const down = e.key === "ArrowDown";
      if (!down && e.key !== "ArrowUp") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (document.querySelector("[data-uml-modal], [data-uml-panel]")) return;
      e.preventDefault();
      const next = (selected + (down ? 1 : -1) + items.length) % items.length;
      onSelect(next);
      const focused = document.activeElement;
      if (focused?.id.startsWith(`${id}-tab-`)) {
        document.getElementById(`${id}-tab-${next}`)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, id, items.length, onSelect, selected]);

  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      aria-label={label}
      className="uml-tablist uml-js-only uml-rise"
      style={delay(1)}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          id={`${id}-tab-${i}`}
          type="button"
          role="tab"
          aria-selected={selected === i}
          aria-controls={`${id}-panel-${i}`}
          tabIndex={selected === i ? 0 : -1}
          onClick={() => onSelect(i)}
          className="uml-tab"
          {...tabProps?.(item)}
        >
          {selected === i && (
            <motion.span
              layoutId={`${id}-pill`}
              className="uml-tab-pill"
              transition={PILL_SPRING}
            />
          )}
          <span className="uml-tab-label">{children(item, i)}</span>
        </button>
      ))}
    </div>
  );
}

/* Slajd 5 */
export function UseCaseDescriptionsSlide({ active }: { active: boolean }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="uml-layout">
      <header className="uml-head">
        <SlideHeading
          title="Opisi slučajeva upotrebe"
          mark="slučajeva upotrebe"
        />
      </header>
      <div className="uml-split">
        <SideTabs
          id="uml-uc"
          label="Osnovni slučajevi upotrebe"
          items={USE_CASE_DESCRIPTIONS}
          selected={selected}
          active={active}
          onSelect={setSelected}
        >
          {(item, i) => (
            <>
              <span className="uml-tab-no">{i + 1}</span>
              {item.name}
            </>
          )}
        </SideTabs>
        <div className="uml-tabpanels">
          {USE_CASE_DESCRIPTIONS.map((item, i) => (
            <div
              key={item.id}
              id={`uml-uc-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`uml-uc-tab-${i}`}
              className="uml-tabpanel"
              data-active={selected === i ? "true" : "false"}
            >
              <UseCaseDescriptionCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Slajd 7 */
export function ClassDescriptionsSlide({ active }: { active: boolean }) {
  const [selected, setSelected] = useState(0);
  const groupOf = (id: string) => CLASSES.find((c) => c.id === id)?.group;

  return (
    <div className="uml-layout">
      <header className="uml-head">
        <SlideHeading title="Opis klasa i obeležja" mark="klasa i obeležja" />
        <p className="uml-head-note uml-rise" style={delay(1)}>
          {renderInline(CLASS_INTRO)}
        </p>
      </header>
      <div className="uml-split">
        <SideTabs
          id="uml-cls"
          label="Klase"
          items={CLASS_DESCRIPTIONS}
          selected={selected}
          active={active}
          onSelect={setSelected}
          tabProps={(item) => ({ "data-group": groupOf(item.id) })}
        >
          {(item) => (
            <>
              <span className="uml-tab-dot" aria-hidden />
              {item.id}
            </>
          )}
        </SideTabs>
        <div className="uml-tabpanels">
          {CLASS_DESCRIPTIONS.map((item, i) => (
            <div
              key={item.id}
              id={`uml-cls-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`uml-cls-tab-${i}`}
              className="uml-tabpanel uml-class-card"
              data-active={selected === i ? "true" : "false"}
              data-group={groupOf(item.id)}
            >
              <h3 className="uml-class-card-title">{item.id}</h3>
              <ClassDescription item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Slajd 9 */
const COLUMN_TONES = ["use-case", "class", "sequence"];

export function ConsistencySlide() {
  return (
    <div className="uml-layout">
      <header className="uml-head">
        <SlideHeading title="Konzistentnost modela" mark="modela" />
      </header>
      <p className="uml-model-intro uml-rise" style={delay(1)}>
        {renderInline(CONSISTENCY_INTRO)}
      </p>
      <div className="uml-table-wrap uml-rise" style={delay(2)}>
        <table className="uml-table">
          <thead>
            <tr>
              {CONSISTENCY_HEAD.map((cell, i) => (
                <th key={cell} scope="col" data-tone={COLUMN_TONES[i]}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONSISTENCY_ROWS.map((row, rowIndex) => (
              <tr key={row[0]} style={delay(rowIndex)}>
                {row.map((cell, i) => (
                  <td
                    key={i}
                    data-tone={COLUMN_TONES[i]}
                    data-empty={cell === "—" ? "true" : undefined}
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
