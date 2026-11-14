// "The dex entries that moved", as Activity shows it: the ring holds what you had before the fortnight (dim) and
// fills with what you gained (bright) while the +N counts up.
import { useEffect, useRef, useState } from 'react';

type Moved = { no: number; title: string; console: string; icon: string; before: number; now: number; total: number };

export default function MovedRow({ rows }: { rows: Moved[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [t, setT] = useState(0);   // 0 → 1 as the rows play
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(1); return; }
        let raf = 0, start = 0;
        const run = (ts: number) => { if (!start) start = ts; const k = Math.min(1, (ts - start) / 1600); setT(1 - Math.pow(1 - k, 3)); if (k < 1) raf = requestAnimationFrame(run); };
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { raf = requestAnimationFrame(run); io.disconnect(); } }, { threshold: 0.5 });
        if (ref.current) io.observe(ref.current);
        return () => { io.disconnect(); cancelAnimationFrame(raf); };
    }, []);
    return (
        <div className="moved" ref={ref}>
            <div className="moved-h"><span>Last 14 days</span><b>{rows.reduce((s, r) => s + Math.round((r.now - r.before) * t), 0)} unlocks</b></div>
            {rows.map(r => {
                const gained = Math.round((r.now - r.before) * t);
                const pBefore = r.before / r.total * 100, pNow = (r.before + gained) / r.total * 100;
                return (
                    <div className="moved-row" key={r.no}>
                        <span className="ring two" style={{ ['--b' as string]: pBefore, ['--p' as string]: pNow, ['--c' as string]: 'var(--accent)' }}>
                            <img src={r.icon} alt="" width="48" height="48" />
                        </span>
                        <span className="moved-id"><b>{r.title}</b><small><span className="dexno">No.{r.no}</span> {r.console}</small></span>
                        <span className="moved-n"><b>+{gained}</b><small>{r.before} → {r.before + gained}/{r.total}</small></span>
                    </div>
                );
            })}
        </div>
    );
}
