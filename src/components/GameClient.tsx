"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import {
  CELLS,
  COLORS,
  DEFAULT_SETTINGS,
  GAME_MODES,
  KEYS,
  MODE_LABELS,
  POPUP,
  createEmptyRow,
  createInfiniteSeed,
  createInitialGameState,
  formatDuration,
  getPuzzleForMode,
  isSign,
  isValidEquation,
  millisecondsToNextPuzzle,
  rowsEqual,
  scoreGuess,
  setCell,
  shareFailureText,
  shareSuccessText,
  visibleEquation
} from "../lib/game";
import type { CellColor, CellKey, GameMode, GameRow, GameState, Puzzle, Settings, Token } from "../lib/game";
import useLocalStorageState from "../lib/useLocalStorageState";

type GameStates = Record<string, GameState>;
type InfiniteState = {
  infiniteSeed: string;
};

function colorClass(color: CellColor, colorBlind: boolean) {
  if (colorBlind) {
    if (color === COLORS.GREEN) return "bg-custom-yellow";
    if (color === COLORS.BROWN) return "bg-custom-blue";
  } else {
    if (color === COLORS.GREEN) return "bg-green-300";
    if (color === COLORS.BROWN) return "bg-amber-400";
  }

  if (color === COLORS.GRAY) return "bg-gray-400";
  return "";
}

function Modal({ children, onClose }: Readonly<{ children: ReactNode; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div className="modal-panel relative inline-block w-full max-w-md overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Countdown({ mode }: Readonly<{ mode: GameMode }>) {
  const countdown = millisecondsToNextPuzzle(mode);
  const [remaining, setRemaining] = useState(() => countdown == null ? null : formatDuration(countdown));

  useEffect(() => {
    if (mode === GAME_MODES.INFINITE) {
      setRemaining(null);
      return undefined;
    }

    const timer = setInterval(() => {
      const nextCountdown = millisecondsToNextPuzzle(mode);
      setRemaining(nextCountdown == null ? null : formatDuration(nextCountdown));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode]);

  if (mode === GAME_MODES.INFINITE) {
    return (
      <div className="text-lg">
        <FormattedMessage id="next.infinite" />
      </div>
    );
  }

  return (
    <div className="text-lg">
      <FormattedMessage id={mode === GAME_MODES.HOURLY ? "next.hourly" : "next.mathle"} />{" "}
      <span className="px-1 font-semibold text-blue-800">{remaining}</span>
    </div>
  );
}

function Cell({
  row,
  cell,
  active,
  guessed,
  color,
  settings
}: Readonly<{
  row: GameRow;
  cell: CellKey;
  active: boolean;
  guessed: boolean;
  color: CellColor;
  settings: Settings;
}>) {
  const value = row[cell] ?? "";
  const guessedClass = guessed ? colorClass(color, settings.enableColorBlind) : "";
  const backgroundClass = guessedClass || "bg-white";

  return (
    <div
      className={`mathle-cell flex h-10 items-center justify-center border border-slate-300 ${active ? "border-blue-300" : ""} ${backgroundClass}`}
    >
      {value}
    </div>
  );
}

function GuessRow({
  row,
  activeRow,
  solution,
  settings
}: Readonly<{
  row: GameRow;
  activeRow: number;
  solution: GameRow;
  settings: Settings;
}>) {
  const guessed = row.rowNumber < activeRow;
  const active = row.rowNumber === activeRow;
  const score = scoreGuess(row, solution);

  return (
    <>
      {CELLS.slice(0, 5).map((cell, index) => (
        <Cell
          key={cell}
          row={row}
          cell={cell}
          active={active}
          guessed={guessed}
          color={score[index]}
          settings={settings}
        />
      ))}
      <div className="flex items-center justify-center text-sm">=</div>
      {CELLS.slice(5).map((cell, offset) => (
        <Cell
          key={cell}
          row={row}
          cell={cell}
          active={active}
          guessed={guessed}
          color={score[offset + 5]}
          settings={settings}
        />
      ))}
    </>
  );
}

function Keypad({
  disabledTokens,
  hasSign,
  canEnter,
  canDelete,
  onNumber,
  onEnter,
  onDelete,
  onHelp
}: Readonly<{
  disabledTokens: Set<Token>;
  hasSign: boolean;
  canEnter: boolean;
  canDelete: boolean;
  onNumber: (token: Token) => void;
  onEnter: () => void;
  onDelete: () => void;
  onHelp: () => void;
}>) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key;
      if ((KEYS as readonly string[]).includes(key)) {
        onNumber(key as Token);
      } else if ((key === "Delete" || key === "Backspace") && canDelete) {
        onDelete();
      } else if (key === "Enter" && canEnter) {
        onEnter();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canDelete, canEnter, onDelete, onEnter, onNumber]);

  const keyClass = "flex min-h-[42px] items-center justify-center rounded p-2 font-bold text-blue-900";

  return (
    <div className="game-control grid grid-cols-3 text-xl" style={{ gap: "8px" }}>
      {KEYS.map((key) => {
        const disabled = disabledTokens.has(key) || (isSign(key) && hasSign);
        return (
          <button
            key={key}
            type="button"
            aria-disabled={disabled}
            className={`${keyClass} ${disabled ? "cursor-not-allowed bg-gray-300 text-black" : "cursor-pointer bg-blue-100 active:bg-blue-300"}`}
            onClick={() => onNumber(key)}
          >
            {key}
          </button>
        );
      })}
      <button type="button" className={`${keyClass} border border-blue-200 active:bg-blue-300`} onClick={onHelp}>
        ?
      </button>
      <button
        type="button"
        disabled={!canEnter}
        className={`${keyClass} ${canEnter ? "bg-blue-100 active:bg-blue-300" : "bg-gray-300 text-black"}`}
        onClick={onEnter}
      >
        Enter
      </button>
      <button
        type="button"
        disabled={!canDelete}
        className={`${keyClass} ${canDelete ? "bg-blue-100 active:bg-blue-300" : "bg-gray-300 text-black"}`}
        onClick={onDelete}
      >
        DEL
      </button>
    </div>
  );
}

function HelpIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.75 9.4a2.35 2.35 0 0 1 2.35-2.05c1.38 0 2.45.86 2.45 2.1 0 1.02-.58 1.61-1.55 2.25-.8.53-1.13.92-1.13 1.8v.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M12 16.75h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
      />
    </svg>
  );
}

