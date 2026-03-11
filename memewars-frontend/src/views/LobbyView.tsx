import React, { useEffect, useState } from "react";
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
  const [gameStarted, setGameStarted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Sicherheit: Wenn der Socket nicht verbunden ist (z.B. nach Refresh), 
    // zurück zum Start, um Inkonsistenzen zu vermeiden.
    if (!socket.connected) {
      navigate("/");
      return;
    }

    // Initialen Status anfordern (optional, falls nicht bereits gesendet)
    socket.emit("getLobbyUpdate");

    socket.on("lobbyUpdate", (lobby: LobbyState) => {
      setPlayers(lobby.players);
      setHost(lobby.host);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
      // Kurze Verzögerung für den visuellen Effekt ("Spiel startet...")
      setTimeout(() => {
        navigate("/game"); // Leitet alle Spieler zur GameView weiter
      }, 2000);
    });

    socket.on("error", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.off("gameStarted");
      socket.off("error");
    };
  }, [navigate]);

  const readyCount = players.filter((p) => p.ready).length;
  // Bedingung: Mindestens 2 Spieler UND alle bereit
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

  // Hilfsvariable für das Button-Styling
  const startBtnClass = [
    "start-btn",
    allReady ? "active" : "inactive",
    pulse ? "pulse" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isHost = socket.id === host;

  return (
    <div className="lobby-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Visuelles Feedback beim Start */}
      <div className={`toast ${gameStarted ? "visible" : ""}`}>
        🎮 Spiel startet…
      </div>

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
            const state = player.ready ? "ready" : "waiting";
            const isMe = player.id === socket.id;

            return (
              <div key={player.id} className="player">
                <div className={`player-avatar ${state}`}>
                  {player.name[0]?.toUpperCase()}
                </div>

                <span className={`player-name ${state}`}>
                  {player.name} {isMe ? "(Du)" : ""} {player.id === host ? "👑" : ""}
                </span>

                <div className={`player-badge ${state}`}>
                  {player.ready ? "BEREIT" : "WARTET"}
                </div>
              </div>
            );
          })}

          <div className="start-btn-wrap" style={{ marginTop: '2rem' }}>
            <button className="ready-btn" onClick={toggleReady}>
              {players.find(p => p.id === socket.id)?.ready ? "Nicht bereit" : "Bereit werden"}
            </button>

            {isHost && (
              <button className={startBtnClass} onClick={handleStartGame}>
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
    </div>
  );
}