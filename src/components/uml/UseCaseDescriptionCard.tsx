"use client";

import { useState, type ReactNode } from "react";
import {
  USE_CASE_FIELD_LABELS as LABELS,
  type UseCaseDescription,
} from "@/lib/uml/uml-content";

function Field({
  area,
  label,
  children,
}: {
  area: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="uml-field" data-area={area}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Opis po šablonu P1, sl. 46. Oznaka `[Izuzetak: …]` ističe taj izuzetak. */
export default function UseCaseDescriptionCard({
  item,
}: {
  item: UseCaseDescription;
}) {
  const [flash, setFlash] = useState(0);

  const parts = item.description.split(/(\[Izuzetak: [^\]]+\])/);

  return (
    <dl className="uml-fields">
      <Field area="name" label={LABELS.name}>
        {item.name}
      </Field>
      <Field area="short" label={LABELS.short}>
        {item.short}
      </Field>
      <Field area="participants" label={LABELS.participants}>
        {item.participants}
      </Field>
      <Field area="pre" label={LABELS.pre}>
        {item.pre}
      </Field>
      <Field area="description" label={LABELS.description}>
        {parts.map((part, i) =>
          part.startsWith("[Izuzetak:") ? (
            <button
              key={i}
              type="button"
              className="uml-exception-tag"
              onClick={() => setFlash((n) => n + 1)}
            >
              {part}
            </button>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </Field>
      {/* key ponovo pokreće kratko isticanje posle svakog klika */}
      <div
        key={flash}
        className="uml-field"
        data-area="exception"
        data-flash={flash > 0 ? "true" : undefined}
      >
        <dt>{LABELS.exception}</dt>
        <dd>
          <strong className="uml-exception-label">
            [{item.exceptionLabel}]
          </strong>{" "}
          {item.exceptionText}
        </dd>
      </div>
      <Field area="post" label={LABELS.post}>
        {item.post}
      </Field>
    </dl>
  );
}
