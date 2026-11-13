// The Record, as a guided tour. A selector picks the kind of record (in progress, beaten, mastered); the tour
// lights one part of the record at a time (ring, numbers, path, dex number), and hovering or tapping a callout
// jumps to it. The games and icons are real RetroAchievements games; the numbers are examples, and say so.
import { useEffect, useRef, useState } from 'react';

export type Rec = { state: 'played' | 'beaten' | 'mastered'; no: number; title: string; console: string; icon: string;
    got: number; total: number; pts: number; ptsTotal: number; played: string; path: [number, number] };

const STATES = {
    played: { label: 'In progress', color: 'var(--accent)' },
    beaten: { label: 'Beaten', color: 'var(--silver)' },
    mastered: { label: 'Mastered', color: 'var(--gold)' },
};
const PARTS = [
    { key: 'ring', name: 'The ring.', text: 'How far you are: blue in progress, silver once beaten, gold and glowing when mastered.' },
    { key: 'numbers', name: 'The numbers.', text: 'Achievements, points and time played, as index lines.' },
    { key: 'path', name: 'The path.', text: 'One diamond per progression achievement. Light them all and the game is beaten.' },
    { key: 'no', name: 'The number.', text: "The dex number is the game's RetroAchievements ID." },
];

export default function RecordTour({ records }: { records: Rec[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    const [sel, setSel] = useState(0);
    const [cur, setCur] = useState(0);
    const [held, setHeld] = useState(false);
    const [still, setStill] = useState(false);
    const [fill, setFill] = useState(true);
    useEffect(() => {
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        setStill(reduce);
        if (reduce) { setOn(true); return; }
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
        if (ref.current) io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    useEffect(() => {
        if (!on || held || still) return;
        const t = window.setTimeout(() => setCur(n => (n + 1) % PARTS.length), 3000);
        return () => clearTimeout(t);
    }, [cur, on, held, still]);
    useEffect(() => {   // refill the ring and path when the record changes
        if (still) return;
        setFill(false);
        const t = window.setTimeout(() => setFill(true), 60);
        return () => clearTimeout(t);
    }, [sel, still]);
    const r = records[sel];
    const st = STATES[r.state];
    const pct = r.got / r.total * 100;
    const live = on && fill;
    const marks = Math.min(r.path[1], 20);
    const litMarks = Math.round(r.path[0] / r.path[1] * marks);
    const lit = (k: string) => (on && PARTS[cur].key === k ? 'lit' : '');
    const callout = (k: number) => (
        <li key={PARTS[k].key} className={cur === k ? 'on' : ''}>
            <button type="button" onClick={() => { setCur(k); setHeld(true); }} onPointerEnter={() => { setCur(k); setHeld(true); }}
                onFocus={() => { setCur(k); setHeld(true); }} aria-pressed={cur === k}>
                <i>{k + 1}</i><b>{PARTS[k].name}</b><span>{PARTS[k].text}</span>
            </button>
        </li>
    );
    return (
        <div ref={ref}>
            <div className="rec-pick" role="radiogroup" aria-label="Kind of record">
                {records.map((x, k) => (
                    <button key={x.state} type="button" role="radio" aria-checked={sel === k} className={`rec-chip s-${x.state} ${sel === k ? 'on' : ''}`} onClick={() => setSel(k)}>
                        {STATES[x.state].label}
                    </button>
                ))}
            </div>
            <div className="manual" onPointerLeave={() => setHeld(false)}>
                <ol className="callouts left">{[0, 1].map(callout)}</ol>
                <div className="manual-card">
                    <div className={`record s-${r.state} ${on ? 'on' : ''}`} key={r.no} aria-label={`Dex record: ${r.title}, ${r.got} of ${r.total} achievements, ${st.label}`}>
                        <div className="record-head">
                            <img src={r.icon} alt="" width="72" height="72" />
                            <div>
                                <span className="record-top"><span className={`dexno part ${lit('no')}`}>Dex No.{r.no}</span><b style={{ color: st.color }}>{st.label}</b></span>
                                <b className="record-title">{r.title}</b>
                                <span className="record-console">{r.console}</span>
                            </div>
                        </div>
                        <div className="record-body">
                            <span className={`ring big part ${lit('ring')} ${r.state === 'mastered' && live ? 'full' : ''}`} style={{ ['--p' as string]: live ? pct : 0, ['--c' as string]: st.color }}>
                                <b style={{ color: st.color }}>{Math.floor(pct)}<small>%</small></b>
                            </span>
                            <div className={`ledger part ${lit('numbers')}`}>
                                <div className="row"><span>Achievements</span><i /><b style={{ color: st.color }}>{r.got}<small>/{r.total}</small></b></div>
                                <div className="row"><span>Points</span><i /><b className="t-gold">{r.pts}<small>/{r.ptsTotal}</small></b></div>
                                <div className="row"><span>Played</span><i /><b>{r.played}</b></div>
                            </div>
                        </div>
                        <div className={`record-path part ${lit('path')}`} aria-hidden="true">
                            <span>Progression</span>
                            <span className="dpath">
                                {Array.from({ length: marks }, (_, k) => (
                                    <i key={k} className={live && k < litMarks ? 'on' : ''} style={{ transitionDelay: `${300 + k * 80}ms` }} />
                                ))}
                            </span>
                            <b>{r.path[0]}<small>/{r.path[1]}</small></b>
                        </div>
                    </div>
                </div>
                <ol className="callouts right" start={3}>{[2, 3].map(callout)}</ol>
            </div>
            <p className="rec-note">Real games, example numbers.</p>
        </div>
    );
}
