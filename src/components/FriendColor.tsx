// Try it: type a RetroAchievements username and see the colour Cheevodex gives that friend on the Friends
// timeline. The same hash as the app (profile/app.js friendColor): one FNV-1a hash, scrambled, sets the hue
// (70 to 330 degrees, never red, orange or gold), the saturation and the lightness.
import { useState } from 'react';

export function friendColor(u: string) {
    let h = 0x811c9dc5;
    for (const ch of String(u).toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    h >>>= 0;
    return `hsl(${70 + (h % 261)} ${55 + ((h >>> 9) % 36)}% ${60 + ((h >>> 17) % 17)}%)`;
}

export default function FriendColor() {
    const [name, setName] = useState('Yozuryu');
    const c = friendColor(name.trim() || ' ');
    return (
        <div className="fc">
            <div className="fc-field">
                <label htmlFor="fc-name">Type a RetroAchievements username</label>
                <input id="fc-name" name="username" type="text" autoComplete="off" spellCheck={false} maxLength={20}
                    value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="fc-post" style={{ ['--fc' as string]: c }}>
                <span className="fc-av" aria-hidden="true">{(name.trim()[0] || '?').toUpperCase()}</span>
                <span className="fc-body">
                    <b>{name.trim() || 'someone'}</b>
                    <span className="fc-run"><i aria-hidden="true" />unlocked 3 achievements</span>
                </span>
            </div>
            <p className="fc-note">Same name, same colour, on every device. <code>{c}</code></p>
        </div>
    );
}
