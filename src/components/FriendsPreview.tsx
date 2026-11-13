// The Friends timeline in miniature: a day heading, then posts on a rail, one per friend, each with their runs
// (game strip, +N and points, the badges they unlocked, the first unlock named). The first friend's name can be
// typed over to see the colour Cheevodex would give it; the author's own name shows their avatar. Real games and
// badges from RetroAchievements.
import { useState } from 'react';
import { friendColor } from './FriendColor';

export type Unlock = { title: string; badge: string; points: number; hc: boolean };
export type Run = { title: string; console: string; icon: string; time: string; unlocks: Unlock[] };
export type Post = { name: string; time: string; runs: Run[] };

const OWNER = 'Yozuryu';

function RunCard({ run }: { run: Run }) {
    const pts = run.unlocks.reduce((t, u) => t + u.points, 0);
    return (
        <div className="fp-run">
            <div className="fp-strip">
                <img src={run.icon} alt="" width="36" height="36" />
                <span className="fp-game"><b>{run.title}</b><small>{run.console} · {run.time}</small></span>
                <span className="fp-n">+{run.unlocks.length}<small>{pts} pts</small></span>
            </div>
            <div className="fp-badges">
                {run.unlocks.map(u => <img key={u.badge} src={u.badge} alt={u.title} title={`${u.title} · ${u.points} pts`} width="34" height="34" className={u.hc ? 'hc' : ''} />)}
                <span className="fp-first">{run.unlocks[0].title}{run.unlocks.length > 1 ? ` and ${run.unlocks.length - 1} more` : ''}</span>
            </div>
        </div>
    );
}

export default function FriendsPreview({ posts, avatar }: { posts: Post[]; avatar: string }) {
    const [name, setName] = useState(posts[0].name);
    const shown = posts.map((p, k) => (k === 0 ? { ...p, name: name.trim() || 'someone' } : p));
    return (
        <div className="fp">
            <div className="fp-try">
                <label htmlFor="fp-name">Try a username on the first post</label>
                <input id="fp-name" name="username" type="text" autoComplete="off" spellCheck={false} maxLength={20} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="fp-day"><b>Today</b><span>{shown.reduce((t, p) => t + p.runs.reduce((u, r) => u + r.unlocks.length, 0), 0)} unlocks · {shown.length} friends</span></div>
            <div className="fp-rail">
                {shown.map((p, k) => {
                    const c = friendColor(p.name);
                    const own = p.name.toLowerCase() === OWNER.toLowerCase();
                    return (
                        <div className="fp-post" key={k} style={{ ['--fc' as string]: c }}>
                            <span className="fp-av" aria-hidden="true">{own ? <img src={avatar} alt="" width="40" height="40" /> : p.name[0].toUpperCase()}</span>
                            <div className="fp-main">
                                <div className="fp-h"><b>{p.name}</b><time>{p.time}</time>{p.runs.length > 1 && <span>+{p.runs.reduce((u, r) => u + r.unlocks.length, 0)} in {p.runs.length} games</span>}</div>
                                {p.runs.map(r => <RunCard key={r.title} run={r} />)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
