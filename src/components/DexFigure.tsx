// The Dex, read through a loupe. The figure is a real screenshot of the app; four callouts each mark a part of it
// and the loupe in the corner shows that part at full size, from the same picture. It tours the four until the
// visitor picks one. Phones get the phone screenshot and their own marks.
import { useEffect, useRef, useState } from 'react';

type Box = [number, number, number, number, number];   // x, y, w, h in screenshot pixels, then the loupe's zoom
export type Spot = { key: string; name: string; text: string; desk: Box; phone: Box };
type Shot = { src: string; full: string; w: number; h: number; alt: string };

export default function DexFigure({ desk, phone, spots, crop }: { desk: Shot; phone: Shot; spots: Spot[]; crop: [number, number] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [cur, setCur] = useState(0);
    const [auto, setAuto] = useState(true);
    const [seen, setSeen] = useState(false);
    const [narrow, setNarrow] = useState(false);
    useEffect(() => {
        const mq = matchMedia('(max-width: 759px)');
        const on = () => setNarrow(mq.matches);
        on(); mq.addEventListener('change', on);
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) setAuto(false);
        const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 });
        if (ref.current) io.observe(ref.current);
        return () => { mq.removeEventListener('change', on); io.disconnect(); };
    }, []);
    useEffect(() => {
        if (!auto || !seen) return;
        const t = window.setTimeout(() => setCur(n => (n + 1) % spots.length), 3600);
        return () => clearTimeout(t);
    }, [cur, auto, seen, spots.length]);
    const pick = (k: number) => { setAuto(false); setCur(k); };
    const shot = narrow ? phone : desk;
    const [top, tall] = narrow ? crop : [0, desk.h];       // the phone figure shows a band of the screen, not all of it
    const box = (s: Spot) => (narrow ? s.phone : s.desk);
    const b = box(spots[cur]);
    return (
        <div className={`dexfig ${auto && seen ? 'touring' : ''}`} ref={ref}>
            <div className="dexfig-stage">
                <div className="dexfig-shot" style={{ aspectRatio: `${shot.w} / ${tall}` }}>
                    <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" style={{ marginTop: `${-top / shot.w * 100}%` }} />
                    {spots.map((s, k) => {
                        const [x, y, w, h] = box(s);
                        return (
                            <button key={s.key} type="button" className={`spot ${k === cur ? 'on' : ''}`} aria-label={s.name} aria-pressed={k === cur} onClick={() => pick(k)}
                                style={{ left: `${x / shot.w * 100}%`, top: `${(y - top) / tall * 100}%`, width: `${w / shot.w * 100}%`, height: `${h / tall * 100}%` }}>
                                <i>{k + 1}</i>
                            </button>
                        );
                    })}
                </div>
                <div className="loupe" aria-hidden="true">
                    <div className="loupe-view">
                        <div className="loupe-bg" style={{ backgroundImage: `url(${shot.full})`, ['--cx' as string]: (b[0] + b[2] / 2) / shot.w, ['--cy' as string]: (b[1] + b[3] / 2) / shot.h, ['--z' as string]: b[4], ['--ar' as string]: shot.h / shot.w }} />
                    </div>
                    <div className="loupe-cap"><i>{cur + 1}</i><b>{spots[cur].name}</b><span className="loupe-x">at full size</span></div>
                </div>
            </div>
            <ol className="dexfig-legend">
                {spots.map((s, k) => (
                    <li key={s.key} className={k === cur ? 'on' : ''}>
                        <button type="button" aria-pressed={k === cur} onClick={() => pick(k)} onPointerEnter={e => { if (e.pointerType === 'mouse') pick(k); }} onFocus={() => pick(k)}>
                            <i>{k + 1}</i><b>{s.name}</b><span>{s.text}</span>
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    );
}
