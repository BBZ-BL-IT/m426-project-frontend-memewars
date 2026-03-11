import { useMemo, useState } from "react";
import "../styles/HomeView.css";

type HomeViewProps = {
  onJoinLobby?: (playerName: string) => void;
  onCreateLobby?: (playerName: string) => void;
};

export default function HomeView({ onJoinLobby, onCreateLobby }: HomeViewProps) {
  const [name, setName] = useState("");

  const trimmedName = useMemo(() => name.trim(), [name]);
  const canContinue = trimmedName.length > 0;

  function handleJoin() {
    if (!canContinue) return;
    onJoinLobby?.(trimmedName);
  }

  function handleCreate() {
    if (!canContinue) return;
    onCreateLobby?.(trimmedName);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleJoin();
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
          onKeyDown={handleKeyDown}
          placeholder="Enter your name ......"
        />

        <button
          className="home-btn home-btn-primary"
          onClick={handleJoin}
          disabled={!canContinue}
        >
          Join Lobby
        </button>

        <button
          className="home-btn home-btn-secondary"
          onClick={handleCreate}
          disabled={!canContinue}
        >
          Create Lobby
        </button>

      </div>
    </div>
  </div>
);
}