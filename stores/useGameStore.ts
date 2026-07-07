"use client";

import { create } from "zustand";
import {
  INTRO_IMAGE_DURATION_MS,
  getActiveWeek,
  getActiveWeekNumber,
  getWeekConfig,
} from "@/lib/config/puzzle";
import { resolveQuestionOrder } from "@/lib/game/question-order";
import { calculateScore } from "@/lib/game/scoring";
import {
  cellKey,
  findMatchingWord,
  generateWordSearch,
  getSelectedWord,
  isValidSelection,
  selectionFromAnchor,
} from "@/lib/game/word-search";
import {
  createGameSession,
  getWeekSessionStatus,
  saveGameSession,
} from "@/lib/firebase/sessions";
import type {
  CellPosition,
  GamePhase,
  PlayStatus,
  PlacedWord,
  PopupSession,
  SubmittedAnswer,
} from "@/types/game";
import type { GameSession } from "@/types/session";

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let introTimer: ReturnType<typeof setTimeout> | null = null;
let popupTimer: ReturnType<typeof setTimeout> | null = null;
let gameTimerInterval: ReturnType<typeof setInterval> | null = null;
let initInFlight: string | null = null;

function loadPuzzleForWeek(weekNumber: number) {
  const config = getWeekConfig(weekNumber) ?? getActiveWeek();
  const { grid, placedWords } = generateWordSearch(
    config.words,
    config.gridSize,
    config.seed
  );

  return {
    weekNumber: config.weekNumber,
    imagePath: config.imagePath,
    grid,
    placedWords,
  };
}

function clearGameTimers() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  if (introTimer) clearTimeout(introTimer);
  if (popupTimer) clearTimeout(popupTimer);
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  autosaveTimer = introTimer = popupTimer = gameTimerInterval = null;
}

function scheduleAutosave(getState: () => GameState) {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    void getState().persistSession();
  }, 800);
}

function buildFoundCellKeys(
  placedWords: PlacedWord[],
  foundWordIds: string[]
): Set<string> {
  const foundCellKeys = new Set<string>();

  for (const wordId of foundWordIds) {
    const placed = placedWords.find((w) => w.id === wordId);
    if (placed) {
      for (let i = 0; i < placed.word.length; i++) {
        foundCellKeys.add(
          cellKey(
            placed.startRow + placed.dy * i,
            placed.startCol + placed.dx * i
          )
        );
      }
    }
  }

  return foundCellKeys;
}

function sessionToStoreFields(
  sessionId: string,
  session: GameSession,
  placedWords: PlacedWord[]
) {
  const foundWordIds = session.foundWordIds ?? [];
  const foundCellKeys = buildFoundCellKeys(placedWords, foundWordIds);

  return {
    sessionId,
    uid: session.uid,
    weekNumber: session.weekNumber ?? 1,
    foundWordIds,
    foundCellKeys,
    initialImageViewDuration: session.initialImageViewDuration,
    introStartedAt: session.startedAt,
    introEndedAt: session.gameStartedAt,
    gameStartedAt: session.gameStartedAt,
    elapsedMs: session.gameStartedAt
      ? (session.gameEndedAt ?? session.completionTime ?? Date.now()) -
        session.gameStartedAt
      : 0,
    hintUsed: session.hintUsed,
    hintClickCount: session.hintClickCount,
    hintFirstClickedAt: session.hintFirstClickedAt,
    hintLastClickedAt: session.hintLastClickedAt,
    popupOpenCount: session.popupOpenCount,
    popupSessions: session.popupSessions,
    totalImageViewTime: session.totalImageViewTime,
    firstPopupOpenedAt: session.popupSessions[0]?.openedAt ?? null,
    lastPopupOpenedAt:
      session.popupSessions[session.popupSessions.length - 1]?.openedAt ?? null,
    submittedAnswers: session.submittedAnswers,
    score: session.score,
    completionTime: session.completionTime,
    completedAt: session.completedAt,
    currentSelection: [] as CellPosition[],
    isDragging: false,
    showHintModal: false,
    showImageModal: false,
    currentPopupOpenedAt: null as number | null,
  };
}

