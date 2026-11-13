// A real dex record, built live: the author's Final Fantasy Crystal Chronicles: Ring of Fates. When it scrolls
// into view the ring fills to 11% and the progression path lights one diamond per progression achievement
// unlocked (7 of 22). Shown at its end state without motion.
import { useEffect, useRef, useState } from 'react';
import Mono from './Mono';

const REC = { no: 16244, title: 'Final Fantasy Crystal Chronicles: Ring of Fates', console: 'Nintendo DS', got: 9, total: 76, pts: 49, ptsTotal: 686, played: '4h 17m', path: [7, 22] as const };

export default function DexRecord() {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setOn(true); return; }
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
        if (ref.current) io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    const pct = REC.got / REC.total * 100;
    return (
        <div ref={ref} className={`record ${on ? 'on' : ''}`} aria-label={`Dex record: ${REC.title}, ${REC.got} of ${REC.total} achievements, progression ${REC.path[0]} of ${REC.path[1]}`}>
            <div className="record-head">
                <Mono title={REC.title} />
                <div>
                    <span className="dexno">Dex No.{REC.no}</span>
                    <b className="record-title">{REC.title}</b>
                    <span className="record-console">{REC.console}</span>
                </div>
            </div>
            <div className="record-body">
                <span className="ring big" style={{ ['--p' as string]: on ? pct : 0, ['--c' as string]: 'var(--accent)' }}>
                    <b>{Math.floor(pct)}<small>%</small></b>
                </span>
                <div className="ledger">
                    <div className="row"><span>Achievements</span><i /><b className="t-accent">{REC.got}<small>/{REC.total}</small></b></div>
                    <div className="row"><span>Points</span><i /><b className="t-gold">{REC.pts}<small>/{REC.ptsTotal}</small></b></div>
                    <div className="row"><span>Played</span><i /><b>{REC.played}</b></div>
                </div>
            </div>
            <div className="record-path" aria-hidden="true">
                <span>Progression</span>
                <span className="dpath">
                    {Array.from({ length: REC.path[1] }, (_, k) => (
                        <i key={k} className={on && k < REC.path[0] ? 'on' : ''} style={{ transitionDelay: `${400 + k * 110}ms` }} />
                    ))}
                </span>
                <b>{REC.path[0]}<small>/{REC.path[1]}</small></b>
            </div>
        </div>
    );
}
