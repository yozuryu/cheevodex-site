// The search in miniature: the app's command palette over a small catalog of real RetroAchievements games
// (src/lib/search-demo.json) and a few made-up players. The matcher is a copy of the app's (assets/match.js
// in the cheevodex repo): every typed word matches a word of the name from its start, inside it, or within a
// typo (one from 4 letters, two from 7); initials work; a number is a Dex No. Keep the two in step.
// It types "legnd of zelda" by itself the first time it comes into view; the chips try other queries.
import { useEffect, useMemo, useRef, useState } from 'react';
import { friendColor } from './FriendColor';

type Game = { no: number; title: string; console: string; icon?: string };
type Item = { ws: string[]; ini: string };
type Row =
    | { kind: 'game'; key: string; g: Game }
    | { kind: 'player'; key: string; name: string }
    | { kind: 'page'; key: string; label: string; hint: string };

const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const words = (t: string) => norm(t).split(' ').filter(Boolean);
const withIni = <T extends { ws: string[] }>(x: T) => ({ ...x, ini: x.ws.map(w => w[0]).join('') });

function dl(a: string, b: string, max: number) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    let pp: number[] | null = null, p = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        const c = [i];
        let low = i;
        for (let j = 1; j <= n; j++) {
            let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            if (pp && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
            c[j] = v;
            if (v < low) low = v;
        }
        if (low > max) return max + 1;
        pp = p; p = c;
    }
    return p[n];
}
function tokenScore(t: string, ws: string[], typos: boolean): number | null {
    let best: number | null = null;
    for (const w of ws) {
        if (w === t) return 0;
        if (w.startsWith(t)) best = 0.1;
        else if (best == null && t.length >= 3 && w.includes(t)) best = 0.4;
    }
    if (best != null || !typos) return best;
    const allow = /^\d+$/.test(t) ? 0 : t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0;
    if (!allow) return null;
    for (const w of ws) {
        if (t[0] !== w[0] && t[1] !== w[1] && !(t[0] === w[1] && t[1] === w[0])) continue;
        const d = Math.min(dl(t, w, allow), w.length > t.length ? dl(t, w.slice(0, t.length), allow) : allow + 1);
        if (d <= allow && (best == null || 0.5 + d * 0.2 < best)) best = 0.5 + d * 0.2;
    }
    return best;
}
// [score, typo] or null
function match(qs: string[], ini: string | null, it: Item, typos: boolean): [number, boolean] | null {
    if (!qs.length) return null;
    if (ini && it.ws.length >= ini.length && it.ini.startsWith(ini) && tokenScore(ini, it.ws, false) == null)
        return [0.35 + Math.max(0, it.ws.length - ini.length) * 0.03, false];
    let total = 0, typo = false;
    for (const t of qs) { const sc = tokenScore(t, it.ws, typos); if (sc == null) return null; total += sc; if (sc >= 0.5) typo = true; }
    return [total / qs.length + Math.max(0, it.ws.length - qs.length) * 0.03, typo];
}

// A console's tint for the letter tiles of games without a local icon (one hue per console name)
const hueOf = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 360; };

const PAGES = [
    { label: 'Profile', hint: 'Your dex' }, { label: 'Social', hint: "Friends' unlocks, following" },
    { label: 'Consoles', hint: 'Every console and its games' }, { label: 'Changelog', hint: 'What changed in each edition' },
];
// Typed first: a typo that lands on a game with its icon; the chips show the other tricks
const TRY = ['legnd of zelda', 'ff', 'kirbi', 'ocarnia of time', 'retro', '10113'];

