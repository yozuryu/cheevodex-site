// The codex's contents page: every part of the app as an index line (name, dotted leader, what it holds).
// Picking a line turns to that part: its real screens on the right. Without script, every part is listed
// with its screens in order.
import { useState } from 'react';

export type Part = {
    id: string; name: string; holds: string; text: string;
    desk?: { src: string; alt: string }; phone?: { src: string; alt: string };
};

export default function Contents({ parts }: { parts: Part[] }) {
    const [cur, setCur] = useState(0);
    const p = parts[cur];
    return (
        <div className="contents">
            <ol className="contents-list" role="tablist" aria-label="Parts of Cheevodex" aria-orientation="vertical">
                {parts.map((x, k) => (
                    <li key={x.id}>
                        <button type="button" role="tab" id={`tab-${x.id}`} aria-selected={k === cur} aria-controls={`part-${x.id}`}
                            tabIndex={k === cur ? 0 : -1} className={`cline ${k === cur ? 'on' : ''}`} onClick={() => setCur(k)}
                            onKeyDown={e => {
                                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                                e.preventDefault();
                                const n = (k + (e.key === 'ArrowDown' ? 1 : parts.length - 1)) % parts.length;
                                setCur(n); document.getElementById(`tab-${parts[n].id}`)?.focus();
                            }}>
                            <span className="cline-k">{x.name}</span><i /><span className="cline-v">{x.holds}</span>
                        </button>
                    </li>
                ))}
            </ol>
            <div className="contents-page" role="tabpanel" id={`part-${p.id}`} aria-labelledby={`tab-${p.id}`} key={p.id}>
                <p className="contents-text">{p.text}</p>
                <div className={`contents-shots ${p.desk && p.phone ? 'both' : ''}`}>
                    {p.desk && <img className="shot shot-d" src={p.desk.src} alt={p.desk.alt} width="1440" height="900" loading="lazy" />}
                    {p.phone && <img className="shot shot-p" src={p.phone.src} alt={p.phone.alt} width="390" height="844" loading="lazy" />}
                </div>
            </div>
        </div>
    );
}
