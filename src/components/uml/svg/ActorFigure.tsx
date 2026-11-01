// Akter je čiča-gliša sa imenom ispod (P1, sl. 30–31), ne silueta ni ikonica.

type Props = {
  cx: number;
  top: number;
  name: string;
  /** Na dijagramu sekvenci je figura niža, da zaglavlja stanu u jedan red. */
  scale?: number;
};

export default function ActorFigure({ cx, top, name, scale = 1 }: Props) {
  const at = (n: number) => top + n * scale;
  const span = (n: number) => n * scale;
  return (
    <>
      <g className="uml-actor" data-part="stick-figure">
        <circle cx={cx} cy={at(13)} r={span(13)} />
        <path
          d={`M${cx},${at(26)} V${at(60)} M${cx - span(22)},${at(38)} H${cx + span(22)} M${cx - span(20)},${at(88)} L${cx},${at(60)} L${cx + span(20)},${at(88)}`}
        />
      </g>
      <text
        x={cx}
        y={at(88) + 20}
        textAnchor="middle"
        className="uml-actor-name"
      >
        {name}
      </text>
    </>
  );
}
