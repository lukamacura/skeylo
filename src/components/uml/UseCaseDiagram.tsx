"use client";

import { useCallback, type CSSProperties } from "react";
import {
  UC_ACTORS,
  UC_ASSOCIATIONS,
  UC_DEPENDENCIES,
  UC_EXTENSION_HEADING,
  UC_FRAME,
  UC_VIEWBOX,
  USE_CASES,
  ucAssociationPath,
  ucDependencyPath,
  ucDividerPath,
  ucRadii,
  type UseCase,
  type UseCaseId,
} from "@/lib/uml/uml-data";
import {
  DEPENDENCY_DIRECTION,
  HELPER_USE_CASE_NOTES,
  USE_CASE_DESCRIPTIONS,
  USE_CASE_LEGEND,
  type SketchId,
} from "@/lib/uml/uml-content";
import DetailPanel from "./DetailPanel";
import DiagramStage from "./DiagramStage";
import Legend from "./Legend";
import UseCaseDescriptionCard from "./UseCaseDescriptionCard";
import ActorFigure from "./svg/ActorFigure";
import DrawnPath from "./svg/DrawnPath";
import { ArrowMarkers, openArrow } from "./svg/markers";
import { useDiagramInteraction, useFirstDraw } from "./hooks";

type Props = {
  active: boolean;
  slide: number;
  onSketch: (id: SketchId) => void;
};

const ucName = (id: UseCaseId) =>
  USE_CASES.find((u) => u.id === id)?.name ?? id;

const assocId = (actor: string, useCase: string) => `${actor}-${useCase}`;
const depId = (from: string, to: string) => `${from}>${to}`;

const extensionText = ({ extensionPoints }: UseCase) =>
  extensionPoints?.lines.map((line) => line.text).join(" ");

/** Element i sve što je direktno povezano sa njim. */
function relatedTo(id: string): Set<string> {
  const related = new Set([id]);
  for (const { actor, useCase } of UC_ASSOCIATIONS) {
    if (id === actor || id === useCase) {
      related.add(actor).add(useCase).add(assocId(actor, useCase));
    }
  }
  for (const { from, to } of UC_DEPENDENCIES) {
    if (id === from || id === to || id === depId(from, to)) {
      related.add(from).add(to).add(depId(from, to));
    }
  }
  return related;
}