interface GameState {
  sessionId: string | null;
  uid: string | null;
  weekNumber: number;
  imagePath: string;
  phase: GamePhase;
  playStatus: PlayStatus;
  grid: string[][];
  placedWords: PlacedWord[];
  questionOrder: string[];
  foundWordIds: string[];
  foundCellKeys: Set<string>;
  currentSelection: CellPosition[];
  isDragging: boolean;

  introStartedAt: number | null;
  introEndedAt: number | null;
  initialImageViewDuration: number;

  gameStartedAt: number | null;
  elapsedMs: number;

  hintUsed: boolean;
  hintClickCount: number;
  hintFirstClickedAt: number | null;
  hintLastClickedAt: number | null;
  showHintModal: boolean;

  showImageModal: boolean;
  popupOpenCount: number;
  popupSessions: PopupSession[];
  currentPopupOpenedAt: number | null;
  totalImageViewTime: number;
  firstPopupOpenedAt: number | null;
  lastPopupOpenedAt: number | null;

  submittedAnswers: SubmittedAnswer[];
  score: number | null;
  completionTime: number | null;
  completedAt: number | null;

  loading: boolean;
  persisting: boolean;
  submitting: boolean;
  error: string | null;

  initSession: (uid: string) => Promise<void>;
  startIntro: () => void;
  skipIntro: () => void;
  finishIntro: (skipped?: boolean) => void;
  startGameTimer: () => void;

  startSelection: (row: number, col: number) => void;
  extendSelection: (row: number, col: number) => void;
  endSelection: () => void;
  clearSelection: () => void;

  openHintModal: () => void;
  closeHintModal: () => void;

  openImageModal: () => void;
  closeImageModal: (manual?: boolean) => void;

  submitAnswers: () => Promise<void>;
  persistSession: () => Promise<void>;
  resetError: () => void;
}

function createInitialState(weekNumber = getActiveWeekNumber()) {
  const puzzle = loadPuzzleForWeek(weekNumber);
  return {
    sessionId: null,
    uid: null,
    weekNumber: puzzle.weekNumber,
    imagePath: puzzle.imagePath,
    phase: "intro" as GamePhase,
    playStatus: "idle" as PlayStatus,
    grid: puzzle.grid,
    placedWords: puzzle.placedWords,
    questionOrder: [],
    foundWordIds: [],
    foundCellKeys: new Set<string>(),
    currentSelection: [],
    isDragging: false,

    introStartedAt: null,
    introEndedAt: null,
    initialImageViewDuration: 0,

    gameStartedAt: null,
    elapsedMs: 0,

    hintUsed: false,
    hintClickCount: 0,
    hintFirstClickedAt: null,
    hintLastClickedAt: null,
    showHintModal: false,

    showImageModal: false,
    popupOpenCount: 0,
    popupSessions: [],
    currentPopupOpenedAt: null,
    totalImageViewTime: 0,
    firstPopupOpenedAt: null,
    lastPopupOpenedAt: null,

    submittedAnswers: [],
    score: null,
    completionTime: null,
    completedAt: null,

    loading: false,
    persisting: false,
    submitting: false,
    error: null,
  };
}

function applySessionToStore(
  id: string,
  session: GameSession,
  extra: Partial<GameState> = {}
) {
  const weekNumber = session.weekNumber ?? getActiveWeekNumber();
  const puzzle = loadPuzzleForWeek(weekNumber);
  const wordIds = puzzle.placedWords.map((word) => word.id);
  const questionOrder = resolveQuestionOrder(
    wordIds,
    session.uid,
    weekNumber,
    session.questionOrder
  );

  return {
    ...puzzle,
    questionOrder,
    ...sessionToStoreFields(id, session, puzzle.placedWords),
    ...extra,
  };
}

