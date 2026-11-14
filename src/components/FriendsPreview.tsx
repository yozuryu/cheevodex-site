// The Friends timeline in miniature, worked out from a name. Type any username: its hash seeds a small random
// generator that picks that player's evening (1 or 2 games from ten real RetroAchievements sets, 2 to 4 of each
// set's real achievements, the times), names a friend from the same seed and gives them a game too. Same name,
// same post, on every device, like the friend colour itself.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { friendColor } from './FriendColor';

export type Ach = { title: string; badge: string; points: number };
export type GameSet = { no: number; title: string; console: string; icon: string; achievements: Ach[] };

const OWNER = 'Yozuryu';
const FIRST = ['Pixel', 'Save', 'Retro', 'Combo', 'Turbo', 'Cart', 'Byte', 'Sprite', 'Warp', 'Boss', 'Arcade', 'Quest'];
const LAST = ['Sue', 'Rider', 'Hunter', 'Mage', 'Kid', 'Fox', 'Knight', 'Runner', 'Bard', 'Ghost', 'Wolf', 'Ace'];

function seedOf(s: string) {
    let h = 0x811c9dc5;
    for (const ch of s.toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
    return h;
}
function rng(seed: number) {     // mulberry32
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pad = (n: number) => String(n).padStart(2, '0');
const clock = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;

type Run = { set: GameSet; unlocks: (Ach & { hc: boolean })[]; start: number; end: number };
type Post = { name: string; runs: Run[]; end: number };

function evening(name: string, sets: GameSet[], games: number, avoid: number[] = []): Post {
    const r = rng(seedOf(name));
    const pool = sets.map((_, k) => k).filter(k => !avoid.includes(k));
    const runs: Run[] = [];
    let t = 17 * 60 + Math.floor(r() * 300);              // starts between 17:00 and 22:00
    const hc = r() < 0.75;                                  // most players stick to one mode
    for (let g = 0; g < games && pool.length; g++) {
        const k = pool.splice(Math.floor(r() * pool.length), 1)[0];
        const set = sets[k];
        const n = 2 + Math.floor(r() * 3);                  // 2 to 4 unlocks
        const idx = set.achievements.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }   // seeded Fisher-Yates: the same in every browser
        const order = idx.slice(0, n).sort((a, b) => a - b);
        const len = 25 + Math.floor(r() * 80);
        runs.push({ set, unlocks: order.map(i => ({ ...set.achievements[i], hc })), start: t, end: t + len });
        t += len + 10 + Math.floor(r() * 40);
    }
    return { name, runs: runs.reverse(), end: runs.length ? Math.max(...runs.map(x => x.end)) : t };
}
export function friendOf(name: string) {
    const r = rng(seedOf(name + '#friend'));
    const n = FIRST[Math.floor(r() * FIRST.length)] + LAST[Math.floor(r() * LAST.length)];
    return r() < 0.4 ? n + Math.floor(10 + r() * 89) : n;
}

function RunCard({ run }: { run: Run }) {
    const pts = run.unlocks.reduce((t, u) => t + u.points, 0);
    return (
        <div className="fp-run">
            <div className="fp-strip">
                <img src={run.set.icon} alt="" width="36" height="36" />
                <span className="fp-game"><b>{run.set.title}</b><small>{run.set.console} · {clock(run.start)}–{clock(run.end)}</small></span>
                <span className="fp-n">+{run.unlocks.length}<small>{pts} pts</small></span>
            </div>
            <div className="fp-badges">
                {run.unlocks.map(u => <img key={u.badge} src={u.badge} alt={u.title} title={`${u.title} · ${u.points} pts`} width="34" height="34" className={u.hc ? 'hc' : ''} loading="lazy" />)}
                <span className="fp-first">{run.unlocks[0].title}{run.unlocks.length > 1 ? ` and ${run.unlocks.length - 1} more` : ''}</span>
            </div>
        </div>
    );
}

export default function FriendsPreview({ sets, avatar }: { sets: GameSet[]; avatar: string }) {
    const [name, setName] = useState(OWNER);       // what is in the box
    const [shown, setShown] = useState(OWNER);     // whose evening is on screen: follows the box once typing pauses
    const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
    const inner = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | null>(null);
    useEffect(() => {
        if (name === shown) return;
        const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (still) { setShown(name); return; }
        let swap = 0;
        const wait = window.setTimeout(() => {
            setPhase('out');                                           // fade the old posts first
            swap = window.setTimeout(() => { setShown(name); setPhase('in'); }, 160);
        }, 220);
        return () => { clearTimeout(wait); clearTimeout(swap); };
    }, [name, shown]);
    useLayoutEffect(() => {                                            // the card grows and shrinks with its posts instead of jumping
        const el = inner.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const posts = useMemo(() => {
        const me = shown.trim() || 'someone';
        const mine = evening(me, sets, 1 + (seedOf(me) % 2));
        const used = mine.runs.map(x => sets.indexOf(x.set));
        const theirs = evening(friendOf(me), sets, 1, used);
        return [mine, theirs].sort((a, b) => b.end - a.end);
    }, [shown, sets]);
    const total = posts.reduce((t, p) => t + p.runs.reduce((u, r) => u + r.unlocks.length, 0), 0);
    return (
        <div className="fp">
            <div className="fp-try">
                <label htmlFor="fp-name">Type any RetroAchievements username</label>
                <input id="fp-name" name="username" type="text" autoComplete="off" spellCheck={false} maxLength={20} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="fp-stage" style={height === null ? undefined : { height }}>
                <div ref={inner} className={`fp-inner ${phase}`}>
                    <div className="fp-day"><b>Today</b><span>{total} unlocks · {posts.length} friends</span></div>
                    <div className="fp-rail" aria-live="polite">
                        {posts.map((p, i) => {
                            const own = p.name.toLowerCase() === OWNER.toLowerCase();
                            const n = p.runs.reduce((u, r) => u + r.unlocks.length, 0);
                            return (
                                <div className="fp-post" key={p.name} style={{ ['--fc' as string]: friendColor(p.name), ['--i' as string]: i }}>
                                    <span className="fp-av" aria-hidden="true">{own ? <img src={avatar} alt="" width="40" height="40" /> : p.name[0].toUpperCase()}</span>
                                    <div className="fp-main">
                                        <div className="fp-h"><b>{p.name}</b><time>{clock(p.end)}</time>{p.runs.length > 1 && <span>+{n} in {p.runs.length} games</span>}</div>
                                        {p.runs.map(r => <RunCard key={r.set.no} run={r} />)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
