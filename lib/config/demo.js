/** Practice demo — short 5×5 puzzle, no Firestore session. */
export const DEMO_CONFIG = {
  weekNumber: 0,
  label: "Practice Demo",
  imagePath: "/game-logo.png",
  seed: 8888,
  gridSize: 5,
  startsAt: null,
  endsAt: null,
  words: [
    {
      id: "d1",
      word: "CODE",
      clue: "Developers write me. Bugs fear me.",
      direction: "across",
      number: 1,
    },
    {
      id: "d2",
      word: "WORD",
      clue: "You hunt for me in the grid — I'm what you're looking for.",
      direction: "across",
      number: 2,
    },
    {
      id: "d3",
      word: "FIND",
      clue: "Drag across letters to do this when a clue clicks.",
      direction: "across",
      number: 3,
    },
    {
      id: "d4",
      word: "HUNT",
      clue: "What you're doing right now — searching the puzzle.",
      direction: "across",
      number: 4,
    },
  ],
};

export const DEMO_INTRO_IMAGE_DURATION_MS = 12_000;