function SettingsToggle({
  titleId,
  descriptionId,
  checked,
  onToggle
}: Readonly<{
  titleId: string;
  descriptionId: string;
  checked: boolean;
  onToggle: () => void;
}>) {
  return (
    <div className="settings-row">
      <div>
        <h2 className="font-semibold text-gray-900"><FormattedMessage id={titleId} /></h2>
        <p className="text-sm text-gray-600"><FormattedMessage id={descriptionId} /></p>
      </div>
      <button
        type="button"
        className={`settings-toggle ${checked ? "settings-toggle-on" : ""}`}
        aria-pressed={checked}
        onClick={onToggle}
      >
        <span className={`settings-toggle-thumb ${checked ? "settings-toggle-thumb-on" : ""}`} />
      </button>
    </div>
  );
}

function RatingBar() {
  const [ratingState, setRatingState] = useLocalStorageState<{
    hasRated: boolean;
    selectedRating: number | null;
  }>({
    hasRated: false,
    selectedRating: null
  }, "mathle-rating");
  const [activeRating, setActiveRating] = useState<number | null>(null);

  const votes = ratingState.hasRated ? 301 : 300;
  const ratings = [
    { value: 1, label: "Poor" },
    { value: 2, label: "Fair" },
    { value: 3, label: "Good" },
    { value: 4, label: "Great" },
    { value: 5, label: "Excellent" }
  ];
  const popupRating = ratingState.hasRated ? null : ratings.find((rating) => rating.value === activeRating);
  const ratingText = ratingState.hasRated
    ? "Thanks for rating"
    : "Rate this puzzle";

  function rate(value: number) {
    if (ratingState.hasRated) return;
    setActiveRating(value);
    setRatingState({
      hasRated: true,
      selectedRating: value
    });
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-2 text-sm text-slate-600">
      <div>{ratingText}</div>
      <div
        className="relative flex items-center justify-center gap-1"
        aria-label="Rate Mathle"
        onMouseLeave={() => !ratingState.hasRated && setActiveRating(null)}
      >
        {popupRating && (
          <div className="absolute bottom-full mb-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {popupRating.label}
          </div>
        )}
        {ratings.map((rating) => {
          const fillTo = ratingState.hasRated ? ratingState.selectedRating : activeRating;
          const selected = fillTo != null && rating.value <= fillTo;
          const visibleAfterRating = !ratingState.hasRated || rating.value === ratingState.selectedRating;
          return (
            <button
              key={rating.value}
              type="button"
              className={`text-2xl leading-none ${visibleAfterRating ? "inline-flex" : "hidden"} ${selected ? "text-red-500" : "text-slate-300"} ${ratingState.hasRated ? "cursor-default" : "cursor-pointer hover:text-red-500"}`}
              disabled={ratingState.hasRated}
              onClick={() => rate(rating.value)}
              onFocus={() => setActiveRating(rating.value)}
              onMouseEnter={() => !ratingState.hasRated && setActiveRating(rating.value)}
              title={rating.label}
              aria-label={`${rating.label} rating`}
            >
              ♥
            </button>
          );
        })}
      </div>
      <div>4.8/5 · {votes} votes</div>
    </div>
  );
}