export function resetGameStore() {
  clearGameTimers();
  initInFlight = null;
  useGameStore.setState(createInitialState());
}

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),

  initSession: async (uid) => {
    if (get().uid !== uid) {
      resetGameStore();
    }

    if (initInFlight === uid) {
      return;
    }

    initInFlight = uid;
    set({ loading: true, error: null, uid, playStatus: "loading" });

    try {
      const status = await getWeekSessionStatus(uid);

      if (status.alreadyPlayed && status.completedSession) {
        const { id, session } = status.completedSession;
        set(
          applySessionToStore(id, session, {
            phase: "submitted",
            playStatus: "already_played",
            loading: false,
          })
        );
        return;
      }

      if (status.activeSession) {
        const { id, session } = status.activeSession;
        const phase: GamePhase = session.gameStartedAt ? "playing" : "intro";

        set(
          applySessionToStore(id, session, {
            phase,
            playStatus: "ready",
            loading: false,
          })
        );

        if (!session.gameStartedAt) {
          get().startIntro();
        } else {
          get().startGameTimer();
        }
        return;
      }

      const activeWeek = getActiveWeekNumber();
      const puzzle = loadPuzzleForWeek(activeWeek);
      const wordIds = puzzle.placedWords.map((word) => word.id);
      const questionOrder = resolveQuestionOrder(wordIds, uid, activeWeek);
      const created = await createGameSession(uid);
      set({
        ...puzzle,
        questionOrder,
        sessionId: created.id,
        uid,
        phase: "intro",
        playStatus: "ready",
        loading: false,
      });
      get().startIntro();
    } catch (error) {
      console.error("initSession failed:", error);

      const completedSession = (
        error as Error & {
          completedSession?: { id: string; session: GameSession };
        }
      ).completedSession;

      if (completedSession) {
        const { id, session } = completedSession;
        set(
          applySessionToStore(id, session, {
            phase: "submitted",
            playStatus: "already_played",
            loading: false,
            error: null,
          })
        );
        return;
      }

      set({
        error: "Failed to load game session. Please refresh and try again.",
        playStatus: "error",
        loading: false,
      });
    } finally {
      initInFlight = null;
    }
  },

  startIntro: () => {
    if (get().playStatus === "already_played") return;

    const now = Date.now();
    set({ introStartedAt: now, phase: "intro" });

    if (introTimer) clearTimeout(introTimer);
    introTimer = setTimeout(() => {
      get().finishIntro();
    }, INTRO_IMAGE_DURATION_MS);

    scheduleAutosave(get);
  },

  skipIntro: () => {
    if (get().playStatus === "already_played") return;
    if (introTimer) clearTimeout(introTimer);
    get().finishIntro(true);
  },

  finishIntro: (skipped = false) => {
    if (get().playStatus === "already_played") return;

    const { introStartedAt } = get();
    const now = Date.now();
    const duration = introStartedAt
      ? now - introStartedAt
      : INTRO_IMAGE_DURATION_MS;

    set({
      phase: "playing",
      introEndedAt: now,
      initialImageViewDuration: duration,
      totalImageViewTime: get().totalImageViewTime + duration,
    });

    get().startGameTimer();
    scheduleAutosave(get);
  },

  startGameTimer: () => {
    if (get().playStatus === "already_played") return;

    const { gameStartedAt } = get();
    if (!gameStartedAt) {
      set({ gameStartedAt: Date.now() });
    }

    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
      const { gameStartedAt: start, phase } = get();
      if (!start || phase !== "playing") return;
      set({ elapsedMs: Date.now() - start });
    }, 1000);
  },

  startSelection: (row, col) => {
    if (get().phase !== "playing") return;
    set({
      isDragging: true,
      currentSelection: [{ row, col }],
    });
  },

  extendSelection: (row, col) => {
    const { isDragging, currentSelection, phase } = get();
    if (!isDragging || phase !== "playing" || currentSelection.length === 0) {
      return;
    }

    const start = currentSelection[0];
    const line = selectionFromAnchor(start, { row, col });
    if (line) {
      set({ currentSelection: line });
    }
  },

  endSelection: () => {
    const { currentSelection, placedWords, grid, foundWordIds, foundCellKeys } =
      get();
    set({ isDragging: false });

    if (!isValidSelection(currentSelection)) {
      set({ currentSelection: [] });
      return;
    }

    const selectedText = getSelectedWord(grid, currentSelection);
    const match = findMatchingWord(placedWords, currentSelection, selectedText);

    if (match && !foundWordIds.includes(match.id)) {
      const newFoundIds = [...foundWordIds, match.id];
      const newCellKeys = new Set(foundCellKeys);
      for (let i = 0; i < match.word.length; i++) {
        newCellKeys.add(
          cellKey(match.startRow + match.dy * i, match.startCol + match.dx * i)
        );
      }
      set({
        foundWordIds: newFoundIds,
        foundCellKeys: newCellKeys,
        currentSelection: [],
      });
      scheduleAutosave(get);
    } else {
      set({ currentSelection: [] });
    }
  },

  clearSelection: () => {
    set({ currentSelection: [], isDragging: false });
  },

  openHintModal: () => {
    const now = Date.now();
    const { hintClickCount, hintFirstClickedAt } = get();

    set({
      hintUsed: true,
      hintClickCount: hintClickCount + 1,
      hintFirstClickedAt: hintFirstClickedAt ?? now,
      hintLastClickedAt: now,
    });

    get().openImageModal();
  },

  closeHintModal: () => {
    set({ showHintModal: false });
  },

  openImageModal: () => {
    const now = Date.now();
    const { popupOpenCount, firstPopupOpenedAt } = get();

    set({
      showImageModal: true,
      popupOpenCount: popupOpenCount + 1,
      currentPopupOpenedAt: now,
      firstPopupOpenedAt: firstPopupOpenedAt ?? now,
      lastPopupOpenedAt: now,
    });

    scheduleAutosave(get);
  },

  closeImageModal: () => {
    const {
      showImageModal,
      currentPopupOpenedAt,
      popupSessions,
      totalImageViewTime,
    } = get();

    if (!showImageModal || !currentPopupOpenedAt) {
      set({ showImageModal: false });
      return;
    }

    if (popupTimer) clearTimeout(popupTimer);

    const now = Date.now();
    const duration = now - currentPopupOpenedAt;
    const session: PopupSession = {
      openedAt: currentPopupOpenedAt,
      closedAt: now,
      duration,
    };

    set({
      showImageModal: false,
      currentPopupOpenedAt: null,
      popupSessions: [...popupSessions, session],
      totalImageViewTime: totalImageViewTime + duration,
    });

    scheduleAutosave(get);
  },

  submitAnswers: async () => {
    const {
      sessionId,
      placedWords,
      foundWordIds,
      gameStartedAt,
      popupOpenCount,
      playStatus,
      phase,
      submitting,
    } = get();

    if (
      !sessionId ||
      playStatus === "already_played" ||
      phase === "submitted" ||
      submitting
    ) {
      return;
    }

    set({ submitting: true });

    const now = Date.now();
    const completionTime = gameStartedAt ? now - gameStartedAt : 0;

    const submittedAnswers: SubmittedAnswer[] = placedWords.map((word) => ({
      wordId: word.id,
      answer: word.word,
      correct: foundWordIds.includes(word.id),
    }));

    const correctAnswers = submittedAnswers.filter((a) => a.correct).length;
    const score = calculateScore(correctAnswers, popupOpenCount);

    if (gameTimerInterval) clearInterval(gameTimerInterval);

    set({
      phase: "submitted",
      submittedAnswers,
      score,
      completionTime,
      completedAt: now,
      elapsedMs: completionTime,
    });

    try {
      await get().persistSession();
    } finally {
      set({ submitting: false });
    }
  },

  persistSession: async () => {
    const state = get();
    if (!state.sessionId) return;

    set({ persisting: true });
    try {
      await saveGameSession(state.sessionId, {
        uid: state.uid!,
        weekNumber: state.weekNumber,
        startedAt: state.introStartedAt ?? Date.now(),
        completedAt: state.completedAt,
        initialImageViewDuration: state.initialImageViewDuration,
        popupOpenCount: state.popupOpenCount,
        popupSessions: state.popupSessions,
        totalImageViewTime: state.totalImageViewTime,
        hintUsed: state.hintUsed,
        hintClickCount: state.hintClickCount,
        hintFirstClickedAt: state.hintFirstClickedAt,
        hintLastClickedAt: state.hintLastClickedAt,
        gameStartedAt: state.gameStartedAt,
        gameEndedAt: state.completedAt,
        completionTime: state.completionTime,
        correctAnswers: state.foundWordIds.length,
        score: state.score,
        submittedAnswers: state.submittedAnswers,
        foundWordIds: state.foundWordIds,
        questionOrder: state.questionOrder,
      });
    } catch {
      set({ error: "Failed to save progress." });
    } finally {
      set({ persisting: false });
    }
  },

  resetError: () => set({ error: null }),
}));

export function getSelectedCellKeys(selection: CellPosition[]): Set<string> {
  return new Set(selection.map(({ row, col }) => cellKey(row, col)));
}
