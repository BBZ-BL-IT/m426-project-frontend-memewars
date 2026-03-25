import { useState, useEffect } from "react";
import "../styles/Styles.css";
import { socket } from "../socket/socket";

export default function GameView() {
  const [imgUrl, setImgUrl] = useState<string>("https://via.placeholder.com/800x600?text=Wait+for+Meme");
  const [memeId, setMemeId] = useState<string>("");
  const [textInputs, setTextInputs] = useState<string[]>([""]);
  const [lines, setLines] = useState<number>(1);
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
      
      const memeLines = memeData.lines ?? 1;
      setLines(memeLines);
      setTextInputs(Array(memeLines).fill(""));
      setImgUrl(memeData.image.blank);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTextChange(index: number, value: string) {
    const updated = [...textInputs];
    updated[index] = value;
    setTextInputs(updated);

    const textForUrl = updated.map((t) =>
      t.trim() === "" ? "_" : t
    );

    if (!memeId) return;

    try {
      
      const combinedText = textForUrl.join("~");

      const response = await fetch(
        `http://localhost:8080/memes/custom_text/${memeId}/${encodeURIComponent(combinedText)}`
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

      <div
        className="home-frame"
        style={{
          width: "95vw",
          height: "90vh",
          maxWidth: "none",
          flexDirection: "row",
          gap: "40px",
          padding: "40px"
        }}
      >
        {/* Linke Seite: Meme-Bild */}
        <div className="home-center" style={{ flex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <h2 className="home-title" style={{ fontSize: "2rem", marginBottom: "20px" }}>Create your Meme</h2>

          <div className="meme-container" style={{
            background: "rgba(0,0,0,0.3)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            <img
              src={imgUrl}
              alt="Meme Canvas"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
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

        {/* Rechte Seite: Dynamische Inputs */}
        <div className="home-center" style={{ flex: 1, justifyContent: "center", padding: "20px" }}>
          <div style={{
            width: "100%",
            background: "rgba(0,0,0,0.4)",
            padding: "30px",
            borderRadius: "15px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {textInputs.map((value, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <label style={{
                  color: "white",
                  marginBottom: "8px",
                  opacity: 0.9,
                  fontSize: "1rem",
                  display: "block",
                  fontWeight: "bold"
                }}>
                  Caption {index + 1}:
                </label>
                <input
                  className="home-input"
                  value={value}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder={`Text ${index + 1}...`}
                  autoFocus={index === 0}
                  style={{ width: "100%", fontSize: "1.1rem", padding: "12px" }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}