"use client";

import { useActionState } from "react";
import { unlock, type GateState } from "@/app/ils/marketing_plan/actions";

const START: GateState = { wrong: 0 };

export default function Gate({
  fontClass = "",
  title = "Marketing plan za oktobar",
  cta = "Otvori plan",
  next = "/ils/marketing_plan",
}: {
  fontClass?: string;
  title?: string;
  cta?: string;
  next?: string;
}) {
  const [state, action, pending] = useActionState(unlock, START);
  const wrong = state.wrong > 0;

  return (
    <div className={`ils ils-gate ${fontClass}`} lang="sr-Latn">
      {/* key restarts the shake on every wrong attempt */}
      <div key={state.wrong} className={`gate-in${wrong ? " shake" : ""}`}>
        <p className="gate-brand">Infinity Laser Studio</p>
        <p className="gate-kicker">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
          Privatan dokument
        </p>
        <h1>{title}</h1>
        <p className="gate-lede">Unesite lozinku koju ste dobili.</p>

        <form action={action} className="gate-form">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="ils-pass" className="sr-only">
            Lozinka
          </label>
          <input
            id="ils-pass"
            name="pass"
            type="password"
            autoFocus
            required
            autoComplete="off"
            autoCapitalize="none"
            placeholder="Lozinka"
            aria-invalid={wrong}
            aria-describedby="ils-pass-error"
          />
          <button type="submit" disabled={pending}>
            {pending ? "Otvaram…" : cta}
          </button>
        </form>

        <p
          id="ils-pass-error"
          className="gate-error"
          role={wrong ? "alert" : undefined}
        >
          {wrong ? "Lozinka nije tačna. Pokušajte ponovo." : ""}
        </p>
      </div>
    </div>
  );
}
