import React, { useState } from "react";
import '../styles/Styles.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
  id: number;
  name: string;
  ready: boolean;
  avatar: string;
}

interface PlayerComponentProps {
  player: Player;
  onToggleReady: (id: number) => void;
}

// ─── PlayerComponent ──────────────────────────────────────────────────────────

const PlayerComponent = ({ player, onToggleReady }: PlayerComponentProps) => {
  const state = player.ready ? "ready" : "waiting";
  const label = player.ready ? "BEREIT" : "WARTET";

  return (
    <div className="player" onClick={() => onToggleReady(player.id)}>
      <div className={`player-avatar ${state}`}>
        {player.avatar}
      </div>
      <span className={`player-name ${state}`}>
        {player.name}
      </span>
      <div className={`player-badge ${state}`}>
        {label}
      </div>
    </div>
  );
};

// ─── LobbyView ────────────────────────────────────────────────────────────────

export default function LobbyView() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Player 1", ready: true,  avatar: "🦊" },
    { id: 2, name: "Player 2", ready: false, avatar: "🐺" },
    { id: 3, name: "Player 3", ready: false, avatar: "🦁" },
    { id: 4, name: "Player 4", ready: false, avatar: "🐯" },
    { id: 5, name: "Player 5", ready: false, avatar: "🦄" },
  ]);

  const [gameStarted, setGameStarted] = useState(false);
  const [pulse, setPulse]             = useState(false);

  const readyCount = players.filter((p) => p.ready).length;
  const allReady   = readyCount === players.length;
  const progress   = (readyCount / players.length) * 100;

  const handleToggleReady = (id: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ready: !p.ready } : p))
    );
  };

  const handleStartGame = () => {
    if (!allReady) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      return;
    }
    setGameStarted(true);
    setTimeout(() => setGameStarted(false), 3000);
  };

  const startBtnClass = [
    "start-btn",
    allReady ? "active" : "inactive",
    pulse    ? "pulse"  : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="lobby-wrapper">
      {/* Background decorations */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Toast notification */}
      <div className={`toast ${gameStarted ? "visible" : ""}`}>
        🎮 Spiel startet…
      </div>

      {/* Main card */}
      <div className="lobby-card">

        {/* Header */}
        <div className="lobby-header">
          <div className="lobby-eyebrow">● WARTERAUM</div>
          <div className="lobby-title">
            Lo<span>bb</span>y
          </div>
        </div>

        <div className="divider" />

        {/* Progress bar */}
        <div className="progress-label">
          {readyCount} / {players.length} Spieler bereit
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Players + Start button */}
        <div className="players-row">
          {players.map((player) => (
            <PlayerComponent
              key={player.id}
              player={player}
              onToggleReady={handleToggleReady}
            />
          ))}

          <div className="start-btn-wrap">
            <button className={startBtnClass} onClick={handleStartGame}>
              Spiel starten
            </button>
            {!allReady && (
              <div className="start-hint">Alle müssen bereit sein</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}