function ModeSwitcher({
  mode,
  modePaths,
  puzzleLabel,
  onNewInfinite
}: Readonly<{
  mode: GameMode;
  modePaths: Record<GameMode, string>;
  puzzleLabel: string;
  onNewInfinite: () => void;
}>) {
  const modes = [GAME_MODES.DAILY, GAME_MODES.HOURLY, GAME_MODES.INFINITE];

  return (
    <div className="game-control mode-switcher" aria-label="Puzzle mode">
      <div className="mode-buttons">
        {modes.map((item) => (
          <a
            key={item}
            className={`mode-button ${mode === item ? "mode-button-active" : ""}`}
            aria-pressed={mode === item}
            href={modePaths[item]}
          >
            <FormattedMessage id={`mode.${item}`} defaultMessage={MODE_LABELS[item]} />
          </a>
        ))}
      </div>
      <div className="mode-meta">
        <span>{puzzleLabel}</span>
        {mode === GAME_MODES.INFINITE && (
          <button type="button" className="mode-new-button" onClick={onNewInfinite}>
            <FormattedMessage id="mode.newPuzzle" />
          </button>
        )}
      </div>
    </div>
  );
}

function ModeRecommendations({
  currentMode,
  modePaths
}: Readonly<{
  currentMode: GameMode;
  modePaths: Record<GameMode, string>;
}>) {
  const modes = [GAME_MODES.DAILY, GAME_MODES.HOURLY, GAME_MODES.INFINITE]
    .filter((mode) => mode !== currentMode);

  return (
    <div className="mode-recommendations">
      <div className="font-semibold text-slate-700">
        <FormattedMessage id="mode.tryOther" />
      </div>
      <div className="recommendation-buttons">
        {modes.map((mode) => (
          <a
            key={mode}
            className="recommendation-button"
            href={modePaths[mode]}
          >
            <FormattedMessage id={`mode.play.${mode}`} defaultMessage={`Play ${MODE_LABELS[mode]}`} />
          </a>
        ))}
      </div>
    </div>
  );
}

