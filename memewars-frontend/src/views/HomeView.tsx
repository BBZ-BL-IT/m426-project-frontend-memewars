import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Wichtig für den Seitenwechsel
import "../styles/HomeView.css";
import { socket } from "../socket/socket";

type Lobby = {
  id: string;
  players: number;
  maxPlayers: number;
};

type HomeViewProps = {
  onJoinLobby?: (playerName: string) => void;
  onCreateLobby?: (playerName: string) => void;
};

export default function HomeView({ onJoinLobby, onCreateLobby }: HomeViewProps) {
  const [name, setName] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const navigate = useNavigate(); // Hook initialisieren

  const trimmedName = useMemo(() => name.trim(), [name]);
  const canContinue = trimmedName.length > 0;

  // ─── Socket Setup ─────────────────────────────────

  useEffect(() => {
    socket.emit("getLobbies");

    socket.on("lobbyList", (lobbies: Lobby[]) => {
      setLobbies(lobbies);
    });

    return () => {
      socket.off("lobbyList");
    };
  }, []);

  // ─── Actions ──────────────────────────────────────

  function handleJoin() {
    if (!canContinue) return;
    
    // Falls Lobbys existieren, trete der ersten bei
    if (lobbies.length > 0) {
      joinLobby(lobbies[0].id);
    } else {
      alert("Keine offenen Lobbys gefunden. Erstelle stattdessen eine!");
    }
  }

  function handleCreate() {
    if (!canContinue) return;

    localStorage.setItem("playerName", trimmedName);

    // Backend erwartet { name, maxPlayers }
    socket.emit("createLobby", {
      name: trimmedName,
      maxPlayers: 4,
    });

    onCreateLobby?.(trimmedName);
    navigate("/lobby"); // Navigiere zur Lobby-Ansicht
  }

  function joinLobby(lobbyId: string) {
    if (!canContinue) return;

    localStorage.setItem("playerName", trimmedName);

    // Backend erwartet jetzt { lobbyId, name }
    socket.emit("joinLobby", { lobbyId, name: trimmedName });

    onJoinLobby?.(trimmedName);
    navigate("/lobby"); // Navigiere zur Lobby-Ansicht
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleJoin();
  }

  // ─── UI ───────────────────────────────────────────

  return (
    <div className="home-wrapper">
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div className="home-frame">
        <div className="home-center">

          <h1 className="home-title">Welcome to Memewars</h1>

          <input
            className="home-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name ......"
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              className="home-btn home-btn-primary"
              onClick={handleJoin}
              disabled={!canContinue}
            >
              Quick Join
            </button>

            <button
              className="home-btn home-btn-secondary"
              onClick={handleCreate}
              disabled={!canContinue}
            >
              Create Lobby
            </button>
          </div>

          {/* ─── Lobby List ───────────────────────── */}

          <div className="lobby-list">
            <h3 style={{ color: "white", marginBottom: "10px" }}>Active Lobbies</h3>
            {lobbies.length === 0 && (
              <div className="lobby-empty">
                No open lobbies
              </div>
            )}

            {lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                <span className="lobby-info">
                  Lobby {lobby.id.slice(0, 6)} ({lobby.players}/{lobby.maxPlayers})
                </span>

                <button
                  className="home-btn"
                  onClick={() => joinLobby(lobby.id)}
                  disabled={!canContinue}
                >
                  Join
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}