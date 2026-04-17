export const TOKENS = {
  ZERO: "0",
  ONE: "1",
  TWO: "2",
  THREE: "3",
  FOUR: "4",
  FIVE: "5",
  SIX: "6",
  SEVEN: "7",
  EIGHT: "8",
  NINE: "9",
  PLUS: "+",
  MINUS: "-"
} as const;

export type Token = typeof TOKENS[keyof typeof TOKENS];

export const KEYS = [
  TOKENS.ONE,
  TOKENS.TWO,
  TOKENS.THREE,
  TOKENS.FOUR,
  TOKENS.FIVE,
  TOKENS.SIX,
  TOKENS.SEVEN,
  TOKENS.EIGHT,
  TOKENS.NINE,
  TOKENS.MINUS,
  TOKENS.ZERO,
  TOKENS.PLUS
] as const;

export const GAME_MODES = {
  DAILY: "daily",
  HOURLY: "hourly",
  INFINITE: "infinite"
} as const;

export type GameMode = typeof GAME_MODES[keyof typeof GAME_MODES];

export const MODE_LABELS = {
  [GAME_MODES.DAILY]: "Daily",
  [GAME_MODES.HOURLY]: "Hourly",
  [GAME_MODES.INFINITE]: "Infinite"
} satisfies Record<GameMode, string>;

export const PUZZLE_SCHEDULE_START_YEAR = 2026;
export const PUZZLE_SCHEDULE_YEARS = 3;

export const CELLS = [
  "firstNumber0",
  "firstNumber1",
  "sign",
  "secondNumber0",
  "secondNumber1",
  "result0",
  "result1",
  "result2"
] as const;

export type CellKey = typeof CELLS[number];

export const COLORS = {
  GREEN: "green",
  BROWN: "brown",
  GRAY: "gray",
  WHITE: "white"
} as const;

export type CellColor = typeof COLORS[keyof typeof COLORS];

export const POPUP = {
  NONE: "none",
  SETTINGS: "settings",
  HELP: "help",
  FAILURE: "failure",
  SUCCESS: "success"
} as const;

export type PopupType = typeof POPUP[keyof typeof POPUP];

export type GameRow = {
  rowNumber: number;
} & Record<CellKey, Token | null>;

export type GameState = {
  gameId: string;
  rows: GameRow[];
  guessed: boolean;
  numberOfGuesses: number;
  activeRow: number;
  activeCell: number;
};

export type Settings = {
  enableColorBlind: boolean;
  enableDarkMode: boolean;
  firstExplanation: boolean;
  language: string | null;
};

export type Puzzle = {
  mode: GameMode;
  puzzleId: string;
  label: string;
  shareLabel: string;
  solution: GameRow;
};

export const DEFAULT_SETTINGS: Settings = {
  enableColorBlind: false,
  enableDarkMode: true,
  firstExplanation: true,
  language: null
};

let puzzleBank: GameRow[] | null = null;
let dailySchedule: number[] | null = null;
let hourlySchedule: number[] | null = null;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function digits(value: number, size: number): string[] {
  return String(value).padStart(size, "0").split("");
}

function makeRow({
  rowNumber = 0,
  leftDigits,
  operator,
  rightDigits,
  result
}: {
  rowNumber?: number;
  leftDigits: string[];
  operator: Token;
  rightDigits: string[];
  result: number;
}): GameRow {
  const answer = digits(result, 3);

  if (leftDigits.length === 1) {
    const right = digits(Number(rightDigits.join("")), 3);
    return {
      rowNumber,
      firstNumber0: leftDigits[0] as Token,
      firstNumber1: operator,
      sign: right[0] as Token,
      secondNumber0: right[1] as Token,
      secondNumber1: right[2] as Token,
      result0: answer[0] as Token,
      result1: answer[1] as Token,
      result2: answer[2] as Token
    };
  }

  if (leftDigits.length === 2) {
    const right = digits(Number(rightDigits.join("")), 2);
    return {
      rowNumber,
      firstNumber0: leftDigits[0] as Token,
      firstNumber1: leftDigits[1] as Token,
      sign: operator,
      secondNumber0: right[0] as Token,
      secondNumber1: right[1] as Token,
      result0: answer[0] as Token,
      result1: answer[1] as Token,
      result2: answer[2] as Token
    };
  }

  return {
    rowNumber,
    firstNumber0: leftDigits[0] as Token,
    firstNumber1: leftDigits[1] as Token,
    sign: leftDigits[2] as Token,
    secondNumber0: operator,
    secondNumber1: rightDigits[0] as Token,
    result0: answer[0] as Token,
    result1: answer[1] as Token,
    result2: answer[2] as Token
  };
}

