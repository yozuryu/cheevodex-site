// The headline with its one moving part: the word after "Every" turns over (unlock, mastery, badge, streak)
// once, then settles back on "unlock". All the words sit stacked in one cell, so the line never changes
// width. Screen readers and search engines get the plain sentence; reduced motion keeps "unlock".
import { useEffect, useState } from 'react';

const WORDS = ['unlock', 'mastery', 'badge', 'streak', 'unlock'];

export default function Tagline({ split = false }: { split?: boolean }) {
    const [i, setI] = useState(0);
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (i >= WORDS.length - 1) return;
        const t = window.setTimeout(() => setI(n => n + 1), i === 0 ? 1600 : 1300);
        return () => clearTimeout(t);
    }, [i]);
    const word = (
        <span className="tw" aria-hidden="true">
            {[...new Set(WORDS)].map(w => <span key={w} className={w === WORDS[i] ? 'on' : ''}>{w},</span>)}
        </span>
    );
    const dex = <span className="t-dex">dex</span>;
    return (
        <h1 aria-label="Every unlock, in your own dex.">
            {split
                ? <><span className="hv-c-l">Every<br />{word}</span><span className="hv-c-r">in your<br /> own {dex}.</span></>
                : <>Every {word}<br /> in your own {dex}.</>}
        </h1>
    );
}