function HelpModal({ settings, onClose }: Readonly<{ settings: Settings; onClose: () => void }>) {
  const intl = useIntl();
  const examples: Array<{ row: GameRow; colors: CellColor[]; text: string }> = [
    {
      row: {
        ...createEmptyRow(0),
        firstNumber0: "4",
        firstNumber1: "1",
        sign: "+",
        secondNumber0: "5",
        secondNumber1: "4",
        result0: "0",
        result1: "9",
        result2: "5"
      } as GameRow,
      colors: [COLORS.WHITE, COLORS.WHITE, COLORS.GREEN, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE],
      text: intl.formatMessage({ id: "help.green" })
    },
    {
      row: {
        ...createEmptyRow(0),
        firstNumber0: "8",
        firstNumber1: "0",
        sign: "4",
        secondNumber0: "-",
        secondNumber1: "6",
        result0: "7",
        result1: "9",
        result2: "8"
      } as GameRow,
      colors: [COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.BROWN, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE],
      text: intl.formatMessage({ id: "help.yellow" })
    },
    {
      row: {
        ...createEmptyRow(0),
        firstNumber0: "1",
        firstNumber1: "7",
        sign: "+",
        secondNumber0: "8",
        secondNumber1: "5",
        result0: "1",
        result1: "0",
        result2: "2"
      } as GameRow,
      colors: [COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.GRAY, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE],
      text: intl.formatMessage({ id: "help.gray" })
    }
  ];

  return (
    <Modal onClose={onClose}>
      <h1 className="pb-2 text-xl text-blue-800">{intl.formatMessage({ id: "help.howPlay" })}</h1>
      <div className="text-lg">
        {intl.formatMessage({ id: "help.howPlayExplanation" })}
        <p className="whitespace-nowrap">{intl.formatMessage({ id: "help.equationExample" })}</p>
      </div>
      <div className="mt-4 border-t border-blue-200 py-3 font-light">
        <h2 className="pb-3 text-xl font-normal text-blue-800">{intl.formatMessage({ id: "help.examples" })}</h2>
        {examples.map((example, exampleIndex) => (
          <div key={exampleIndex} className="mb-3">
            <div className="mb-2 grid grid-cols-9">
              {CELLS.slice(0, 5).map((cell, index) => (
                <Cell
                  key={cell}
                  row={example.row}
                  cell={cell}
                  active
                  guessed
                  color={example.colors[index]}
                  settings={settings}
                />
              ))}
              <div className="flex items-center justify-center text-sm">=</div>
              {CELLS.slice(5).map((cell, offset) => (
                <Cell
                  key={cell}
                  row={example.row}
                  cell={cell}
                  active
                  guessed
                  color={example.colors[offset + 5]}
                  settings={settings}
                />
              ))}
            </div>
            <p className="text-gray-600">{example.text}</p>
          </div>
        ))}
        <div className="color-mode-comparison">
          <div className="color-mode-group">
            <h4>{intl.formatMessage({ id: "help.standardColors" })}</h4>
            <div className="color-swatch-row">
              <span className="color-swatch color-swatch-green">{intl.formatMessage({ id: "help.colorCorrect" })}</span>
              <span className="color-swatch color-swatch-yellow">{intl.formatMessage({ id: "help.colorPresent" })}</span>
              <span className="color-swatch color-swatch-gray">{intl.formatMessage({ id: "help.colorAbsent" })}</span>
            </div>
          </div>
          <div className="color-mode-group">
            <h4>{intl.formatMessage({ id: "help.colorBlindColors" })}</h4>
            <div className="color-swatch-row">
              <span className="color-swatch color-swatch-amber">{intl.formatMessage({ id: "help.colorCorrect" })}</span>
              <span className="color-swatch color-swatch-blue">{intl.formatMessage({ id: "help.colorPresent" })}</span>
              <span className="color-swatch color-swatch-gray">{intl.formatMessage({ id: "help.colorAbsent" })}</span>
            </div>
            <p className="text-gray-600">{intl.formatMessage({ id: "help.colorBlindModeDescription" })}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-blue-200 pt-4">
        <h2 className="pb-2 text-xl font-normal text-blue-800">{intl.formatMessage({ id: "help.about" })}</h2>
        <p className="py-1 text-gray-600">{intl.formatMessage({ id: "help.aboutDescription" })}</p>
        <p className="py-1 text-gray-600">{intl.formatMessage({ id: "help.aboutDescription2" })}</p>
        <p className="py-1 text-gray-600">
          {intl.formatMessage({ id: "help.openSource" })}{" "}
          <a href="https://github.com/AllenZLink/mathle" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </div>
      <button
        type="button"
        className="mt-5 inline-flex w-full justify-center rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
        onClick={onClose}
      >
        {intl.formatMessage({ id: "help.try" })}
      </button>
    </Modal>
  );
}