function addPuzzle(bank: GameRow[], left: number, operator: Token, right: number) {
  const result = operator === TOKENS.PLUS ? left + right : left - right;
  if (result <= 0 || result > 999) return;

  bank.push(makeRow({
    leftDigits: String(left).split(""),
    operator,
    rightDigits: String(right).split(""),
    result
  }));
}

export function buildPuzzleBank(): GameRow[] {
  if (puzzleBank) return puzzleBank;

  const bank: GameRow[] = [];

  for (let left = 1; left <= 9; left += 1) {
    for (let right = 100; right <= 999; right += 1) {
      addPuzzle(bank, left, TOKENS.PLUS, right);
      addPuzzle(bank, left, TOKENS.MINUS, right);
    }
  }

  for (let left = 10; left <= 99; left += 1) {
    for (let right = 10; right <= 99; right += 1) {
      addPuzzle(bank, left, TOKENS.PLUS, right);
      addPuzzle(bank, left, TOKENS.MINUS, right);
    }
  }

  for (let left = 100; left <= 999; left += 1) {
    for (let right = 1; right <= 9; right += 1) {
      addPuzzle(bank, left, TOKENS.PLUS, right);
      addPuzzle(bank, left, TOKENS.MINUS, right);
    }
  }

  puzzleBank = bank;
  return puzzleBank;
}

function scheduleStartDayNumber(): number {
  return Math.floor(Date.UTC(PUZZLE_SCHEDULE_START_YEAR, 0, 1) / MILLISECONDS_PER_DAY);
}

function scheduleEndDayNumber(): number {
  return Math.floor(Date.UTC(PUZZLE_SCHEDULE_START_YEAR + PUZZLE_SCHEDULE_YEARS, 0, 1) / MILLISECONDS_PER_DAY);
}

export function puzzleScheduleDays(): number {
  return scheduleEndDayNumber() - scheduleStartDayNumber();
}

export function puzzleScheduleHours(): number {
  return puzzleScheduleDays() * 24;
}

function positiveModulo(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function localDayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY);
}

function seededRandom(seed: string): (max: number) => number {
  let state = hashString(seed) || 1;

  return function randomInt(max) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % max;
  };
}

function buildPuzzleSchedule(count: number, seed: string): number[] {
  const bank = buildPuzzleBank();
  if (count > bank.length) {
    throw new Error(`Puzzle bank has ${bank.length} entries, but ${count} unique puzzles were requested.`);
  }

  const randomInt = seededRandom(seed);
  const indexes = bank.map((_, index) => index);
  const schedule: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const swapIndex = index + randomInt(indexes.length - index);
    const selected = indexes[swapIndex];
    indexes[swapIndex] = indexes[index];
    indexes[index] = selected;
    schedule.push(selected);
  }

  return schedule;
}

export function buildDailySchedule(): number[] {
  if (!dailySchedule) {
    dailySchedule = buildPuzzleSchedule(
      puzzleScheduleDays(),
      `daily-${PUZZLE_SCHEDULE_START_YEAR}-${PUZZLE_SCHEDULE_YEARS}`
    );
  }

  return dailySchedule;
}

