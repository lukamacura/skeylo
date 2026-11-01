"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  CLASSES,
  CLASS_ASSOCIATIONS,
  CLASS_HEADER_H,
  CLASS_ROW_H,
  CLASS_VIEWBOX,
  associationForAttribute,
  associationPath,
  attributeRowTop,
  classRect,
  type AssociationEnd,
  type ClassId,
} from "@/lib/uml/uml-data";
import {
  CLASS_DESCRIPTIONS,
  CLASS_GROUP_LABELS,
  CLASS_LEGEND_LINK,
  type SketchId,
} from "@/lib/uml/uml-content";
import ClassDescription from "./ClassDescription";
import DetailPanel from "./DetailPanel";
import DiagramStage from "./DiagramStage";
import Legend from "./Legend";
import DrawnPath from "./svg/DrawnPath";
import { useDiagramInteraction, useFirstDraw } from "./hooks";

type Props = {
  active: boolean;
  slide: number;
  onSketch: (id: SketchId) => void;
};

const attrId = (owner: ClassId, name: string) => `attr:${owner}.${name}`;
const assocKey = (id: string) => `assoc:${id}`;

/** Atribut-veza: klasa kojoj pripada, klasa na drugom kraju i njihova asocijacija. */
function attributeLinks() {
  const links = new Map<
    string,
    { owner: ClassId; target: ClassId; assoc: string }
  >();
  for (const cls of CLASSES) {
    for (const attribute of cls.attributes) {
      if (attribute.kind === "link" && attribute.target) {
        links.set(attrId(cls.id, attribute.name), {
          owner: cls.id,
          target: attribute.target,
          assoc: associationForAttribute(cls.id, attribute.target).id,
        });
      }
    }
  }
  return links;
}

const ATTRIBUTE_LINKS = attributeLinks();

function relatedTo(id: string): Set<string> {
  const related = new Set([id]);
  const link = ATTRIBUTE_LINKS.get(id);
  if (link) {
    related.add(link.owner).add(link.target).add(assocKey(link.assoc));
    return related;
  }
  for (const assoc of CLASS_ASSOCIATIONS) {
    const key = assocKey(assoc.id);
    if (id === key || id === assoc.a.cls || id === assoc.b.cls) {
      related.add(key).add(assoc.a.cls).add(assoc.b.cls);
    }
  }
  return related;
}

function EndLabel({
  end,
  emphasized,
}: {
  end: AssociationEnd;
  emphasized: boolean;
}) {
  return (
    <text
      x={end.label.x}
      y={end.label.y}
      textAnchor={end.label.anchor}
      className="uml-label uml-end-label uml-a-label"
      data-class-end={end.cls}
      data-emphasis={emphasized ? "true" : undefined}
    >
      {end.role} <tspan className="uml-multiplicity">{end.multiplicity}</tspan>
    </text>
  );
}

