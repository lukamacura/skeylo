// Vrhovi strelica. ID-jevi su jedinstveni po dijagramu: marker unutar skrivenog
// slajda (display: none) ne bi se iscrtao na drugom dijagramu.

export const openArrow = (prefix: string) => `url(#${prefix}-open)`;
export const filledArrow = (prefix: string) => `url(#${prefix}-filled)`;

export function ArrowMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      <marker
        id={`${prefix}-open`}
        viewBox="0 0 12 12"
        refX="11.5"
        refY="6"
        markerWidth="13"
        markerHeight="13"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M1,1 L11.5,6 L1,11" className="uml-marker-open" />
      </marker>
      <marker
        id={`${prefix}-filled`}
        viewBox="0 0 12 12"
        refX="12"
        refY="6"
        markerWidth="12"
        markerHeight="12"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path d="M0,0 L12,6 L0,12 Z" className="uml-marker-filled" />
      </marker>
    </defs>
  );
}
