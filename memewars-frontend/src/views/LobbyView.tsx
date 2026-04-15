import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Styles.css";
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

  // ⚠️ WICHTIG: navigate in Ref speichern
  // Grund: setInterval bildet Closure über alte navigate-Referenz
  // Ohne Ref würde navigate im Interval veraltete Werte haben
  // Lösung: navigateRef.current nutzen um immer aktuelle Funktion zu haben
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!socket.connected) {
      navigate("/");
      return;
    }

    socket.emit("getLobbyState");

    socket.on("lobbyUpdate", (lobby: LobbyState) => {
      setPlayers(lobby.players);
      setHost(lobby.host);
    });

    socket.on("startCountdown", (seconds: number) => {
      setCountdown(seconds);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            // ⚠️ WICHTIG: navigate via Ref statt direkt
            // Grund: Verhindert Closure-Problem im setInterval
            // BrowserRouter erwartet navigate innerhalb Event-Handler
            // setTimeout() mit 0ms ermöglicht asynchronen Navigation-Trigger
            setTimeout(() => navigateRef.current("/game"), 0);
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
  }, []);

  const readyCount = players.filter((p) => p.ready).length;
  const allReady = players.length >= 2 && readyCount === players.length;
  const progress = players.length ? (readyCount / players.length) * 100 : 0;

  const toggleReady = () => socket.emit("toggleReady");

  const handleStartGame = () => {
    if (!allReady) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      return;
    }
    socket.emit("startGame");
  };

  const isHost = socket.id === host;
  const startBtnClass = `start-btn ${allReady ? "active" : "inactive"} ${pulse ? "pulse" : ""}`;

  return (
    <div className="lobby-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-text">BEREIT MACHEN...</div>
        </div>
      )}

      <div className="lobby-card">
        <div className="lobby-header">
          <div className="lobby-eyebrow">● WARTERAUM</div>
          <div className="lobby-title">Lo<span>bb</span>y</div>
        </div>

        <div className="divider" />

        <div className="progress-label">
          {readyCount} / {players.length} Spieler bereit
        </div>

        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
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
            className={`ready-btn ${players.find(p => p.id === socket.id)?.ready ? "is-ready" : ""}`}
            onClick={toggleReady}
            disabled={countdown !== null}
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
              {players.length < 2 ? "Warte auf weitere Mitspieler..." : "Alle müssen bereit sein"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}