import type { Question, RoundConfig } from "./types.js";

// Number of questions per round is controlled entirely by how many
// question objects exist with that `round` value below - nothing about
// round sizes is hardcoded elsewhere in the app.

export const ROUND_CONFIG: RoundConfig[] = [
  { round: 1, name: "Warm Up", points: [20, 15, 10, 5] },
  { round: 2, name: "Think Fast", points: [30, 25, 15, 10] },
  { round: 3, name: "The Connection", points: [40, 30, 20, 10] },
  { round: 4, name: "Final Connection", points: [60, 45, 30, 15] },
];

export function getRoundConfig(round: number): RoundConfig {
  const config = ROUND_CONFIG.find((r) => r.round === round);
  if (!config) throw new Error(`No round config for round ${round}`);
  return config;
}

// Questions must be listed in play order: grouped by round, and within a
// round, ordered by `order` ascending.

export const QUESTIONS: Question[] = [
  // ============================================================
  // ROUND 1 — WARM UP
  // Easy questions, but Clue 1 should still require some thinking.
  // ============================================================

  {
    id: "q1",
    round: 1,
    order: 1,
    answer: "BATMAN",
    acceptedAnswers: ["batman", "Batman", "BATMAN", "the batman", "The Batman"],
    clues: [
      { type: "text", content: "1939" },
      { type: "text", content: "Wayne" },
      { type: "text", content: "Billionaire" },
      { type: "text", content: "Gotham" },
    ],
  },

  {
    id: "q9",
    round: 1,
    order: 2,
    answer: "IRON MAN",
    acceptedAnswers: ["iron man", "Iron Man", "IRON MAN", "ironman", "Ironman"],
    clues: [
      { type: "text", content: "A fictional metal" },
      { type: "text", content: "Genius" },
      { type: "text", content: "Arc Reactor" },
      { type: "text", content: "Tony Stark" },
    ],
  },

  {
    id: "q10",
    round: 1,
    order: 3,
    answer: "HARRY POTTER",
    acceptedAnswers: [
      "harry potter",
      "Harry Potter",
      "HARRY POTTER",
      "harry",
      "Harry",
    ],
    clues: [
      { type: "text", content: "Platform 9¾" },
      { type: "text", content: "A lightning-shaped mark" },
      { type: "text", content: "Hogwarts" },
      { type: "text", content: "Voldemort" },
    ],
  },

  {
    id: "q11",
    round: 1,
    order: 4,
    answer: "DORAEMON",
    acceptedAnswers: ["doraemon", "Doraemon", "DORAEMON"],
    clues: [
      { type: "text", content: "22nd century" },
      { type: "text", content: "Blue" },
      { type: "text", content: "Anywhere Door" },
      { type: "text", content: "Nobita" },
    ],
  },

  {
    id: "q12",
    round: 1,
    order: 5,
    answer: "MINIONS",
    acceptedAnswers: [
      "minions",
      "Minions",
      "MINIONS",
      "minion",
      "Minion",
    ],
    clues: [
      { type: "text", content: "Despicable" },
      { type: "text", content: "Yellow" },
      { type: "text", content: "Banana" },
      { type: "text", content: "Gru" },
    ],
  },

  {
    id: "q13",
    round: 1,
    order: 6,
    answer: "BARBIE",
    acceptedAnswers: ["barbie", "Barbie", "BARBIE"],
    clues: [
      { type: "text", content: "1959" },
      { type: "text", content: "Dreamhouse" },
      { type: "text", content: "Doll" },
      { type: "text", content: "Ken" },
    ],
  },

  {
    id: "q14",
    round: 1,
    order: 7,
    answer: "CRICKET",
    acceptedAnswers: ["cricket", "Cricket", "CRICKET"],
    clues: [
      { type: "text", content: "LBW" },
      { type: "text", content: "Bat" },
      { type: "text", content: "Wicket" },
      { type: "text", content: "11 players" },
    ],
  },


  // ============================================================
  // ROUND 2 — THINK FAST
  // Slightly harder / more general knowledge.
  // ============================================================

  {
    id: "q2",
    round: 2,
    order: 1,
    answer: "SPIDER-MAN",
    acceptedAnswers: [
      "spider-man",
      "Spider-Man",
      "SPIDER-MAN",
      "spider man",
      "Spider Man",
      "SPIDER MAN",
      "spiderman",
      "Spiderman",
      "SPIDERMAN",
    ],
    clues: [
      { type: "text", content: "Queens" },
      { type: "text", content: "Radioactive" },
      { type: "text", content: "Uncle Ben" },
      { type: "text", content: "Peter Parker" },
    ],
  },

  {
    id: "q3",
    round: 2,
    order: 2,
    answer: "APOLLO 11",
    acceptedAnswers: [
      "apollo 11",
      "Apollo 11",
      "APOLLO 11",
      "apollo eleven",
      "Apollo Eleven",
      "APOLLO ELEVEN",
    ],
    clues: [
      { type: "text", content: "July 1969" },
      { type: "text", content: "Kennedy Space Center" },
      { type: "text", content: "Eagle" },
      { type: "text", content: "Neil Armstrong" },
    ],
  },

  {
    id: "q4",
    round: 2,
    order: 3,
    answer: "SPOTIFY",
    acceptedAnswers: ["spotify", "Spotify", "SPOTIFY"],
    clues: [
      { type: "text", content: "Stockholm" },
      { type: "text", content: "Wrapped" },
      { type: "text", content: "Freemium" },
      { type: "text", content: "Music streaming" },
    ],
  },

  {
    id: "q15",
    round: 2,
    order: 4,
    answer: "APPLE",
    acceptedAnswers: ["apple", "Apple", "APPLE", "Apple Inc", "Apple Inc."],
    clues: [
      { type: "text", content: "Cupertino" },
      { type: "text", content: "Macintosh" },
      { type: "text", content: "iPhone" },
      { type: "text", content: "Steve Jobs" },
    ],
  },

  {
    id: "q16",
    round: 2,
    order: 5,
    answer: "GOOGLE",
    acceptedAnswers: ["google", "Google", "GOOGLE"],
    clues: [
      { type: "text", content: "Alphabet" },
      { type: "text", content: "Search" },
      { type: "text", content: "Android" },
      { type: "text", content: "Chrome" },
    ],
  },

  {
    id: "q17",
    round: 2,
    order: 6,
    answer: "YOUTUBE",
    acceptedAnswers: ["youtube", "YouTube", "YOUTUBE", "you tube", "You Tube"],
    clues: [
      { type: "text", content: "2005" },
      { type: "text", content: "Subscribe" },
      { type: "text", content: "Creators" },
      { type: "text", content: "Video" },
    ],
  },

  {
    id: "q18",
    round: 2,
    order: 7,
    answer: "INSTAGRAM",
    acceptedAnswers: [
      "instagram",
      "Instagram",
      "INSTAGRAM",
      "insta",
      "Insta",
    ],
    clues: [
      { type: "text", content: "Kevin Systrom" },
      { type: "text", content: "Stories" },
      { type: "text", content: "Reels" },
      { type: "text", content: "Photos & followers" },
    ],
  },


  // ============================================================
  // ROUND 3 — THE CONNECTION
  // Medium difficulty.
  // ============================================================

  {
    id: "q5",
    round: 3,
    order: 1,
    answer: "ARIJIT SINGH",
    acceptedAnswers: [
      "arijit singh",
      "Arijit Singh",
      "ARIJIT SINGH",
      "arijit",
      "Arijit",
      "ARIJIT",
    ],
    clues: [
      { type: "text", content: "Murshidabad" },
      { type: "text", content: "Tum Hi Ho" },
      { type: "text", content: "Playback singer" },
      { type: "text", content: "Kesariya" },
    ],
  },

  {
    id: "q6",
    round: 3,
    order: 2,
    answer: "MOUNT EVEREST",
    acceptedAnswers: [
      "mount everest",
      "Mount Everest",
      "MOUNT EVEREST",
      "everest",
      "Everest",
      "EVEREST",
    ],
    clues: [
      { type: "text", content: "8,849 metres" },
      { type: "text", content: "Sagarmatha" },
      { type: "text", content: "Tenzing Norgay" },
      { type: "text", content: "Highest mountain on Earth" },
    ],
  },

  {
    id: "q19",
    round: 3,
    order: 3,
    answer: "VIRAT KOHLI",
    acceptedAnswers: [
      "virat kohli",
      "Virat Kohli",
      "VIRAT KOHLI",
      "virat",
      "Virat",
      "VIRAT",
    ],
    clues: [
      { type: "text", content: "18" },
      { type: "text", content: "Delhi" },
      { type: "text", content: "Cover Drive" },
      { type: "text", content: "King" },
    ],
  },

  {
    id: "q20",
    round: 3,
    order: 4,
    answer: "3 IDIOTS",
    acceptedAnswers: [
      "3 idiots",
      "3 Idiots",
      "3 IDIOTS",
      "three idiots",
      "Three Idiots",
      "THREE IDIOTS",
      "3idiots",
      "3-idiots",
    ],
    clues: [
      { type: "text", content: "Virus" },
      { type: "text", content: "Rancho" },
      { type: "text", content: "Engineering college" },
      { type: "text", content: "All Is Well" },
    ],
  },

  {
    id: "q21",
    round: 3,
    order: 5,
    answer: "FRIENDS",
    acceptedAnswers: ["friends", "Friends", "FRIENDS"],
    clues: [
      { type: "text", content: "1994" },
      { type: "text", content: "Six" },
      { type: "text", content: "Central Perk" },
      { type: "text", content: "New York" },
    ],
  },

  {
    id: "q22",
    round: 3,
    order: 6,
    answer: "UPI",
    acceptedAnswers: [
      "upi",
      "UPI",
      "Unified Payments Interface",
      "unified payments interface",
      "Unified Payment Interface",
      "unified payment interface",
    ],
    clues: [
      { type: "text", content: "NPCI" },
      { type: "text", content: "QR" },
      { type: "text", content: "Instant transfer" },
      { type: "text", content: "PhonePe" },
    ],
  },

  {
    id: "q23",
    round: 3,
    order: 7,
    answer: "PUSHPA",
    acceptedAnswers: [
      "pushpa",
      "Pushpa",
      "PUSHPA",
      "pushpa the rise",
      "Pushpa The Rise",
      "PUSHPA THE RISE",
    ],
    clues: [
      { type: "text", content: "Sandalwood" },
      { type: "text", content: "Red" },
      { type: "text", content: "Smuggling" },
      { type: "text", content: "Jhukega Nahi" },
    ],
  },


  // ============================================================
  // ROUND 4 — FINAL CONNECTION
  // Hardest round.
  // Clue 3 should still make the answer reasonably recognisable.
  // ============================================================

  {
    id: "q7",
    round: 4,
    order: 1,
    answer: "THE TAJ MAHAL",
    acceptedAnswers: [
      "the taj mahal",
      "The Taj Mahal",
      "THE TAJ MAHAL",
      "taj mahal",
      "Taj Mahal",
      "TAJ MAHAL",
    ],
    clues: [
      { type: "text", content: "1632" },
      { type: "text", content: "Agra" },
      { type: "text", content: "Mumtaz Mahal" },
      { type: "text", content: "White marble mausoleum" },
    ],
  },

  {
    id: "q24",
    round: 4,
    order: 2,
    answer: "ATIF ASLAM",
    acceptedAnswers: [
      "atif aslam",
      "Atif Aslam",
      "ATIF ASLAM",
      "atif",
      "Atif",
      "ATIF",
    ],
    clues: [
      { type: "text", content: "Wazirabad" },
      { type: "text", content: "Jal Pari" },
      { type: "text", content: "Tajdar-e-Haram" },
      { type: "text", content: "Tera Hone Laga Hoon" },
    ],
  },

  {
    id: "q25",
    round: 4,
    order: 3,
    answer: "CHANDRAYAAN",
    acceptedAnswers: [
      "chandrayaan",
      "Chandrayaan",
      "CHANDRAYAAN",
      "chandrayaan 3",
      "Chandrayaan 3",
      "CHANDRAYAAN 3",
      "chandrayaan-3",
      "Chandrayaan-3",
      "CHANDRAYAAN-3",
    ],
    clues: [
      { type: "text", content: "August 2023" },
      { type: "text", content: "ISRO" },
      { type: "text", content: "Moon" },
      { type: "text", content: "Lunar south pole landing" },
    ],
  },

  {
    id: "q26",
    round: 4,
    order: 4,
    answer: "SHERLOCK HOLMES",
    acceptedAnswers: [
      "sherlock holmes",
      "Sherlock Holmes",
      "SHERLOCK HOLMES",
      "sherlock",
      "Sherlock",
      "SHERLOCK",
    ],
    clues: [
      { type: "text", content: "Baker Street" },
      { type: "text", content: "221B" },
      { type: "text", content: "Watson" },
      { type: "text", content: "Detective" },
    ],
  },

  {
    id: "q27",
    round: 4,
    order: 5,
    answer: "THE OLYMPIC GAMES",
    acceptedAnswers: [
      "the olympic games",
      "The Olympic Games",
      "THE OLYMPIC GAMES",
      "olympic games",
      "Olympic Games",
      "OLYMPIC GAMES",
      "the olympics",
      "The Olympics",
      "THE OLYMPICS",
      "olympics",
      "Olympics",
      "OLYMPICS",
    ],
    clues: [
      { type: "text", content: "Ancient Olympia" },
      { type: "text", content: "Five rings" },
      { type: "text", content: "Torch relay" },
      { type: "text", content: "Every four years" },
    ],
  },

  {
    id: "q28",
    round: 4,
    order: 6,
    answer: "ELON MUSK",
    acceptedAnswers: [
      "elon musk",
      "Elon Musk",
      "ELON MUSK",
      "elon",
      "Elon",
      "ELON",
    ],
    clues: [
      { type: "text", content: "X Æ A-12" },
      { type: "text", content: "SpaceX" },
      { type: "text", content: "Tesla" },
      { type: "text", content: "Mars" },
    ],
  },

  {
    id: "q29",
    round: 4,
    order: 7,
    answer: "APPLE",
    acceptedAnswers: [
      "apple",
      "Apple",
      "APPLE",
      "apple inc",
      "Apple Inc",
      "Apple Inc.",
      "APPLE INC",
    ],
    clues: [
      { type: "text", content: "One Infinite Loop" },
      { type: "text", content: "Macintosh" },
      { type: "text", content: "iPhone" },
      { type: "text", content: "Steve Jobs" },
    ],
  },
];