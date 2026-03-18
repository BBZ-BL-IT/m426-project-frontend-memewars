import { useState, useEffect } from "react";
import "../styles/Styles.css";
import { socket } from "../socket/socket";

export default function GameView() {
  const [imgUrl, setImgUrl] = useState<string>("https://via.placeholder.com/800x600?text=Wait+for+Meme");
  const [memeId, setMemeId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialMeme();
  }, []);

  async function fetchInitialMeme() {
    try {
      setLoading(true);
      const resAll = await fetch("http://localhost:8080/memes/all");
      const allData = await resAll.json();
      const randomIdx = Math.floor(Math.random() * allData.length);
      const id = allData[randomIdx].id;
      setMemeId(id);

      const resMeme = await fetch(`http://localhost:8080/memes/random/${id}`);
      const memeData = await resMeme.json();
      setImgUrl(memeData.image.blank);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      {/* Frame über fast den ganzen Bildschirm strecken */}
      <div 
        className="home-frame" 
        style={{ 
          width: "95vw",          // Nimmt 95% der Bildschirmbreite ein
          height: "90vh",         // Nimmt 90% der Bildschirmhöhe ein
          maxWidth: "none",       // Hebt alte Begrenzungen auf
          flexDirection: "row", 
          gap: "40px",
          padding: "40px"
        }}
      >
        
        {/* Linke Seite: Das Meme-Feld (bekommt mehr Platz mit flex: 2) */}
        <div className="home-center" style={{ flex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <h2 className="home-title" style={{ fontSize: "2rem", marginBottom: "20px" }}>Create your Meme</h2>
          
          <div className="meme-container" style={{ 
            background: "rgba(0,0,0,0.3)", 
            padding: "20px", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
            flexGrow: 1,          // Nimmt den gesamten restlichen vertikalen Platz ein
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"    // Wichtig: Verhindert, dass riesige Bilder das Layout sprengen
          }}>
            {/* Das Bild passt sich dynamisch an, ohne zu verzerren */}
            <img 
              src={imgUrl} 
              alt="Meme Canvas" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "100%", 
                objectFit: "contain", // <- Das ist der Magic Trick gegen Verzerrung!
                borderRadius: "8px", 
                boxShadow: "0 0 30px rgba(0,0,0,0.6)" 
              }} 
            />
          </div>

          <button 
            className="home-btn home-btn-secondary" 
            style={{ marginTop: "20px", padding: "15px 40px", fontSize: "1.2rem", alignSelf: "center" }}
            onClick={fetchInitialMeme}
            disabled={loading}
          >
            {loading ? "Loading..." : "New Random Meme"}
          </button>
        </div>

        {/* Rechte Seite: Input Feld */}
        <div className="home-center" style={{ flex: 1, justifyContent: "center", padding: "20px" }}>
          
          {/* Extra Container rechts für eine aufgeräumte Optik */}
          <div style={{ 
            width: "100%", 
            background: "rgba(0,0,0,0.4)", 
            padding: "30px", 
            borderRadius: "15px", 
            border: "1px solid rgba(255,255,255,0.1)" 
          }}>
            <label style={{ color: "white", marginBottom: "15px", opacity: 0.9, fontSize: "1.2rem", display: "block", fontWeight: "bold" }}>
              Your Caption:
            </label>
            <input
              className="home-input"
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type something funny..."
              autoFocus
              style={{ width: "100%", fontSize: "1.2rem", padding: "15px" }} // Input vergrößert
            />
          </div>

        </div>

      </div>
    </div>
  );
}