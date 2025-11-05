import { nanoid } from 'nanoid/non-secure';
let avatar_url
let Data = [
{
    // index: nanoid(),
    title: "villager",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/villager.webp',
    side: "villager",
    score: 1,
    limit: 16,
    order: 0,
    role: 'Find the werewolves and eliminate them.'
},
{
    // index: nanoid(),
    title: "werewolf",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/werewolf.webp',
    side: "werewolf",
    score: -6,
    limit: 5,
    order: 2,
    role: 'Each night, the werewolves choose a player to eliminate.'
},
{
    // index: nanoid(),
    title: "wolfcub",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/wolf-cub.webp',
    side: "werewolf",
    score: -8,
    limit: 1,
    order: 3,
    role: 'If you are eliminated, the werewolves can eliminate 2 players the following night.'
},
{
    // index: nanoid(),
    title: "bodyguard",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/bodyguard.webp',
    side: "villager",
    score: 3,
    limit: 1,
    order: 1,
    role: 'Each night, the bodyguard can protect a player from being eliminated.'
},
{
    // index: nanoid(),
    title: "seer",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/seer.webp',
    side: "villager",
    score: 7,
    limit: 1,
    order: 4,
    role: 'Each night, the seer can learn the role of a player.'
},
{
    // index: nanoid(),
    title: "witch",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/witch.webp',
    side: "villager",
    score: 4,
    limit: 1,
    order: 6,
    role: 'Each night, the witch can save or eliminate a player.'
},
{
    // index: nanoid(),
    title: "hunter",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/hunter.webp',
    side: "villager",
    score: 3,
    limit: 1,
    order: 5,
    role: 'If you are eliminated, you can eliminate another player.'
},
{
    // index: nanoid(),
    title: "spellcaster",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/spellcaster.webp',
    side: "villager",
    score: 1,
    limit: 1,
    order: 7,
    role: 'Each night, choose a player to silence for the following day'
},
{
    // index: nanoid(),
    title: "insomniac",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/insomniac.webp',
    side: "villager",
    score: 3,
    limit: 1,
    order: 8,
    role: 'Each night, learn if at least 1 of your neighbours took a night action.'
},
{
    // index: nanoid(),
    title: "mason",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/mason.webp',
    side: "villager",
    score: 2,
    limit: 2,
    order: 9,
    role: 'The first night, wake up to see who the other mason is.'
},
{
    // index: nanoid(),
    title: "chupacabra",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/chupacabra.webp',
    side: "3rd",
    score: 4,
    limit: 1,
    order: 10,
    role: 'Each night, eliminate a player. If you eliminate a werewolf, you become a werewolf.'
},
{
    // index: nanoid(),
    title: "tanner",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/tanner.webp',
    side: "3rd",
    score: -2,
    limit: 1,
    order: 11,
    role: 'You win if you are eliminated.'
},
{
    // index: nanoid(),
    title: "sorceress",
    link: 'https://yevkqcofrtinwfhxuchd.supabase.co/storage/v1/object/public/cards/sorceress.png',
    side: "ww",
    score: -3,
    limit: 1,
    order: 12,
    role: 'Each night, look for the Seer.'
},
];
export default Data;
