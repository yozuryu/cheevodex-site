// The Record, as a guided tour: a real dex record (the author's Final Fantasy Crystal Chronicles: Ring of Fates)
// with four numbered callouts. The tour lights one part of the record at a time (ring, numbers, path, dex number);
// hovering or tapping a callout jumps to it and holds there. Visible and readable without script.
import { useEffect, useRef, useState } from 'react';

const REC = { no: 16244, title: 'Final Fantasy Crystal Chronicles: Ring of Fates', console: 'Nintendo DS', got: 9, total: 76, pts: 49, ptsTotal: 686, played: '4h 17m', path: [7, 22] as const };
const PARTS = [
    { key: 'ring', name: 'The ring.', text: 'How far you are. It turns gold and glows when the game is mastered.' },
    { key: 'numbers', name: 'The numbers.', text: 'Achievements, points and time played, as index lines.' },
    { key: 'path', name: 'The path.', text: 'One diamond per progression achievement. Light them all and the game is beaten.' },
    { key: 'no', name: 'The number.', text: 'Dex No.16244 is its RetroAchievements game ID.' },
];

export default function RecordTour({ icon }: { icon: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);       // the record has been seen: ring and path fill
    const [cur, setCur] = useState(0);
    const [held, setHeld] = useState(false);
    const [still, setStill] = useState(false);
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
    const pct = REC.got / REC.total * 100;
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
        <div className="manual" ref={ref} onPointerLeave={() => setHeld(false)}>
            <ol className="callouts left">{[0, 1].map(callout)}</ol>
            <div className="manual-card">
                <div className={`record ${on ? 'on' : ''}`} aria-label={`Dex record: ${REC.title}, ${REC.got} of ${REC.total} achievements, progression ${REC.path[0]} of ${REC.path[1]}`}>
                    <div className="record-head">
                        <img src={icon} alt="" width="72" height="72" />
                        <div>
                            <span className={`dexno part ${lit('no')}`}>Dex No.{REC.no}</span>
                            <b className="record-title">{REC.title}</b>
                            <span className="record-console">{REC.console}</span>
                        </div>
                    </div>
                    <div className="record-body">
                        <span className={`ring big part ${lit('ring')}`} style={{ ['--p' as string]: on ? pct : 0, ['--c' as string]: 'var(--accent)' }}>
                            <b>{Math.floor(pct)}<small>%</small></b>
                        </span>
                        <div className={`ledger part ${lit('numbers')}`}>
                            <div className="row"><span>Achievements</span><i /><b className="t-accent">{REC.got}<small>/{REC.total}</small></b></div>
                            <div className="row"><span>Points</span><i /><b className="t-gold">{REC.pts}<small>/{REC.ptsTotal}</small></b></div>
                            <div className="row"><span>Played</span><i /><b>{REC.played}</b></div>
                        </div>
                    </div>
                    <div className={`record-path part ${lit('path')}`} aria-hidden="true">
                        <span>Progression</span>
                        <span className="dpath">
                            {Array.from({ length: REC.path[1] }, (_, k) => (
                                <i key={k} className={on && k < REC.path[0] ? 'on' : ''} style={{ transitionDelay: `${400 + k * 110}ms` }} />
                            ))}
                        </span>
                        <b>{REC.path[0]}<small>/{REC.path[1]}</small></b>
                    </div>
                </div>
            </div>
            <ol className="callouts right" start={3}>{[2, 3].map(callout)}</ol>
        </div>
    );
}
