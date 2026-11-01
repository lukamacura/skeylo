/** Naslov slajda; `mark` je deo naslova koji dobija marker u boji poglavlja. */
export default function SlideHeading({
  title,
  mark,
}: {
  title: string;
  mark: string;
}) {
  const at = title.indexOf(mark);
  return (
    <h2 className="uml-heading uml-rise">
      {title.slice(0, at)}
      <span className="uml-mark">{mark}</span>
      {title.slice(at + mark.length)}
    </h2>
  );
}