export function buildHourlySchedule(): number[] {
  if (!hourlySchedule) {
    hourlySchedule = buildPuzzleSchedule(
      puzzleScheduleHours(),
      `hourly-${PUZZLE_SCHEDULE_START_YEAR}-${PUZZLE_SCHEDULE_YEARS}`
    );
  }

  return hourlySchedule;
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function localDateParts(date = new Date()): { year: number; month: string; day: string; hour: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return { year, month, day, hour };
}

export function dateKey(date = new Date()): string {
  const { year, month, day } = localDateParts(date);
  return `${year}-${month}-${day}`;
}

export function hourKey(date = new Date()): string {
  const { year, month, day, hour } = localDateParts(date);
  return `${year}-${month}-${day}-${hour}`;
}

function dailyScheduleOffset(date = new Date()): number {
  return positiveModulo(localDayNumber(date) - scheduleStartDayNumber(), puzzleScheduleDays());
}

function hourlyScheduleOffset(date = new Date()): number {
  return dailyScheduleOffset(date) * 24 + date.getHours();
}

export function createInfiniteSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPuzzleForMode(mode: GameMode = GAME_MODES.DAILY, infiniteSeed = ""): Puzzle {
  const normalizedMode = (Object.values(GAME_MODES) as string[]).includes(mode) ? mode : GAME_MODES.DAILY;
  const bank = buildPuzzleBank();
  const key = normalizedMode === GAME_MODES.HOURLY
    ? hourKey()
    : normalizedMode === GAME_MODES.INFINITE
      ? infiniteSeed || "infinite"
      : dateKey();
  const index = normalizedMode === GAME_MODES.HOURLY
    ? buildHourlySchedule()[hourlyScheduleOffset()]
    : normalizedMode === GAME_MODES.DAILY
      ? buildDailySchedule()[dailyScheduleOffset()]
      : hashString(`${normalizedMode}:${key}`) % bank.length;
  const solution = { ...bank[index], rowNumber: 0 };
  const shortKey = normalizedMode === GAME_MODES.INFINITE ? hashString(key).toString(36).toUpperCase() : key;

  return {
    mode: normalizedMode,
    puzzleId: `${normalizedMode}-${shortKey}`,
    label: `${MODE_LABELS[normalizedMode]} ${shortKey}`,
    shareLabel: `Mathle ${MODE_LABELS[normalizedMode]} ${shortKey}`,
    solution
  };
}

export function createEmptyRow(rowNumber: number): GameRow {
  return {
    rowNumber,
    firstNumber0: null,
    firstNumber1: null,
    sign: null,
    secondNumber0: null,
    secondNumber1: null,
    result0: null,
    result1: null,
    result2: null
  };
}

export function createInitialGameState(gameId: string): GameState {
  return {
    gameId,
    rows: [0, 1, 2, 3, 4].map(createEmptyRow),
    guessed: false,
    numberOfGuesses: 2,
    activeRow: 0,
    activeCell: 0
  };
}

export function isSign(value: Token | null | string): value is typeof TOKENS.PLUS | typeof TOKENS.MINUS {
  return value === TOKENS.PLUS || value === TOKENS.MINUS;
}

export function tokenValue(value: Token | null): number {
  if (value == null || isSign(value)) return 0;
  return Number(value);
}

export function rowTokens(row: GameRow): Array<Token | null> {
  return CELLS.map((cell) => row[cell]);
}

export function visibleEquation(row: GameRow): string {
  return rowTokens(row)
    .map((value, index) => {
      if (value == null) return "";
      const rendered = isSign(value) ? ` ${value} ` : value;
      return index === 5 ? ` = ${rendered}` : rendered;
    })
    .join("");
}

export function rowsEqual(a: GameRow | undefined, b: GameRow | undefined): boolean {
  return CELLS.every((cell) => a?.[cell] === b?.[cell]);
}

export function setCell(row: GameRow, index: number, value: Token | null): GameRow {
  return {
    ...row,
    [CELLS[index]]: value
  };
}

export function isValidEquation(row: GameRow): boolean {
  const complete = CELLS.every((cell) => row[cell] != null);
  const fixedEdges = !isSign(row.firstNumber0) && !isSign(row.secondNumber1);

  if (!complete || !fixedEdges) return false;

  let operator: Token | null = null;
  let left = 0;
  let right = 0;

  if (isSign(row.firstNumber1)) {
    operator = row.firstNumber1;
    left = tokenValue(row.firstNumber0);
    right = 100 * tokenValue(row.sign) + 10 * tokenValue(row.secondNumber0) + tokenValue(row.secondNumber1);
  } else if (isSign(row.sign)) {
    operator = row.sign;
    left = 10 * tokenValue(row.firstNumber0) + tokenValue(row.firstNumber1);
    right = 10 * tokenValue(row.secondNumber0) + tokenValue(row.secondNumber1);
  } else if (isSign(row.secondNumber0)) {
    operator = row.secondNumber0;
    left = 100 * tokenValue(row.firstNumber0) + 10 * tokenValue(row.firstNumber1) + tokenValue(row.sign);
    right = tokenValue(row.secondNumber1);
  } else {
    return false;
  }

  const result = 100 * tokenValue(row.result0) + 10 * tokenValue(row.result1) + tokenValue(row.result2);
  return operator === TOKENS.PLUS ? left + right === result : left - right === result;
}

export function scoreGuess(guess: GameRow, solution: GameRow): CellColor[] {
  const guessValues = rowTokens(guess);
  const solutionValues = rowTokens(solution);
  const remaining: Array<Token | null | undefined> = [...solutionValues];
  const result = new Array(CELLS.length).fill(COLORS.WHITE);

  guessValues.forEach((value, index) => {
    if (value != null && value === solutionValues[index]) {
      result[index] = COLORS.GREEN;
      remaining[index] = undefined;
    }
  });

  guessValues.forEach((value, index) => {
    if (value == null || result[index] === COLORS.GREEN) return;

    const foundIndex = remaining.lastIndexOf(value);
    if (foundIndex >= 0) {
      result[index] = COLORS.BROWN;
      remaining[foundIndex] = undefined;
    } else {
      result[index] = COLORS.GRAY;
    }
  });

  return result;
}

export function scoreToEmoji(colors: CellColor[], colorBlind: boolean): string {
  return colors.map((color) => {
    if (color === COLORS.GREEN) return colorBlind ? "🟧" : "🟩";
    if (color === COLORS.BROWN) return colorBlind ? "🟦" : "🟨";
    if (color === COLORS.GRAY) return "⬜";
    return "";
  }).join("");
}

export function shareFailureText(rows: GameRow[], solution: GameRow, colorBlind: boolean, puzzleLabel = "Mathle"): string {
  const board = rows.map((row) => scoreToEmoji(scoreGuess(row, solution), colorBlind)).join("\n");
  return `${puzzleLabel} 5/5\n${board}\n\nmathlegame.com`;
}

export function shareSuccessText(rows: GameRow[], numberOfGuesses: number, colorBlind: boolean, puzzleLabel = "Mathle"): string {
  const finalGuess = rows[numberOfGuesses - 1];
  const board = rows
    .slice(0, numberOfGuesses)
    .map((row) => scoreToEmoji(scoreGuess(row, finalGuess), colorBlind))
    .join("\n");

  return `${puzzleLabel} ${numberOfGuesses}/5\n${board}\n\nmathlegame.com`;
}

export function secondsToTomorrow(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime() - now.getTime();
}

export function millisecondsToNextHour(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0).getTime() - now.getTime();
}

export function millisecondsToNextPuzzle(mode: GameMode): number | null {
  if (mode === GAME_MODES.HOURLY) return millisecondsToNextHour();
  if (mode === GAME_MODES.INFINITE) return null;
  return secondsToTomorrow();
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
