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
  const [isCreating, setIsCreating] = useState(false); // Toggle für das zweite Input-Feld
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

  // Zweistufiger Erstellungsprozess
  function handleCreateAction() {
    if (!canContinue) return;

    if (!isCreating) {
      // Schritt 1: Eingabefeld für Lobby-Namen einblenden
      setIsCreating(true);
    } else {
      // Schritt 2: Lobby final erstellen
      localStorage.setItem("playerName", trimmedName);

      socket.emit("createLobby", {
        name: trimmedName,
        lobbyName: lobbyName.trim() || `${trimmedName}'s Lobby`
      });

      navigate("/lobby");
    }
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

          {/* Spielername: Immer sichtbar */}
          <input
            className="home-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            disabled={isCreating} // Sperren, während man den Lobby-Namen wählt
          />

          {/* Lobby-Name: Nur sichtbar nach Klick auf "Create Lobby" */}
          {isCreating && (
            <div className="lobby-setup-area" style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
              <input
                className="home-input"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Name your lobby"
                autoFocus
                style={{ marginTop: "10px", borderColor: "#00f2ff" }}
              />
              <button
                className="cancel-btn"
                onClick={() => setIsCreating(false)}
                style={{
                  background: 'none', border: 'none', color: '#ff4444',
                  fontSize: '0.8rem', cursor: 'pointer', marginTop: '8px',
                  display: 'block', width: '100%', textAlign: 'center'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className={`home-btn ${isCreating ? 'home-btn-primary' : 'home-btn-secondary'}`}
              onClick={handleCreateAction}
              disabled={!canContinue}
              style={{ width: '100%' }}
            >
              {isCreating ? "Confirm & Open Lobby" : "Create Lobby"}
            </button>
          </div>

          <div className="lobby-list">
            <h3 style={{ color: "white", marginBottom: "15px", fontSize: "1.1rem" }}>Active Lobbies</h3>

            {lobbies.length === 0 && (
              <div className="lobby-empty">No open lobbies found</div>
            )}

            {lobbies.map((lobby) => (
              <div key={lobby.id} className="lobby-item">
                <div className="lobby-info">
                  <strong>{lobby.lobbyName}</strong>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                    {lobby.players}/{lobby.maxPlayers} Players
                    {lobby.isStarted && <span style={{ color: '#ffcc00' }}> • IN GAME</span>}
                  </div>
                </div>

                <button
                  className="home-btn"
                  onClick={() => joinLobby(lobby.id)}
                  disabled={!canContinue || lobby.isStarted || lobby.players >= lobby.maxPlayers || isCreating}
                  style={{ padding: '5px 15px', fontSize: '0.9rem' }}
                >
                  {lobby.isStarted ? "Busy" : "Join"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}