function SettingsModal({
  settings,
  setSettings,
  onClose
}: Readonly<{
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  onClose: () => void;
}>) {
  const darkModeEnabled = settings.enableDarkMode !== false;

  return (
    <Modal onClose={onClose}>
      <h1 className="border-b border-blue-200 pb-2 text-2xl text-blue-800">
        <FormattedMessage id="settings.settings" />
      </h1>
      <SettingsToggle
        titleId="settings.colorblind"
        descriptionId="settings.colorblind.desc"
        checked={settings.enableColorBlind}
        onToggle={() => setSettings({ ...settings, enableColorBlind: !settings.enableColorBlind })}
      />
      <SettingsToggle
        titleId="settings.darkMode"
        descriptionId="settings.darkMode.desc"
        checked={darkModeEnabled}
        onToggle={() => setSettings({ ...settings, enableDarkMode: !darkModeEnabled })}
      />
    </Modal>
  );
}

function ShareModal({
  type,
  gameState,
  settings,
  solution,
  puzzle,
  modePaths,
  onClose
}: Readonly<{
  type: typeof POPUP.SUCCESS | typeof POPUP.FAILURE;
  gameState: GameState;
  settings: Settings;
  solution: GameRow;
  puzzle: Puzzle;
  modePaths: Record<GameMode, string>;
  onClose: () => void;
}>) {
  const success = type === POPUP.SUCCESS;
  const text = success
    ? shareSuccessText(gameState.rows, gameState.numberOfGuesses, settings.enableColorBlind, puzzle.shareLabel)
    : shareFailureText(gameState.rows, solution, settings.enableColorBlind, puzzle.shareLabel);

  async function copyShare() {
    await navigator.clipboard.writeText(text);
    // Analytics integration point: track share-copy events here when a provider is added.
    toast.success("Copied!");
  }

  return (
    <Modal onClose={onClose}>
      <h1 className={`mb-2 border-b border-blue-200 pb-2 text-2xl ${success ? "text-green-800" : "text-red-800"}`}>
        <FormattedMessage id={success ? "success.success" : "failure.failure"} /> {success ? "💪" : "😞"}
      </h1>
      <p className="py-1 text-gray-600">
        <FormattedMessage id={success ? "success.message" : "failure.message"} />
      </p>
      {!success && (
        <p className="py-1 text-gray-600">
          <FormattedMessage id="failure.solution" /> <b>{visibleEquation(solution)}</b>
        </p>
      )}
      <p className="py-1 text-gray-600">
        <FormattedMessage id={success ? "success.show" : "failure.share"} />
      </p>
      <div className="my-3 w-full bg-blue-50 p-5 text-lg">
        <pre className="font-mono text-sm leading-none">{text}</pre>
      </div>
      <div className="mt-4 border-t border-blue-200 pt-4">
        <Countdown mode={puzzle.mode} />
      </div>
      <ModeRecommendations currentMode={puzzle.mode} modePaths={modePaths} />
      <div className="mt-5 flex gap-1 sm:mt-6">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          onClick={copyShare}
        >
          <FormattedMessage id="next.share" />
        </button>
      </div>
    </Modal>
  );
}

function pickBrowserLanguage(): string | null {
  const language = navigator.language;
  if (!language) return null;

  const locale = new Intl.Locale(language);
  const supported = ["en", "de"];
  return supported.includes(locale.language) ? locale.language : null;
}

type GameClientProps = Readonly<{
  initialMode?: GameMode;
  modePaths: Record<GameMode, string>;
}>;

