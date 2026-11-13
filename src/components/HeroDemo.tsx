// Hero B: a small working dex. Four of the author's entries in a list; picking one opens its record beside
// it, the ring filling and the progression diamonds lighting. Arrow keys move through the list.
import { useEffect, useState } from 'react';
import Mono from './Mono';
import type { Entry } from './HeroDex';

const STATE = {
    played: { label: 'In progress', color: 'var(--accent)' },
    beaten: { label: 'Beaten', color: 'var(--silver)' },
    mastered: { label: 'Mastered', color: 'var(--gold)' },
};

export default function HeroDemo({ entries }: { entries: Entry[] }) {
    const [cur, setCur] = useState(0);
    const [fill, setFill] = useState(true);
    const e = entries[cur];
    const st = STATE[e.state];
    const pct = e.total ? e.got / e.total * 100 : 0;
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setFill(false);
        const t = window.setTimeout(() => setFill(true), 60);
        return () => clearTimeout(t);
    }, [cur]);
    const path = e.path;
    return (
        <div className="demo">
            <ul className="demo-list" role="listbox" aria-label="Dex entries" aria-activedescendant={`de-${e.no}`}>
                {entries.map((x, k) => {
                    const s = STATE[x.state];
                    return (
                        <li key={x.no} id={`de-${x.no}`} role="option" aria-selected={k === cur} tabIndex={k === cur ? 0 : -1}
                            className={`demo-row ${k === cur ? 'on' : ''}`} onClick={() => setCur(k)}
                            onKeyDown={ev => {
                                if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
                                ev.preventDefault();
                                const n = (k + (ev.key === 'ArrowDown' ? 1 : entries.length - 1)) % entries.length;
                                setCur(n);
                                (ev.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
                            }}>
                            <span className="ring" style={{ ['--s' as string]: '44px', ['--w' as string]: '3.5px', ['--p' as string]: x.got / x.total * 100, ['--c' as string]: s.color }}>
                                <Mono title={x.title} />
                            </span>
                            <span className="demo-id"><span className="dexno">No.{x.no}</span><b>{x.title}</b></span>
                            <span className="demo-n" style={{ color: s.color }}>{x.got}<small>/{x.total}</small></span>
                        </li>
                    );
                })}
            </ul>
            <div className={`demo-rec s-${e.state}`} key={e.no} aria-live="polite">
                <div className="demo-rec-top">
                    <span className="dexno">Dex No.{e.no}</span>
                    <span style={{ color: st.color }}>{st.label}</span>
                </div>
                <b className="demo-title">{e.title}</b>
                <span className="demo-console">{e.console}</span>
                <div className="demo-body">
                    <span className={`ring big ${e.state === 'mastered' && fill ? 'full' : ''}`} style={{ ['--p' as string]: fill ? pct : 0, ['--c' as string]: st.color }}>
                        <b style={{ color: st.color }}>{Math.floor(pct)}<small>%</small></b>
                    </span>
                    <div className="ledger">
                        <div className="row"><span>Achievements</span><i /><b>{e.got}<small>/{e.total}</small></b></div>
                        <div className="row"><span>State</span><i /><b style={{ color: st.color }}>{st.label}</b></div>
                    </div>
                </div>
                {path && <div className="hdex-path">
                    <span>Progression</span>
                    <span className="dpath">
                        {Array.from({ length: Math.min(path[1], 14) }, (_, k) => {
                            const lit = k < Math.round(path[0] / path[1] * Math.min(path[1], 14));
                            return <i key={k} className={fill && lit ? 'on' : ''} style={{ transitionDelay: `${200 + k * 60}ms` }} />;
                        })}
                    </span>
                    <b>{path[0]}<small>/{path[1]}</small></b>
                </div>}
            </div>
        </div>
    );
}
