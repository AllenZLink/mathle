"use client";

import { useEffect, useState } from "react";
import type { GameMode } from "@/lib/game";
import GameClient from "./GameClient";

type GameMountProps = Readonly<{
  initialMode?: GameMode;
  modePaths: Record<GameMode, string>;
}>;

export default function GameMount({ initialMode, modePaths }: GameMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="game-frame" aria-hidden="true" />;
  }

  return <GameClient initialMode={initialMode} modePaths={modePaths} />;
}