export default function GameClient({ initialMode = GAME_MODES.DAILY, modePaths }: GameClientProps) {
  const intl = useIntl();
  const [settings, setSettings] = useLocalStorageState<Settings>(DEFAULT_SETTINGS, "settings");
  const defaultInfiniteState = useMemo<InfiniteState>(() => ({
    infiniteSeed: createInfiniteSeed()
  }), []);
  const [infiniteState, setInfiniteState] = useLocalStorageState<InfiniteState>(defaultInfiniteState, "mathle-infinite-state");
  const [timeTick, setTimeTick] = useState(0);
  const puzzle = useMemo(
    () => getPuzzleForMode(initialMode, infiniteState.infiniteSeed),
    [infiniteState.infiniteSeed, initialMode, timeTick]
  );
  const [gameStates, setGameStates] = useLocalStorageState<GameStates>({}, "mathle-game-states");
  const gameState = gameStates[puzzle.puzzleId] || createInitialGameState(puzzle.puzzleId);
  const solution = puzzle.solution;
  const [popup, setPopup] = useState<typeof POPUP[keyof typeof POPUP]>(POPUP.NONE);
  const [inputHint, setInputHint] = useState<string | null>(null);

  const setGameState = useCallback((updater: GameState | ((state: GameState) => GameState)) => {
    setGameStates((states) => {
      const current = states[puzzle.puzzleId] || createInitialGameState(puzzle.puzzleId);
      const next = typeof updater === "function" ? updater(current) : updater;
      return {
        ...states,
        [puzzle.puzzleId]: next
      };
    });
  }, [puzzle.puzzleId, setGameStates]);

  useEffect(() => {
    const timer = setInterval(() => setTimeTick((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const darkModeEnabled = settings.enableDarkMode !== false;
    document.documentElement.classList.toggle("theme-dark", darkModeEnabled);
    document.documentElement.style.colorScheme = darkModeEnabled ? "dark" : "light";
  }, [settings.enableDarkMode]);

  useEffect(() => {
    if (settings.firstExplanation) {
      setPopup(POPUP.HELP);
      setSettings({ ...settings, firstExplanation: false });
      return;
    }

    if (settings.language == null) {
      const language = pickBrowserLanguage();
      if (language) setSettings({ ...settings, language });
      return;
    }

    const expectedPath = settings.language === "en" ? "/" : `/${settings.language}/`;
    if (window.location.pathname === "/" && settings.language !== "en") {
      window.location.href = `${window.location.origin}${expectedPath}`;
    }
  }, [settings, setSettings]);

  useEffect(() => {
    if (!gameState.guessed) return;

    if (rowsEqual(gameState.rows[gameState.numberOfGuesses - 1], solution)) {
      setPopup(POPUP.SUCCESS);
    } else {
      setPopup(POPUP.FAILURE);
    }
  }, [gameState, solution]);

  useEffect(() => {
    if (!inputHint) return;

    const timer = window.setTimeout(() => setInputHint(null), 1800);
    return () => window.clearTimeout(timer);
  }, [inputHint]);

  const activeRow = gameState.rows[gameState.activeRow] ?? createEmptyRow(gameState.activeRow);
  const hasSign = CELLS.some((cell) => isSign(activeRow[cell]));

  const disabledTokens = useMemo(() => {
    const disabled = new Set<Token>();

    gameState.rows.slice(0, gameState.activeRow).forEach((row) => {
      const rowScore = scoreGuess(row, solution);
      CELLS.forEach((cell, index) => {
        const value = row[cell];
        if (
          value != null
          && rowScore[index] === COLORS.GRAY
          && !CELLS.some((solutionCell) => solution[solutionCell] === value)
        ) {
          disabled.add(value);
        }
      });
    });

    return disabled;
  }, [gameState.activeRow, gameState.rows, solution]);

  function startNewInfinitePuzzle() {
    setInfiniteState({
      infiniteSeed: createInfiniteSeed()
    });
    setPopup(POPUP.NONE);
  }

  function updateActiveRow(row: GameRow) {
    setGameState((state) => ({
      ...state,
      rows: state.rows.map((current) => current.rowNumber === row.rowNumber ? row : current)
    }));
  }

  function handleNumber(token: Token) {
    if (gameState.guessed || gameState.activeCell >= CELLS.length) return;
    if (disabledTokens.has(token)) {
      setInputHint(intl.formatMessage({ id: "key.unavailable" }, { token }));
      return;
    }

    if (isSign(token) && hasSign) {
      setInputHint(intl.formatMessage({ id: "key.operatorAlreadyUsed" }));
      return;
    }

    setInputHint(null);
    const updatedRow = setCell(activeRow, gameState.activeCell, token);
    setGameState((state) => ({
      ...state,
      rows: state.rows.map((row) => row.rowNumber === updatedRow.rowNumber ? updatedRow : row),
      activeCell: Math.min(state.activeCell + 1, CELLS.length)
    }));
  }

  function handleEnter() {
    if (!isValidEquation(activeRow)) {
      toast.error("Equation is invalid");
      return;
    }

    if (rowsEqual(activeRow, solution)) {
      setGameState((state) => ({
        ...state,
        guessed: true,
        numberOfGuesses: state.activeRow + 1,
        activeRow: state.activeRow + 1,
        activeCell: 0
      }));
      setPopup(POPUP.SUCCESS);
      return;
    }

    if (gameState.activeRow >= 4) {
      setGameState((state) => ({
        ...state,
        activeRow: 5,
        activeCell: 0,
        guessed: true,
        numberOfGuesses: 5
      }));
      return;
    }

    setGameState((state) => ({
      ...state,
      activeRow: Math.min(state.activeRow + 1, 5),
      activeCell: 0
    }));
  }

  function handleDelete() {
    if (gameState.activeCell <= 0 || gameState.guessed) return;

    const index = gameState.activeCell - 1;
    const updatedRow = setCell(activeRow, index, null);
    updateActiveRow(updatedRow);
    setGameState((state) => ({
      ...state,
      activeCell: Math.max(state.activeCell - 1, 0)
    }));
  }

  return (
    <div className="game-frame">
      <div className="game-control flex border-b border-slate-200 pb-2">
        <div className="flex w-1/3 items-center pl-2">
          <button
            type="button"
            aria-label="How to play"
            className="text-slate-500 transition hover:text-green-800"
            onClick={() => setPopup(POPUP.HELP)}
          >
            <HelpIcon />
          </button>
        </div>
        <div className="flex w-1/3 items-center justify-center text-center">
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">MATHLE</h1>
        </div>
        <div className="flex w-1/3 items-center justify-end pr-2">
          <button
            type="button"
            aria-label="Settings"
            className="text-slate-500 transition hover:text-green-800"
            onClick={() => setPopup(POPUP.SETTINGS)}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      <ModeSwitcher
        mode={puzzle.mode}
        modePaths={modePaths}
        puzzleLabel={puzzle.label}
        onNewInfinite={startNewInfinitePuzzle}
      />
      <div className="game-control flex flex-col items-center justify-center pb-8 pt-10 text-center">
        <div className="grid w-full grid-cols-9 font-mono" style={{ gap: "5px" }}>
          {gameState.rows.map((row) => (
            <GuessRow
              key={row.rowNumber}
              row={row}
              activeRow={gameState.activeRow}
              solution={solution}
              settings={settings}
            />
          ))}
        </div>
      </div>
      <div className="game-control input-hint-slot" aria-live="polite">
        {inputHint && (
          <div className="input-hint">
            <span className="input-hint-icon" aria-hidden="true">!</span>
            <span>{inputHint}</span>
          </div>
        )}
      </div>
      <div className="game-control justify-self-end pb-2 pt-4">
        <Keypad
          disabledTokens={disabledTokens}
          hasSign={hasSign}
          canEnter={gameState.activeCell === CELLS.length && !gameState.guessed}
          canDelete={gameState.activeCell > 0 && !gameState.guessed}
          onNumber={handleNumber}
          onEnter={handleEnter}
          onDelete={handleDelete}
          onHelp={() => setPopup(POPUP.HELP)}
        />
        <RatingBar />
        <Toaster />
      </div>
      {popup === POPUP.HELP && <HelpModal settings={settings} onClose={() => setPopup(POPUP.NONE)} />}
      {popup === POPUP.SETTINGS && (
        <SettingsModal settings={settings} setSettings={setSettings} onClose={() => setPopup(POPUP.NONE)} />
      )}
      {(popup === POPUP.SUCCESS || popup === POPUP.FAILURE) && (
        <ShareModal
          type={popup}
          gameState={gameState}
          settings={settings}
          solution={solution}
          puzzle={puzzle}
          modePaths={modePaths}
          onClose={() => setPopup(POPUP.NONE)}
        />
      )}
    </div>
  );
}
