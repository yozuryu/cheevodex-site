// Hero C's phone: real screens of the app turning over (a dex record, the Dex, Activity), one every few
// seconds, with the name of the screen under the phone. Pauses on hover and focus; the dots pick a screen.
// Reduced motion shows the first screen and lets the dots do the work.
import { useEffect, useState } from 'react';

export type Screen = { src: string; alt: string; name: string };

export default function PhoneCycle({ screens }: { screens: Screen[] }) {
    const [i, setI] = useState(0);
    const [held, setHeld] = useState(false);
    useEffect(() => {
        if (held || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = window.setTimeout(() => setI(n => (n + 1) % screens.length), 3600);
        return () => clearTimeout(t);
    }, [i, held, screens.length]);
    return (
        <div className="pcycle" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
            <div className="pcycle-phone">
                {screens.map((s, k) => (
                    <img key={s.src} src={s.src} alt={k === i ? s.alt : ''} aria-hidden={k !== i} width="390" height="844"
                        className={k === i ? 'on' : ''} loading={k === 0 ? 'eager' : 'lazy'} />
                ))}
            </div>
            <div className="pcycle-dots" role="tablist" aria-label="Screens">
                {screens.map((s, k) => (
                    <button key={s.name} type="button" role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>
                        {s.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
