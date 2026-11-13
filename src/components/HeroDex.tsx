// The hero's signature: one dex entry writing itself, then the next. Real games from the author's dex:
// the number types in, the ring fills to the real count, and the state lands (played, beaten, mastered).
// Pauses on hover and focus; holds still on the first entry under reduced motion.
import { useEffect, useRef, useState } from 'react';
import Mono from './Mono';

export type Entry = {
    no: number; title: string; console: string; icon?: string;
    got: number; total: number; state: 'played' | 'beaten' | 'mastered';
    path?: [number, number];
};

const STATE = {
    played: { label: 'In progress', color: 'var(--accent)' },
    beaten: { label: 'Beaten', color: 'var(--silver)' },
    mastered: { label: 'Mastered', color: 'var(--gold)' },
};

export default function HeroDex({ entries }: { entries: Entry[] }) {
    const [i, setI] = useState(0);
    const [typed, setTyped] = useState(String(entries[0].no).length);
    const [fill, setFill] = useState(1);
    const [held, setHeld] = useState(false);
    const reduced = useRef(false);
    const e = entries[i];
    const digits = String(e.no);
    const pct = e.total ? (e.got / e.total) * 100 : 0;

    useEffect(() => { reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);

    // Write the current entry: type the number, then fill the ring
    useEffect(() => {
        if (reduced.current) { setTyped(digits.length); setFill(1); return; }
        setTyped(0); setFill(0);
        const t: number[] = [];
        digits.split('').forEach((_, k) => t.push(window.setTimeout(() => setTyped(k + 1), 120 + k * 90)));
        t.push(window.setTimeout(() => setFill(1), 200 + digits.length * 90));
        return () => t.forEach(clearTimeout);
    }, [i]);

    // Next entry every few seconds, unless the visitor is looking at it
    useEffect(() => {
        if (held || reduced.current) return;
        const t = window.setTimeout(() => setI(n => (n + 1) % entries.length), 4200);
        return () => clearTimeout(t);
    }, [i, held, entries.length]);

    const st = STATE[e.state];
    const path = e.path;
    return (
        <div className={`hdex s-${e.state}`} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)} onBlur={() => setHeld(false)} tabIndex={0}
            aria-label={`Dex No.${e.no}, ${e.title}, ${e.got} of ${e.total} achievements, ${st.label}`}>
            <div className="hdex-top">
                <span className="hdex-no" aria-hidden="true">No.{digits.slice(0, typed)}<i className="caret" /></span>
                <span className="hdex-state" style={{ color: st.color }}>{st.label}</span>
            </div>
            <div className="hdex-main" key={e.no}>
                <span className={`ring ${e.state === 'mastered' && fill ? 'full' : ''}`}
                    style={{ ['--p' as string]: fill ? pct : 0, ['--c' as string]: st.color }}>
                    <Mono title={e.title} />
                </span>
                <div className="hdex-id">
                    <b className="hdex-title">{e.title}</b>
                    <span className="hdex-console">{e.console}</span>
                </div>
            </div>
            <div className="ledger">
                <div className="row"><span>Achievements</span><i /><b style={{ color: st.color }}>{e.got}<small>/{e.total}</small></b></div>
                <div className="row"><span>Complete</span><i /><b>{Math.floor(pct)}<small>%</small></b></div>
            </div>
            {path && (
                <div className="hdex-path" aria-hidden="true">
                    <span>Progression</span>
                    <span className="dpath">
                        {Array.from({ length: Math.min(path[1], 14) }, (_, k) => {
                            const lit = k < Math.round(path[0] / path[1] * Math.min(path[1], 14));
                            return <i key={k} className={fill && lit ? 'on' : ''} style={{ transitionDelay: `${300 + k * 70}ms` }} />;
                        })}
                    </span>
                    <b>{path[0]}<small>/{path[1]}</small></b>
                </div>
            )}
            <div className="hdex-dots" role="tablist" aria-label="Dex entries">
                {entries.map((x, k) => (
                    <button key={x.no} type="button" role="tab" aria-selected={k === i} aria-label={`Show dex No.${x.no}`}
                        className={k === i ? 'on' : ''} onClick={() => setI(k)} />
                ))}
            </div>
        </div>
    );
}