export default function SearchDemo({ games, players, iconBase }: { games: Game[]; players: string[]; iconBase: string }) {
    const lists = useMemo(() => ({
        games: games.map(g => withIni({ g, ws: words(g.title) })),
        players: players.map(name => withIni({ name, ws: words(name.replace(/([a-z])([A-Z0-9])/g, '$1 $2')).concat(words(name)) })),
        pages: PAGES.map(p => withIni({ ...p, ws: words(`${p.label} ${p.hint}`) })),
    }), [games, players]);
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const [typing, setTyping] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null), inputRef = useRef<HTMLInputElement>(null), timer = useRef<number | undefined>(undefined);

    // Type a query out, a letter at a time (also the chips)
    const typeOut = (text: string) => {
        window.clearInterval(timer.current);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setQ(text); return; }
        let i = 0;
        setTyping(true);
        setQ('');
        timer.current = window.setInterval(() => {
            i++;
            setQ(text.slice(0, i));
            if (i >= text.length) { window.clearInterval(timer.current); setTyping(false); }
        }, 75);
    };
    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { typeOut(TRY[0]); io.disconnect(); } }, { threshold: 0.25 });   // a quarter: images above can still shift it after a jump here
        io.observe(el);
        return () => { io.disconnect(); window.clearInterval(timer.current); };
    }, []);

    const groups = useMemo(() => {
        const query = q.trim();
        if (!query) return [{ label: 'Go to', rows: PAGES.map(p => ({ kind: 'page', key: p.label, label: p.label, hint: p.hint }) as Row) }];
        const qs = words(query), ini = qs.length === 1 && /^[a-z]{2,5}$/.test(qs[0]) ? qs[0] : null;
        const run = (typos: boolean) => ({
            games: lists.games.map(it => ({ it, m: match(qs, ini, it, typos) })).filter(r => r.m),
            players: lists.players.map(it => ({ it, m: match(qs, ini, it, typos) })).filter(r => r.m),
            pages: lists.pages.map(it => ({ it, m: match(qs, ini, it, typos) })).filter(r => r.m),
        });
        let all = run(false);
        if (!all.games.length && !all.players.length && !all.pages.length) all = run(true);
        const by = (a: { m: [number, boolean] | null }, b: { m: [number, boolean] | null }) => a.m![0] - b.m![0];
        const out: { label: string; best: number; rows: Row[] }[] = [];
        const num = query.match(/^(?:no\.?\s*)?(\d{1,6})$/i);
        if (num) {
            const g = games.find(x => x.no === Number(num[1]));
            if (g) out.push({ label: 'Dex No.', best: -1, rows: [{ kind: 'game', key: `n${g.no}`, g }] });
        }
        // games with art get a small lift (demo only: in the app every game has its icon)
        const lift = (r: { it: { g: Game }; m: [number, boolean] | null }) => r.m![0] - (r.it.g.icon ? 0.12 : 0);
        const gs = all.games.sort((a, b) => lift(a) - lift(b) || a.it.g.title.length - b.it.g.title.length).slice(0, 6);
        const ps = all.players.sort(by).slice(0, 3), pg = all.pages.sort(by).slice(0, 2);
        if (gs.length) out.push({ label: 'Games', best: gs[0].m![0], rows: gs.map(r => ({ kind: 'game', key: `g${r.it.g.no}`, g: r.it.g }) as Row) });
        if (ps.length) out.push({ label: 'Players', best: ps[0].m![0], rows: ps.map(r => ({ kind: 'player', key: r.it.name, name: r.it.name }) as Row) });
        if (pg.length) out.push({ label: 'Go to', best: pg[0].m![0] + 0.02, rows: pg.map(r => ({ kind: 'page', key: r.it.label, label: r.it.label, hint: r.it.hint }) as Row) });
        return out.sort((a, b) => a.best - b.best);
    }, [q, lists, games]);
    const flat = groups.flatMap(g => g.rows);
    useEffect(() => setActive(0), [q]);

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    };
    let i = -1;
    const row = (r: Row) => {
        const idx = ++i;
        return (
            <div key={r.key} className={`sd-row ${idx === active ? 'on' : ''}`} onMouseMove={() => setActive(idx)} role="option" aria-selected={idx === active}>
                {r.kind === 'game' ? (<>
                    {r.g.icon ? <img src={iconBase + r.g.icon + '.png'} alt="" className="sd-icon" loading="lazy" />
                        : <span className="sd-icon sd-letter" style={{ ['--h' as string]: hueOf(r.g.console) }}>{r.g.title.replace(/^the /i, '')[0]}</span>}
                    <span className="sd-main"><span className="sd-t">{r.g.title}</span><span className="sd-s"><span className="sd-no">No.{r.g.no}</span>{r.g.console}</span></span>
                </>) : r.kind === 'player' ? (<>
                    <span className="sd-icon sd-av" style={{ ['--fc' as string]: friendColor(r.name) }}>{r.name[0]}</span>
                    <span className="sd-main"><span className="sd-t sd-gold">{r.name}</span><span className="sd-s">Following</span></span>
                </>) : (<>
                    <span className="sd-icon sd-tile">›</span>
                    <span className="sd-main"><span className="sd-t">{r.label}</span><span className="sd-s">{r.hint}</span></span>
                </>)}
            </div>
        );
    };

    return (
        <div className="sd" ref={boxRef}>
            <div className="sd-panel" role="search" aria-label="Try the search">
                <label className={`sd-bar ${typing ? 'busy' : ''}`}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input ref={inputRef} value={q} onChange={e => { window.clearInterval(timer.current); setTyping(false); setQ(e.target.value); }} onKeyDown={onKey}
                        placeholder="Search games, players and pages" aria-label="Search games, players and pages" spellCheck={false} autoComplete="off" />
                    <kbd>⌘K</kbd>
                </label>
                <div className="sd-list" role="listbox">
                    {groups.length === 0
                        ? <div className="sd-none">Nothing here matches “{q.trim()}”</div>
                        : groups.map(gr => <div key={gr.label} className="sd-group"><div className="sd-label">{gr.label}</div>{gr.rows.map(row)}</div>)}
                </div>
            </div>
            <div className="sd-try" role="group" aria-label="Try a search">
                <span>Try</span>
                {TRY.map(t => <button key={t} type="button" onClick={() => { typeOut(t); inputRef.current?.focus({ preventScroll: true }); }} aria-pressed={q === t}>{t}</button>)}
            </div>
        </div>
    );
}
