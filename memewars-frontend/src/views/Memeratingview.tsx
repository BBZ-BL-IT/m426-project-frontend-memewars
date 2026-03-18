import { useState, useEffect } from "react";
import "../styles/Styles.css";
import { socket } from "../socket/socket";

interface Submission {
  playerId: string;
  playerName: string;
  topText: string;
  bottomText: string;
  memeUrl: string;
}

export default function MemeratingView() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    // Submissions aus sessionStorage laden — wurden von GameView gespeichert
    const stored = sessionStorage.getItem("submissions");
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("submissions:", parsed);
      setSubmissions(JSON.parse(stored));
    }
  }, []);

  function handleVote(playerId: string) {
    if (voted || playerId === socket.id) return;
    socket.emit("vote", { votedPlayerId: playerId });
    setVoted(playerId);
  }

  return (
    <div className="home-wrapper">
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div
        className="home-frame"
        style={{
          width: "95vw",
          height: "90vh",
          maxWidth: "none",
          flexDirection: "column",
          padding: "40px",
          gap: "24px",
        }}
      >
        <h2
          className="home-title"
          style={{ fontSize: "2rem", textAlign: "center" }}
        >
          🗳️ Vote for the best Meme!
        </h2>

        {voted && (
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.95rem",
            }}
          >
            ✓ Abgestimmt! Warte auf andere Spieler…
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {submissions.map((sub) => {
            const isOwn = sub.playerId === socket.id;
            const isChosen = voted === sub.playerId;

            return (
              <div
                key={sub.playerId}
                onClick={() => handleVote(sub.playerId)}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: isChosen
                    ? "2px solid #7eb8f7"
                    : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: isOwn || voted ? "default" : "pointer",
                  opacity: isOwn ? 0.5 : 1,
                  transform: isChosen ? "scale(1.03)" : "scale(1)",
                  transition: "transform 0.15s, border-color 0.15s",
                }}
              >
                <img
                  src={sub.memeUrl}
                  alt={`${sub.playerName}'s Meme`}
                  style={{ width: "100%", display: "block" }}
                />
                <div
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {sub.playerName}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {isOwn ? "(Du)" : isChosen ? "✓ Gewählt" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
