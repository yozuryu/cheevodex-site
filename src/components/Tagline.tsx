// The headline with its one moving part: the word after "Every" keeps turning over (unlock, mastery, badge,
// streak), holding longest on "unlock". It pauses while hovered and while off-screen. All the words sit stacked
// in one cell, so the line never changes width. Screen readers and search engines get the plain sentence;
// reduced motion keeps "unlock".
import { useEffect, useRef, useState } from 'react';

const WORDS = ['unlock', 'mastery', 'badge', 'streak'];

export default function Tagline({ split = false }: { split?: boolean }) {
    const [i, setI] = useState(0);
    const [held, setHeld] = useState(false);
    const [seen, setSeen] = useState(true);
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
        if (ref.current) io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    useEffect(() => {
        if (held || !seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = window.setTimeout(() => setI(n => (n + 1) % WORDS.length), i === 0 ? 3200 : 2200);
        return () => clearTimeout(t);
    }, [i, held, seen]);
    const word = (
        <span className="tw" aria-hidden="true">
            {WORDS.map(w => <span key={w} className={w === WORDS[i] ? 'on' : ''}>{w},</span>)}
        </span>
    );
    const dex = <span className="t-dex">dex</span>;
    return (
        <h1 ref={ref} aria-label="Every unlock, in your own dex." onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
            {split
                ? <><span className="hv-c-l">Every<br />{word}</span><span className="hv-c-r">in your<br /> own {dex}.</span></>
                : <>Every {word}<br /> in your own {dex}.</>}
        </h1>
    );
}
