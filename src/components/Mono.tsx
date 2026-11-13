// A game's monogram: its first letter in the pixel face, in place of the game's icon. Cheevodex's own art,
// so the site shows no one else's artwork outside real screenshots of the app.
export default function Mono({ title }: { title: string }) {
    const ch = (title.match(/[A-Za-z0-9]/)?.[0] || '?').toUpperCase();
    return <span className="mono" aria-hidden="true">{ch}</span>;
}
