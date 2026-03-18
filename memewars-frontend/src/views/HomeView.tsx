import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeView.css";
import { socket } from "../socket/socket";

type Lobby = {
  id: string;
  lobbyName: string;
  players: number;
  maxPlayers: number;
  isStarted: boolean;
};

export default function HomeView() {
  const [name, setName] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const navigate = useNavigate();

  const trimmedName = useMemo(() => name.trim(), [name]);
  const canContinue = trimmedName.length > 0;

  useEffect(() => {
    socket.emit("getLobbies");

    socket.on("lobbyList", (data: Lobby[]) => {
      setLobbies(data);
    });

    return () => {
      socket.off("lobbyList");
    };
  }, []);

  function handleCreate() {
    if (!canContinue) return;
    localStorage.setItem("playerName", trimmedName);

    socket.emit("createLobby", {
      name: trimmedName,
      lobbyName: lobbyName.trim() || `${trimmedName}'s Lobby`
    });

    navigate("/lobby");
  }

  function joinLobby(lobbyId: string) {
    if (!canContinue) return;
    localStorage.setItem("playerName", trimmedName);
    socket.emit("joinLobby", { lobbyId, name: trimmedName });
    navigate("/lobby");
  }

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
            placeholder="Your name..."
          />

          <input
            className="home-input"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="Lobby name..."
            style={{ marginTop: "10px", fontSize: "0.9rem", opacity: 0.8 }}
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className="home-btn home-btn-secondary"
              onClick={handleCreate}
              disabled={!canContinue}
              style={{ width: '100%' }}
            >
              Create Lobby
            </button>
          </div>

          <div className="lobby-list">
            <h3 style={{ color: "white", marginBottom: "10px" }}>Active Lobbies</h3>
            {lobbies.length === 0 && <div className="lobby-empty">No open lobbies</div>}

            {lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                <span className="lobby-info">
                  <strong>{lobby.lobbyName}</strong>
                  <br />
                  <small style={{ opacity: 0.7 }}>
                    ({lobby.players}/{lobby.maxPlayers} Spieler)
                    {lobby.isStarted && " - IN GAME"}
                  </small>
                </span>

                <button
                  className="home-btn"
                  onClick={() => joinLobby(lobby.id)}
                  disabled={!canContinue || lobby.isStarted || lobby.players >= lobby.maxPlayers}
                >
                  {lobby.isStarted ? "Laufend" : "Join"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}