import { useState, useEffect } from "react";
import "../styles/Styles.css";
import { socket } from "../socket/socket";

export default function GameView() {
  const [imgUrl, setImgUrl] = useState<string>("https://via.placeholder.com/500x400?text=Wait+for+Meme");
  const [memeId, setMemeId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Initial ein zufälliges Meme laden
  useEffect(() => {
    fetchInitialMeme();
  }, []);

  async function fetchInitialMeme() {
    try {
      setLoading(true);
      // Erst alle holen, um eine ID zu bekommen (wie in deinem HTML Beispiel)
      const resAll = await fetch("http://localhost:8080/memes/all");
      const allData = await resAll.json();
      const randomIdx = Math.floor(Math.random() * allData.length);
      const id = allData[randomIdx].id;
      setMemeId(id);

      // Dann das spezifische Bild laden
      const resMeme = await fetch(`http://localhost:8080/memes/random/${id}`);
      const memeData = await resMeme.json();
      setImgUrl(memeData.image.blank);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Text-Update Call (wird bei Input-Änderung gefeuert)
  async function handleTextChange(text: string) {
    setInputText(text);
    if (text.trim() === "" || !memeId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/memes/custom_text/${memeId}/${text}`
      );
      if (response.ok) {
        const data = await response.json();
        setImgUrl(data.url);
      }
    } catch (error) {
      console.error("Fehler beim Text-Update:", error);
    }
  }

  return (
    <div className="home-wrapper">
      {/* Wiederverwendung der HomeView Background-Effekte */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div className="home-frame" style={{ maxWidth: "1000px", flexDirection: "row", gap: "30px" }}>
        
        {/* Linke Seite: Das Meme-Feld */}
        <div className="home-center" style={{ flex: 2 }}>
          <h2 className="home-title" style={{ fontSize: "1.5rem" }}>Create your Meme</h2>
          <div className="meme-container" style={{ 
            background: "rgba(0,0,0,0.3)", 
            padding: "10px", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src={imgUrl} 
              alt="Meme Canvas" 
              style={{ maxWidth: "100%", borderRadius: "8px", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }} 
            />
          </div>
          <button 
            className="home-btn home-btn-secondary" 
            style={{ marginTop: "15px" }}
            onClick={fetchInitialMeme}
          >
            New Random Meme
          </button>
        </div>

        {/* Rechte Seite: Input Feld */}
        <div className="home-center" style={{ flex: 1, justifyContent: "flex-start", paddingTop: "60px" }}>
          <label style={{ color: "white", marginBottom: "10px", opacity: 0.8 }}>Your Caption:</label>
          <input
            className="home-input"
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type something funny..."
            autoFocus
          />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "10px" }}>
            The image updates in real-time as you type.
          </p>
        </div>

      </div>
    </div>
  );
}