export default function ClassDiagram({ active, slide, onSketch }: Props) {
  const drawing = useFirstDraw(active, slide);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipAt, setTooltipAt] = useState<{ x: number; y: number } | null>(
    null,
  );
  const { highlighted, selected, setSelected, bind } =
    useDiagramInteraction(active);
  const closePanel = useCallback(() => setSelected(null), [setSelected]);

  const current = highlighted;
  const related = current ? relatedTo(current) : null;
  const dim = (id: string) =>
    related && !related.has(id) ? "true" : undefined;
  const hi = (id: string) => (related?.has(id) ? "true" : undefined);

  const hoveredAssoc = CLASS_ASSOCIATIONS.find(
    (a) =>
      assocKey(a.id) === current ||
      ATTRIBUTE_LINKS.get(current ?? "")?.assoc === a.id,
  );

  const selectedClass = CLASSES.find((c) => c.id === selected);
  const selectedDescription = CLASS_DESCRIPTIONS.find((d) => d.id === selected);
  const selectedAssoc = CLASS_ASSOCIATIONS.find(
    (a) => assocKey(a.id) === selected,
  );

  const panelSide =
    (selectedClass?.x ?? CLASS_VIEWBOX.w) > CLASS_VIEWBOX.w / 2 - 100
      ? "left"
      : "right";

  // Rečenica „Kako se čita“ stoji na slobodnom mestu i ne izlazi van ekrana.
  useLayoutEffect(() => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!hoveredAssoc || !matrix) {
      setTooltipAt(null);
      return;
    }
    const { x, y } = hoveredAssoc.tip;
    const margin =
      parseFloat(getComputedStyle(document.documentElement).fontSize) * 11;
    setTooltipAt({
      x: Math.min(
        Math.max(matrix.a * x + matrix.c * y + matrix.e, margin),
        window.innerWidth - margin,
      ),
      y: matrix.b * x + matrix.d * y + matrix.f,
    });
  }, [hoveredAssoc]);

  return (
    <DiagramStage
      title="Dijagram klasa"
      mark="klasa"
      sketchId="class"
      onSketch={onSketch}
      legend={
        <Legend
          items={[
            { kind: "central", label: CLASS_GROUP_LABELS.central },
            { kind: "people", label: CLASS_GROUP_LABELS.people },
            { kind: "catalog", label: CLASS_GROUP_LABELS.catalog },
            { kind: "org", label: CLASS_GROUP_LABELS.org },
            { kind: "link-attribute", label: CLASS_LEGEND_LINK },
          ]}
        />
      }
      alternative={
        <>
          <p>Klase i atributi:</p>
          <ul>
            {CLASSES.map((c) => (
              <li key={c.id}>
                {c.id}:{" "}
                {c.attributes.map((a) => `${a.name}: ${a.type}`).join(", ")}
              </li>
            ))}
          </ul>
          <p>Asocijacije:</p>
          <ul>
            {CLASS_ASSOCIATIONS.map((a) => (
              <li key={a.id}>
                {a.a.cls} ({a.a.role} {a.a.multiplicity}) — {a.b.cls} (
                {a.b.role} {a.b.multiplicity}). {a.reading}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CLASS_VIEWBOX.w} ${CLASS_VIEWBOX.h}`}
        role="img"
        aria-label="Dijagram klasa kurirske službe"
        data-diagram="class"
        className={drawing ? "uml-svg uml-draw" : "uml-svg"}
      >
        <defs>
          <linearGradient id="cls-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.24" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {CLASS_ASSOCIATIONS.map((assoc, i) => {
          const key = assocKey(assoc.id);
          const d = associationPath(assoc);
          const emphasized = related?.has(key) ?? false;
          return (
            <g
              key={assoc.id}
              {...bind(
                key,
                `Asocijacija ${assoc.a.cls} ${assoc.a.multiplicity}, ${assoc.b.cls} ${assoc.b.multiplicity}. ${assoc.reading}`,
                () => setSelected(key),
              )}
              className="uml-el uml-edge"
              data-kind="class-association"
              data-id={assoc.id}
              data-dim={dim(key)}
              data-hi={hi(key)}
            >
              <path d={d} className="uml-hit" />
              <DrawnPath
                id={`cls-${assoc.id}`}
                d={d}
                className="uml-line"
                drawing={drawing}
                order={i}
                pulse
              />
              <EndLabel end={assoc.a} emphasized={emphasized} />
              <EndLabel end={assoc.b} emphasized={emphasized} />
            </g>
          );
        })}

        {CLASSES.map((cls, classIndex) => {
          const rect = classRect(cls);
          const order = { "--i": classIndex } as CSSProperties;
          const headPath = `M${rect.x},${rect.y + CLASS_HEADER_H} V${rect.y + 8} a8,8 0 0 1 8,-8 H${rect.x + rect.w - 8} a8,8 0 0 1 8,8 V${rect.y + CLASS_HEADER_H} Z`;
          // Klasa se podiže cela, zajedno sa atributima-vezama koji su joj braća.
          const lifted =
            current === cls.id ||
            ATTRIBUTE_LINKS.get(current ?? "")?.owner === cls.id;
          return (
            <g
              key={cls.id}
              className="uml-lift uml-a-node"
              style={order}
              data-lift={lifted ? "true" : undefined}
            >
              <g
                {...bind(cls.id, `Klasa ${cls.id}`, () => setSelected(cls.id))}
                className="uml-el"
                data-kind="class"
                data-id={cls.id}
                data-group={cls.group}
                data-dim={dim(cls.id)}
                data-hi={hi(cls.id)}
              >
                <rect
                  x={rect.x - 4}
                  y={rect.y - 4}
                  width={rect.w + 8}
                  height={rect.h + 8}
                  rx={9}
                  className="uml-ring"
                />
                <rect
                  x={rect.x + 2}
                  y={rect.y + 5}
                  width={rect.w - 4}
                  height={rect.h}
                  rx={10}
                  className="uml-class-shadow"
                />
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  rx={8}
                  className="uml-class-body uml-focus-shape"
                />
                <path d={headPath} className="uml-class-head" />
                <path
                  d={headPath}
                  fill="url(#cls-sheen)"
                  className="uml-sheen"
                />
                <line
                  x1={rect.x}
                  x2={rect.x + rect.w}
                  y1={rect.y + CLASS_HEADER_H}
                  y2={rect.y + CLASS_HEADER_H}
                  className="uml-class-divider"
                />
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + 20}
                  textAnchor="middle"
                  className="uml-class-name"
                >
                  {cls.id}
                </text>
                {cls.attributes.map((attribute, i) =>
                  attribute.kind === "link" ? null : (
                    <text
                      key={attribute.name}
                      x={rect.x + 12}
                      y={attributeRowTop(cls, i) + 14}
                      className="uml-attribute"
                      data-attribute={attribute.name}
                    >
                      {attribute.name}:{" "}
                      <tspan className="uml-attribute-type">
                        {attribute.type}
                      </tspan>
                    </text>
                  ),
                )}
              </g>

              {cls.attributes.map((attribute, i) => {
                if (attribute.kind !== "link") return null;
                const id = attrId(cls.id, attribute.name);
                const top = attributeRowTop(cls, i);
                return (
                  <g
                    key={attribute.name}
                    {...bind(
                      id,
                      `Atribut ${attribute.name}: veza sa klasom ${attribute.target}`,
                      () => setSelected(cls.id),
                    )}
                    className="uml-el uml-link-attribute"
                    data-kind="link-attribute"
                    data-id={id}
                    data-dim={
                      related && !related.has(id) && !related.has(cls.id)
                        ? "true"
                        : undefined
                    }
                  >
                    <rect
                      x={rect.x + 2}
                      y={top}
                      width={rect.w - 4}
                      height={CLASS_ROW_H}
                      rx={3}
                      className="uml-attribute-row"
                    />
                    <text
                      x={rect.x + 12}
                      y={top + 14}
                      className="uml-attribute uml-attribute-link"
                      data-attribute={attribute.name}
                    >
                      {attribute.name}:{" "}
                      <tspan className="uml-attribute-type">
                        {attribute.type}
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {hoveredAssoc && tooltipAt && (
        <div
          role="tooltip"
          className="uml-tooltip"
          style={{ left: tooltipAt.x, top: tooltipAt.y }}
        >
          {hoveredAssoc.reading}
        </div>
      )}

      <DetailPanel
        open={selected !== null}
        contentKey={selected}
        eyebrow={
          selectedClass
            ? CLASS_GROUP_LABELS[selectedClass.group]
            : "Asocijacija"
        }
        title={
          selectedClass?.id ??
          (selectedAssoc
            ? `${selectedAssoc.a.cls} — ${selectedAssoc.b.cls}`
            : "")
        }
        side={panelSide}
        onClose={closePanel}
      >
        {selectedDescription && <ClassDescription item={selectedDescription} />}
        {selectedAssoc && (
          <>
            <p className="uml-panel-text">{selectedAssoc.reading}</p>
            <ul className="uml-panel-list">
              {[selectedAssoc.a, selectedAssoc.b].map((end) => (
                <li key={end.cls}>
                  {end.cls}:{" "}
                  <code className="uml-code">
                    {end.role} {end.multiplicity}
                  </code>
                </li>
              ))}
            </ul>
          </>
        )}
      </DetailPanel>
    </DiagramStage>
  );
}
