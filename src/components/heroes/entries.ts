import type { Entry } from '../HeroDex';
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const icon = (no: number) => base + 'app-icons/' + no + '.png';
// Four entries from the author's dex; icons only ever appear inside app-like frames
export const entries: Entry[] = [
    { no: 16244, title: 'Final Fantasy Crystal Chronicles: Ring of Fates', console: 'Nintendo DS', icon: icon(16244), got: 9, total: 76, state: 'played', path: [7, 22] },
    { no: 11306, title: 'Tomba! 2: The Evil Swine Return', console: 'PlayStation', icon: icon(11306), got: 30, total: 45, state: 'beaten' },
    { no: 2873, title: "Donald Duck: Goin' Quackers", console: 'PlayStation', icon: icon(2873), got: 46, total: 65, state: 'beaten' },
    { no: 16452, title: '7th Dragon 2020', console: 'PlayStation Portable', icon: icon(16452), got: 80, total: 80, state: 'mastered' },
];