export default function UseCaseDiagram({ active, slide, onSketch }: Props) {
  const drawing = useFirstDraw(active, slide);
  const { highlighted, selected, setSelected, bind } =
    useDiagramInteraction(active);
  const closePanel = useCallback(() => setSelected(null), [setSelected]);

  const related = highlighted ? relatedTo(highlighted) : null;
  const dim = (id: string) =>
    related && !related.has(id) ? "true" : undefined;
  const hi = (id: string) => (related?.has(id) ? "true" : undefined);

  const actor = UC_ACTORS.find((a) => a.id === selected);
  const useCase = USE_CASES.find((u) => u.id === selected);
  const dependency = UC_DEPENDENCIES.find(
    (d) => depId(d.from, d.to) === selected,
  );
  const description = USE_CASE_DESCRIPTIONS.find((d) => d.id === selected);

  const panelTitle =
    actor?.name ?? useCase?.name ?? dependency?.stereotype ?? "";
  const panelEyebrow = actor
    ? "Akter"
    : useCase?.kind === "osnovni"
      ? "Osnovni slučaj upotrebe"
      : useCase?.kind === "ukljuceni"
        ? "Uključeni slučaj upotrebe"
        : useCase
          ? "Proširujući slučaj upotrebe"
          : "Zavisnost";

  // Panel se otvara na strani suprotnoj od izabranog elementa.
  const panelSide =
    (actor?.cx ?? useCase?.cx ?? UC_VIEWBOX.w) > UC_VIEWBOX.w / 2
      ? "left"
      : "right";

  return (
    <DiagramStage
      title="Dijagram slučajeva upotrebe"
      mark="slučajeva upotrebe"
      sketchId="use-case"
      onSketch={onSketch}
      legend={
        <Legend
          items={[
            { kind: "use-case-base", label: USE_CASE_LEGEND.base },
            { kind: "use-case-helper", label: USE_CASE_LEGEND.helper },
            { kind: "association", label: USE_CASE_LEGEND.association },
            { kind: "dependency", label: USE_CASE_LEGEND.include },
            { kind: "dependency", label: USE_CASE_LEGEND.extend },
          ]}
        />
      }
      alternative={
        <>
          <p>Akteri i slučajevi upotrebe koje pokreću:</p>
          <ul>
            {UC_ACTORS.map((a) => (
              <li key={a.id}>
                {a.name}:{" "}
                {UC_ASSOCIATIONS.filter((x) => x.actor === a.id)
                  .map((x) => ucName(x.useCase))
                  .join(", ")}
              </li>
            ))}
          </ul>
          <p>Zavisnosti:</p>
          <ul>
            {UC_DEPENDENCIES.map((d) => (
              <li key={depId(d.from, d.to)}>
                {ucName(d.from)} {d.stereotype} {ucName(d.to)}
              </li>
            ))}
          </ul>
          {USE_CASES.filter((u) => u.extensionPoints).map((u) => (
            <p key={u.id}>
              {u.name}, {UC_EXTENSION_HEADING}: {extensionText(u)}
            </p>
          ))}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${UC_VIEWBOX.w} ${UC_VIEWBOX.h}`}
        role="img"
        aria-label="Dijagram slučajeva upotrebe kurirske službe"
        data-diagram="use-case"
        className={drawing ? "uml-svg uml-draw" : "uml-svg"}
      >
        <ArrowMarkers prefix="uc" />
        <defs>
          <linearGradient id="uc-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6f58ff" />
            <stop offset="1" stopColor="#4326dd" />
          </linearGradient>
          <linearGradient id="uc-helper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe48a" />
            <stop offset="1" stopColor="#ffc72e" />
          </linearGradient>
          <radialGradient id="uc-shadow">
            <stop offset="0.55" stopColor="#2a1c8f" stopOpacity="0.26" />
            <stop offset="1" stopColor="#2a1c8f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="uc-halo">
            <stop offset="0.62" stopColor="#ff5c82" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff5c82" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="uml-a-node" style={{ "--i": 0 } as CSSProperties}>
          <rect
            x={UC_FRAME.x}
            y={UC_FRAME.y}
            width={UC_FRAME.w}
            height={UC_FRAME.h}
            rx={18}
            className="uml-system-frame"
            data-part="system-frame"
          />
          <text
            x={UC_FRAME.x + UC_FRAME.w / 2}
            y={UC_FRAME.titleY}
            textAnchor="middle"
            className="uml-system-title"
          >
            {UC_FRAME.title}
          </text>
        </g>

        {UC_ASSOCIATIONS.map((assoc, i) => {
          const id = assocId(assoc.actor, assoc.useCase);
          return (
            <g
              key={id}
              className="uml-el"
              data-kind="association"
              data-from={assoc.actor}
              data-to={assoc.useCase}
              data-dim={dim(id)}
              data-hi={hi(id)}
            >
              <DrawnPath
                id={`uc-${id}`}
                d={ucAssociationPath(assoc)}
                className="uml-line"
                drawing={drawing}
                order={i}
                pulse
              />
            </g>
          );
        })}

        {UC_DEPENDENCIES.map((dep, i) => {
          const id = depId(dep.from, dep.to);
          const d = ucDependencyPath(dep);
          return (
            <g
              key={id}
              {...bind(
                id,
                `${ucName(dep.from)} ${dep.stereotype} ${ucName(dep.to)}`,
                () => setSelected(id),
              )}
              className="uml-el uml-edge"
              data-kind="dependency"
              data-from={dep.from}
              data-to={dep.to}
              data-dim={dim(id)}
              data-hi={hi(id)}
            >
              <path d={d} className="uml-hit" />
              <DrawnPath
                id={`uc-${dep.from}-${dep.to}`}
                d={d}
                className="uml-line uml-dashed"
                markerEnd={openArrow("uc")}
                drawing={drawing}
                order={UC_ASSOCIATIONS.length + i}
              />
              <text
                x={dep.label.x}
                y={dep.label.y}
                textAnchor={dep.label.anchor}
                className="uml-label uml-stereotype uml-a-label"
              >
                {dep.stereotype}
              </text>
            </g>
          );
        })}

        {UC_ACTORS.map((a, i) => (
          <g
            key={a.id}
            {...bind(a.id, `Akter ${a.name}`, () => setSelected(a.id))}
            className="uml-el uml-lift uml-a-node"
            style={{ "--i": i + 1 } as CSSProperties}
            data-kind="actor"
            data-id={a.id}
            data-dim={dim(a.id)}
            data-hi={hi(a.id)}
            data-lift={highlighted === a.id ? "true" : undefined}
          >
            <rect
              x={a.cx - 42}
              y={a.top - 4}
              width={84}
              height={118}
              className="uml-hit-box"
            />
            <ActorFigure cx={a.cx} top={a.top} name={a.name} />
          </g>
        ))}

        {USE_CASES.map((u, i) => {
          const { rx, ry } = ucRadii(u);
          const extension = u.extensionPoints;
          return (
            <g
              key={u.id}
              {...bind(
                u.id,
                extension
                  ? `Slučaj upotrebe ${u.name}. ${UC_EXTENSION_HEADING}: ${extensionText(u)}`
                  : `Slučaj upotrebe ${u.name}`,
                () => setSelected(u.id),
              )}
              className="uml-el uml-lift uml-a-node"
              style={{ "--i": i + 5 } as CSSProperties}
              data-kind="use-case"
              data-id={u.id}
              data-dim={dim(u.id)}
              data-hi={hi(u.id)}
              data-lift={highlighted === u.id ? "true" : undefined}
            >
              <ellipse
                cx={u.cx}
                cy={u.cy}
                rx={rx + 26}
                ry={ry + 22}
                fill="url(#uc-halo)"
                className="uml-halo"
              />
              <ellipse
                cx={u.cx}
                cy={u.cy + 8}
                rx={rx + 8}
                ry={ry + 8}
                fill="url(#uc-shadow)"
                className="uml-shadow"
              />
              <ellipse
                cx={u.cx}
                cy={u.cy}
                rx={rx}
                ry={ry}
                fill={
                  u.kind === "osnovni" ? "url(#uc-base)" : "url(#uc-helper)"
                }
                className={`uml-focus-shape ${u.kind === "osnovni" ? "uml-uc-base" : "uml-uc-helper"}`}
              />
              <text
                x={u.cx}
                y={extension?.nameY ?? u.cy}
                dy=".35em"
                textAnchor="middle"
                className="uml-uc-name"
                data-kind={u.kind === "osnovni" ? "base" : "helper"}
              >
                {u.name}
              </text>
              {extension && (
                <g data-part="extension-points">
                  <path
                    d={ucDividerPath(u, extension.dividerY)}
                    className="uml-uc-divider"
                  />
                  <text className="uml-uc-extension">
                    <tspan
                      x={extension.textX}
                      y={extension.headingY}
                      className="uml-uc-extension-head"
                    >
                      {UC_EXTENSION_HEADING}
                    </tspan>
                    {extension.lines.map((line) => (
                      <tspan key={line.text} x={extension.textX} y={line.y}>
                        {line.text}
                      </tspan>
                    ))}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <DetailPanel
        open={selected !== null}
        contentKey={selected}
        eyebrow={panelEyebrow}
        title={panelTitle}
        side={panelSide}
        onClose={closePanel}
      >
        {description && <UseCaseDescriptionCard item={description} />}
        {useCase && !description && (
          <p className="uml-panel-text">{HELPER_USE_CASE_NOTES[useCase.id]}</p>
        )}
        {actor && (
          <>
            <ul className="uml-panel-list">
              {UC_ASSOCIATIONS.filter((x) => x.actor === actor.id).map((x) => (
                <li key={x.useCase}>{ucName(x.useCase)}</li>
              ))}
            </ul>
          </>
        )}
        {dependency && (
          <>
            <p className="uml-panel-text">
              {DEPENDENCY_DIRECTION[dependency.stereotype]}.
            </p>
            <p className="uml-panel-route">
              {ucName(dependency.from)} → {ucName(dependency.to)}
            </p>
          </>
        )}
      </DetailPanel>
    </DiagramStage>
  );
}
