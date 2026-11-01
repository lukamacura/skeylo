"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import {
  SEQ_ACTIVATIONS,
  SEQ_ACTIVATION_W,
  SEQ_ACTOR_TOP,
  SEQ_ALT,
  SEQ_BRANCH_ORDER,
  SEQ_LIFELINE_END,
  SEQ_MESSAGES,
  SEQ_OBJECT_BOX,
  SEQ_PARTICIPANTS,
  SEQ_VIEWBOX,
  messageGeometry,
  type ParticipantId,
  type SeqBranch,
  type SeqMessage,
} from "@/lib/uml/uml-data";
import {
  CLASS_DESCRIPTIONS,
  SEQUENCE_LEGEND,
  SEQUENCE_STEP_NOTES,
  SEQUENCE_SUBTITLE,
  type SketchId,
} from "@/lib/uml/uml-content";
import ClassDescription from "./ClassDescription";
import DetailPanel from "./DetailPanel";
import DiagramStage from "./DiagramStage";
import Legend from "./Legend";
import ActorFigure from "./svg/ActorFigure";
import DrawnPath from "./svg/DrawnPath";
import { ArrowMarkers, filledArrow, openArrow } from "./svg/markers";
import { renderInline } from "./renderInline";
import { useDiagramInteraction, useFirstDraw } from "./hooks";

type Props = {
  active: boolean;
  slide: number;
  onSketch: (id: SketchId) => void;
};

const STEP_INTERVAL_MS = 1400;
const DOT_SECONDS = 0.6;
const ACTOR_LIFELINE_START = 90;
const SEGMENT_SPRING = {
  type: "spring",
  bounce: 0.14,
  visualDuration: 0.28,
} as const;

const messageKey = (n: number) => `m${n}`;

/**
 * Tačka putuje duž strelice samo preko transform i opacity, a kad stigne do
 * primaoca, oko nje se širi prsten.
 */
function TravelingDot({ message }: { message: SeqMessage }) {
  const { points } = messageGeometry(message);
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = lengths.reduce((sum, n) => sum + n, 0);
  let walked = 0;
  const times = [0, ...lengths.map((n) => (walked += n) / total)];
  const end = points[points.length - 1];

  return (
    <>
      <motion.g
        data-part="traveling-dot"
        initial={{ x: points[0].x, y: points[0].y, opacity: 0 }}
        animate={{
          x: points.map((p) => p.x),
          y: points.map((p) => p.y),
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          x: { duration: DOT_SECONDS, times, ease: "linear" },
          y: { duration: DOT_SECONDS, times, ease: "linear" },
          opacity: {
            duration: DOT_SECONDS,
            times: [0, 0.08, 0.92, 1],
            ease: "linear",
          },
        }}
      >
        <circle r={13} className="uml-dot-glow" />
        <circle r={5.5} className="uml-dot" />
      </motion.g>
      <g transform={`translate(${end.x} ${end.y})`}>
        <motion.circle
          r={6}
          className="uml-arrival"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 2.6], opacity: [0.9, 0] }}
          transition={{
            delay: DOT_SECONDS - 0.04,
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      </g>
    </>
  );
}

