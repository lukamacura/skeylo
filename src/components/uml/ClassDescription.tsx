import { CLASSES } from "@/lib/uml/uml-data";
import type { ClassDescription as Description } from "@/lib/uml/uml-content";

/** Opis klase i obeležja: naziv klase na početku rečenice se ističe. */
export default function ClassDescription({ item }: { item: Description }) {
  const attributes = CLASSES.find((c) => c.id === item.id)?.attributes ?? [];
  const kindOf = (name: string) =>
    attributes.find((a) => a.name === name)?.kind ?? "plain";

  return (
    <div className="uml-class-desc">
      <p className="uml-class-intro">
        <strong>{item.id}</strong>
        {item.intro.slice(item.id.length)}
      </p>
      <ul
        className="uml-attrs"
        data-dense={item.attributes.length > 6 ? "true" : undefined}
      >
        {item.attributes.map((attribute) => {
          const kind = kindOf(attribute.names[0]);
          return (
            <li key={attribute.names.join()} data-kind={kind}>
              <span className="uml-attr-names">
                {attribute.names.map((name, i) => (
                  <span key={name}>
                    <code className="uml-code">{name}</code>
                    {i < attribute.names.length - 1 && ","}
                  </span>
                ))}
                <span className="sr-only">: </span>
              </span>
              <span className="uml-attr-text">{attribute.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
