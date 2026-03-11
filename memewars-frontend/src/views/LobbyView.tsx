import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Styles.css"; // Stelle sicher, dass hier das neue Countdown-CSS landet
import { socket } from "../socket/socket";

interface Player {
  id: string;
  name: string;
  ready: boolean;
}

interface LobbyState {
  host: string;
  players: Player[];
  maxPlayers: number;
}

export default function LobbyView() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [host, setHost] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Sicherheit: Falls kein Socket verbunden (z.B. Refresh), zurück zum Start
    if (!socket.connected) {
      navigate("/");
      return;
    }

    // Update der Lobby-Daten (Spielerliste, Host-Wechsel)
    socket.on("lobbyUpdate", (lobby: LobbyState) => {
      setPlayers(lobby.players);
      setHost(lobby.host);
    });

    // Countdown-Event vom Server empfangen
    socket.on("startCountdown", (seconds: number) => {
      setCountdown(seconds);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            // Nach Ablauf des Countdowns zur GameView wechseln
            navigate("/game");
            return null;
          }
        });
      }, 1000);
    });

    socket.on("error", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("startCountdown");
      socket.off("error");
    };
  }, [navigate]);

  // Statistiken berechnen
  const readyCount = players.filter((p) => p.ready).length;
  // Bedingung: Mindestens 2 Spieler & alle bereit
  const allReady = players.length >= 2 && readyCount === players.length;
  const progress = players.length ? (readyCount / players.length) * 100 : 0;

  const toggleReady = () => {
    socket.emit("toggleReady");
  };

  const handleStartGame = () => {
    if (!allReady) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      return;
    }
    socket.emit("startGame");
  };

  const isHost = socket.id === host;

  // CSS Klasse für den Start-Button
  const startBtnClass = `start-btn ${allReady ? "active" : "inactive"} ${pulse ? "pulse" : ""}`;

  return (
    <div className="lobby-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ─── COUNTDOWN OVERLAY ─────────────────────── */}
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-text">BEREIT MACHEN...</div>
        </div>
      )}

      <div className="lobby-card">
        <div className="lobby-header">
          <div className="lobby-eyebrow">● WARTERAUM</div>
          <div className="lobby-title">
            Lo<span>bb</span>y
          </div>
        </div>

        <div className="divider" />

        <div className="progress-label">
          {readyCount} / {players.length} Spieler bereit
        </div>

        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="players-row">
          {players.map((player) => {
            const isMe = player.id === socket.id;
            const isPlayerHost = player.id === host;

            return (
              <div key={player.id} className="player">
                <div className={`player-avatar ${player.ready ? "ready" : "waiting"}`}>
                  {player.name[0]?.toUpperCase()}
                </div>

                <span className={`player-name ${player.ready ? "ready" : "waiting"}`}>
                  {player.name} {isMe && "(Du)"} {isPlayerHost && "👑"}
                </span>

                <div className={`player-badge ${player.ready ? "ready" : "waiting"}`}>
                  {player.ready ? "BEREIT" : "WARTET"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="start-btn-wrap" style={{ marginTop: "30px" }}>
          <button 
            className={`ready-btn ${players.find(p => p.id === socket.id)?.ready ? 'is-ready' : ''}`} 
            onClick={toggleReady}
            disabled={countdown !== null} // Deaktivieren, wenn Countdown läuft
          >
            {players.find(p => p.id === socket.id)?.ready ? "Nicht bereit" : "Bereit werden"}
          </button>

          {isHost && (
            <button 
              className={startBtnClass} 
              onClick={handleStartGame}
              disabled={countdown !== null}
            >
              Spiel starten
            </button>
          )}

          {!allReady && isHost && (
            <div className="start-hint">
              {players.length < 2 
                ? "Warte auf weitere Mitspieler..." 
                : "Alle müssen bereit sein"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}