export default function SequenceDiagram({ active, slide, onSketch }: Props) {
  const drawing = useFirstDraw(active, slide);
  const reducedMotion = useReducedMotion();
  const { highlighted, selected, setSelected, bind } =
    useDiagramInteraction(active);
  const closePanel = useCallback(() => setSelected(null), [setSelected]);

  const [branch, setBranch] = useState<SeqBranch>("ispravni");
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const order = SEQ_BRANCH_ORDER[branch];
  const stepping = stepIndex >= 0;
  const currentMessage = stepping ? order[stepIndex] : null;
  const atEnd = stepIndex >= order.length - 1;

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  // ↑/↓ korača kroz scenario dok je slajd aktivan; ←/→ i dalje menjaju slajd.
  const stepCount = order.length;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const down = e.key === "ArrowDown";
      if (!down && e.key !== "ArrowUp") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (
        document.querySelector(
          "[data-uml-modal], [data-uml-panel], [data-uml-expanded]",
        )
      )
        return;
      e.preventDefault();
      setPlaying(false);
      setStepIndex((i) =>
        down ? Math.min(i + 1, stepCount - 1) : Math.max(i - 1, -1),
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stepCount]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => setStepIndex((i) => i + 1),
      stepping ? STEP_INTERVAL_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [playing, atEnd, stepping, stepIndex]);

  const chooseBranch = (next: SeqBranch) => {
    if (next === branch) return;
    setPlaying(false);
    setBranch(next);
    // Poruke 1 i 2 su zajedničke; posle njih se grane razilaze.
    setStepIndex((i) => (i > 1 ? -1 : i));
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (atEnd) setStepIndex(-1);
    setPlaying(true);
  };

  const goToMessage = (n: number) => {
    setPlaying(false);
    const nextBranch: SeqBranch = SEQ_BRANCH_ORDER[branch].includes(n)
      ? branch
      : n === 9
        ? "neispravni"
        : "ispravni";
    setBranch(nextBranch);
    setStepIndex(SEQ_BRANCH_ORDER[nextBranch].indexOf(n));
  };

  /** Stanje poruke u koračanju; pre prvog koraka sve je normalno. */
  const messageState = (n: number) => {
    if (!stepping) return "normal";
    if (n === currentMessage) return "current";
    const position = order.indexOf(n);
    return position !== -1 && position < stepIndex ? "normal" : "dim";
  };

  const activationDim = (startsAt: number) => {
    if (!stepping) return false;
    const position = order.indexOf(startsAt);
    return position === -1 || position > stepIndex;
  };

  // Isticanje učesnika i poruka važi dok se ne korača; koračanje ima prednost.
  const hoverSet = (() => {
    if (stepping || !highlighted) return null;
    const related = new Set<string>([highlighted]);
    for (const m of SEQ_MESSAGES) {
      const key = messageKey(m.n);
      if (highlighted === key) related.add(m.from).add(m.to);
      if (highlighted === m.from || highlighted === m.to) related.add(key);
    }
    return related;
  })();

  const participantDim = (id: ParticipantId) =>
    hoverSet && !hoverSet.has(id) ? "true" : undefined;

  const selectedParticipant = SEQ_PARTICIPANTS.find((p) => p.id === selected);
  const selectedDescription = CLASS_DESCRIPTIONS.find(
    (d) => d.id === selectedParticipant?.classId,
  );

  const note = currentMessage ? SEQUENCE_STEP_NOTES[currentMessage] : null;
  const currentMessageData = SEQ_MESSAGES.find((m) => m.n === currentMessage);

  return (
    <DiagramStage
      title="Dijagram sekvenci"
      mark="sekvenci"
      tag={SEQUENCE_SUBTITLE}
      sketchId="sequence"
      onSketch={onSketch}
      below={
        <div
          className="uml-seq-bar uml-js-only uml-rise print:hidden"
          style={{ "--d": 2 } as CSSProperties}
        >
          <div className="uml-seq-controls">
            <button
              type="button"
              className="uml-btn"
              data-primary="true"
              data-control="play"
              onClick={togglePlay}
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
              {playing ? "Pauza" : "Pusti"}
            </button>
            <button
              type="button"
              className="uml-icon-btn"
              aria-label="Prethodni korak"
              title="Prethodni korak"
              disabled={!stepping}
              data-control="prev"
              onClick={() => {
                setPlaying(false);
                setStepIndex((i) => Math.max(i - 1, -1));
              }}
            >
              <SkipBack aria-hidden />
            </button>
            <button
              type="button"
              className="uml-icon-btn"
              aria-label="Sledeći korak"
              title="Sledeći korak"
              disabled={atEnd}
              data-control="next"
              onClick={() => {
                setPlaying(false);
                setStepIndex((i) => Math.min(i + 1, order.length - 1));
              }}
            >
              <SkipForward aria-hidden />
            </button>
            <button
              type="button"
              className="uml-icon-btn"
              aria-label="Ispočetka"
              title="Ispočetka"
              data-control="reset"
              disabled={!stepping}
              onClick={() => {
                setPlaying(false);
                setStepIndex(-1);
              }}
            >
              <RotateCcw aria-hidden />
            </button>
          </div>
          <div
            role="group"
            aria-label="Grana scenarija"
            className="uml-segment"
          >
            {(
              [
                ["ispravni", "Podaci ispravni"],
                ["neispravni", "Podaci neispravni"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={branch === value}
                data-branch={value}
                onClick={() => chooseBranch(value)}
              >
                {branch === value && (
                  <motion.span
                    layoutId="uml-segment-pill"
                    className="uml-segment-pill"
                    data-branch={value}
                    transition={SEGMENT_SPRING}
                  />
                )}
                <span className="uml-segment-label">{label}</span>
              </button>
            ))}
          </div>
          <div
            className="uml-step-note"
            aria-live="polite"
            data-part="step-note"
          >
            <div className="uml-step-track" aria-hidden>
              {order.map((n, i) => (
                <span key={n} data-done={i <= stepIndex ? "true" : undefined} />
              ))}
            </div>
            {currentMessageData && note && (
              // key: objašnjenje novog koraka ulazi ispočetka
              <p key={currentMessageData.n} className="uml-step-text">
                <span className="uml-step-badge">{currentMessageData.n}</span>
                <span>{renderInline(note)}</span>
              </p>
            )}
          </div>
        </div>
      }
      legend={
        <Legend
          items={[
            { kind: "call", label: SEQUENCE_LEGEND.call },
            { kind: "return", label: SEQUENCE_LEGEND.return },
            { kind: "lifeline", label: SEQUENCE_LEGEND.lifeline },
            { kind: "activation", label: SEQUENCE_LEGEND.activation },
            { kind: "alt", label: SEQUENCE_LEGEND.alt },
          ]}
        />
      }
      alternative={
        <>
          <p>
            Učesnici: {SEQ_PARTICIPANTS.map((p) => p.name).join(", ")}. Poruke
            ovim redom:
          </p>
          <ol>
            {SEQ_MESSAGES.map((m) => (
              <li key={m.n}>{m.text}</li>
            ))}
          </ol>
          <p>
            Okvir alt: poruke 3 do 8 pod uslovom [podaci ispravni], poruka 9 pod
            uslovom [podaci neispravni].
          </p>
        </>
      }
    >
      <svg
        viewBox={`0 0 ${SEQ_VIEWBOX.w} ${SEQ_VIEWBOX.h}`}
        role="img"
        aria-label="Dijagram sekvenci za slučaj upotrebe Kreiranje pošiljke"
        data-diagram="sequence"
        className={drawing ? "uml-svg uml-draw" : "uml-svg"}
      >
        <ArrowMarkers prefix="seq" />
        <defs>
          <linearGradient id="seq-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.24" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Okvir alt: dva operanda sa blagim tonom */}
        <g className="uml-a-node" style={{ "--i": 0 } as CSSProperties}>
          {SEQ_ALT.operands.map((operand) => (
            <rect
              key={operand.branch}
              x={SEQ_ALT.x}
              y={operand.y1}
              width={SEQ_ALT.w}
              height={operand.y2 - operand.y1}
              className="uml-operand"
              data-operand={operand.branch}
              data-dim={
                stepping && operand.branch !== branch ? "true" : undefined
              }
            />
          ))}
        </g>

        {/* Linije života: sve četiri se završavaju na istoj visini */}
        {SEQ_PARTICIPANTS.map((p, i) => (
          <g
            key={p.id}
            className="uml-el"
            data-kind="lifeline"
            data-id={p.id}
            data-dim={participantDim(p.id)}
          >
            <DrawnPath
              id={`seq-life-${p.id}`}
              d={`M${p.x},${p.kind === "actor" ? ACTOR_LIFELINE_START : SEQ_OBJECT_BOX.y + SEQ_OBJECT_BOX.h} V${SEQ_LIFELINE_END}`}
              className="uml-lifeline"
              drawing={drawing}
              order={i}
            />
          </g>
        ))}

        <g className="uml-alt-frame uml-a-label" data-part="alt-frame">
          <rect
            x={SEQ_ALT.x}
            y={SEQ_ALT.y}
            width={SEQ_ALT.w}
            height={SEQ_ALT.h}
          />
          <line
            x1={SEQ_ALT.x}
            x2={SEQ_ALT.x + SEQ_ALT.w}
            y1={SEQ_ALT.dividerY}
            y2={SEQ_ALT.dividerY}
            className="uml-dashed"
            data-part="alt-divider"
          />
          <path
            d={`M${SEQ_ALT.x},${SEQ_ALT.y} h62 v14 l-12,12 h-50 z`}
            className="uml-alt-tag"
            data-part="alt-tag"
          />
          <text
            x={SEQ_ALT.x + 12}
            y={SEQ_ALT.y + 18}
            className="uml-alt-tag-text"
          >
            {SEQ_ALT.tag}
          </text>
          {SEQ_ALT.operands.map((operand) => (
            <text
              key={operand.branch}
              x={operand.guardX}
              y={operand.guardY}
              className="uml-guard"
              data-guard={operand.branch}
              data-dim={
                stepping && operand.branch !== branch ? "true" : undefined
              }
            >
              {operand.guard}
            </text>
          ))}
        </g>

        {/* Fokus kontrole */}
        {SEQ_ACTIVATIONS.map((a, i) => {
          const participant = SEQ_PARTICIPANTS.find(
            (p) => p.id === a.participant,
          );
          return (
            <rect
              key={a.participant}
              x={(participant?.x ?? 0) - SEQ_ACTIVATION_W / 2}
              y={a.y1}
              width={SEQ_ACTIVATION_W}
              height={a.y2 - a.y1}
              rx={1}
              className="uml-activation uml-el uml-a-node"
              style={{ "--i": i + 4 } as CSSProperties}
              data-kind="activation"
              data-participant={a.participant}
              data-dim={
                activationDim(a.startsAt) || participantDim(a.participant)
                  ? "true"
                  : undefined
              }
            />
          );
        })}

        {/* Poruke */}
        {SEQ_MESSAGES.map((m, i) => {
          const { d } = messageGeometry(m);
          const state = messageState(m.n);
          const key = messageKey(m.n);
          const isReturn = m.kind === "return";
          return (
            <g
              key={m.n}
              {...bind(key, m.text, () => goToMessage(m.n))}
              className="uml-el uml-edge"
              data-kind="message"
              data-message-kind={m.kind}
              data-n={m.n}
              data-state={state}
              data-dim={
                state === "dim" || (hoverSet && !hoverSet.has(key))
                  ? "true"
                  : undefined
              }
            >
              <path d={d} className="uml-hit" />
              <DrawnPath
                id={`seq-${key}`}
                d={d}
                className={isReturn ? "uml-line uml-dashed" : "uml-line"}
                markerEnd={isReturn ? openArrow("seq") : filledArrow("seq")}
                drawing={drawing}
                order={i + 4}
              />
              {state === "current" && !reducedMotion && (
                <path
                  key={`${branch}-${m.n}`}
                  d={d}
                  pathLength={1}
                  className="uml-step-line"
                />
              )}
              <text
                x={m.label.x}
                y={m.label.y}
                textAnchor={m.label.anchor}
                className="uml-label uml-message-label uml-a-label"
              >
                {m.text}
              </text>
            </g>
          );
        })}

        {/* Učesnici: samo gore, ne ponavljaju se na dnu */}
        {SEQ_PARTICIPANTS.map((p, i) => (
          <g
            key={p.id}
            {...bind(
              p.id,
              p.kind === "actor" ? `Akter ${p.name}` : `Objekat ${p.name}`,
              () => setSelected(p.id),
            )}
            className="uml-el uml-lift uml-a-node"
            style={{ "--i": i } as CSSProperties}
            data-lift={highlighted === p.id ? "true" : undefined}
            data-kind="participant"
            data-participant-kind={p.kind}
            data-participant={p.id}
            data-id={p.id}
            data-dim={participantDim(p.id)}
          >
            {p.kind === "actor" ? (
              <g>
                <rect
                  x={p.x - 44}
                  y={0}
                  width={88}
                  height={ACTOR_LIFELINE_START}
                  className="uml-hit-box"
                />
                <ActorFigure
                  cx={p.x}
                  top={SEQ_ACTOR_TOP}
                  name={p.name}
                  scale={0.68}
                />
              </g>
            ) : (
              <>
                <rect
                  x={p.x - p.w / 2}
                  y={SEQ_OBJECT_BOX.y}
                  width={p.w}
                  height={SEQ_OBJECT_BOX.h}
                  rx={4}
                  className="uml-object uml-focus-shape"
                />
                <rect
                  x={p.x - p.w / 2}
                  y={SEQ_OBJECT_BOX.y}
                  width={p.w}
                  height={SEQ_OBJECT_BOX.h}
                  rx={4}
                  fill="url(#seq-sheen)"
                  className="uml-sheen"
                />
                <text
                  x={p.x}
                  y={SEQ_OBJECT_BOX.y + SEQ_OBJECT_BOX.h / 2}
                  dy=".35em"
                  textAnchor="middle"
                  className="uml-object-name"
                >
                  {p.name}
                </text>
              </>
            )}
          </g>
        ))}

        {currentMessageData && !reducedMotion && (
          <TravelingDot
            key={`${branch}-${currentMessageData.n}`}
            message={currentMessageData}
          />
        )}
      </svg>

      <DetailPanel
        open={selectedParticipant !== undefined}
        contentKey={selected}
        eyebrow={
          selectedParticipant?.kind === "actor" ? "Akter" : "Objekat klase"
        }
        title={selectedParticipant?.name ?? ""}
        side={
          (selectedParticipant?.x ?? 0) > SEQ_VIEWBOX.w / 2 ? "left" : "right"
        }
        onClose={closePanel}
      >
        {selectedDescription && <ClassDescription item={selectedDescription} />}
      </DetailPanel>
    </DiagramStage>
  );
}
