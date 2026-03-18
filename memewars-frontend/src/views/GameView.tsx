import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Styles.css";
import { socket } from "../socket/socket";
import { BACKEND_URL } from "../assets/config";

function buildMemeUrl(memeId: string, topText: string, bottomText = "") {
  const encode = (text: string) =>
    text.trim().replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_") || "_";
  return `https://api.memegen.link/images/${memeId}/${encode(topText)}/${encode(bottomText)}.png`;
}

export default function GameView() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const [imgUrl, setImgUrl] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const memeIdRef = useRef<string>("");
  const inputTextRef = useRef<string>("");
  const isSubmittedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    fetchInitialMeme();

    socket.on("submissionsUpdate", ({ submittedPlayers: sp, total }) => {
      setSubmittedPlayers(sp);
      setTotalPlayers(total);
    });

    // FIX: erstes Meme in sessionStorage speichern damit MemeRating es beim Mount lesen kann
    socket.on("currentMeme", (meme) => {
      console.log("GameView currentMeme empfangen:", meme); // kommt das an?
      sessionStorage.setItem("firstMeme", JSON.stringify(meme));
      setTimeout(() => navigateRef.current("/rating"), 0);
    });

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!isSubmittedRef.current) {
            const topText = inputTextRef.current.trim() || "...";
            socket.emit("submitCaption", {
              topText,
              bottomText: "",
              memeId: memeIdRef.current,
              memeUrl: buildMemeUrl(memeIdRef.current, topText),
            });
            isSubmittedRef.current = true;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.off("submissionsUpdate");
      socket.off("currentMeme");
      clearInterval(timerRef.current!);
    };
  }, []);

  async function fetchInitialMeme() {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    try {
      setLoading(true);
      const resAll = await fetch(`${BACKEND_URL}/memes/all`);
      const allData = await resAll.json();
      const randomIdx = Math.floor(Math.random() * allData.length);
      const id = allData[randomIdx].id;
      memeIdRef.current = id;
      const resMeme = await fetch(`${BACKEND_URL}/memes/random/${id}`);
      const memeData = await resMeme.json();
      setImgUrl(memeData.image.blank);
      setInputText("");
      inputTextRef.current = "";
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      hasFetchedRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  async function fetchNewMeme() {
    if (isSubmitted) return;
    hasFetchedRef.current = false;
    await fetchInitialMeme();
  }

  async function handleTextChange(text: string) {
    setInputText(text);
    inputTextRef.current = text;
    if (text.trim() === "" || !memeIdRef.current) {
      const resMeme = await fetch(`${BACKEND_URL}/memes/random/${memeIdRef.current}`);
      const memeData = await resMeme.json();
      setImgUrl(memeData.image.blank);
      return;
    }
    try {
      const response = await fetch(
        `${BACKEND_URL}/memes/custom_text/${memeIdRef.current}/${encodeURIComponent(text)}`
      );
      if (response.ok) {
        const data = await response.json();
        setImgUrl(data.url);
      }
    } catch (error) {
      console.error("Fehler beim Text-Update:", error);
    }
  }

  function handleSubmit() {
    if (!inputText.trim() || isSubmitted) return;
    const topText = inputText.trim();
    const memeUrl = buildMemeUrl(memeIdRef.current, topText);
    console.log("Submitting:", { memeId: memeIdRef.current, topText, memeUrl });
    socket.emit("submitCaption", { topText, bottomText: "", memeId: memeIdRef.current, memeUrl });
    setIsSubmitted(true);
    isSubmittedRef.current = true;
  }

  const timerColor = timeLeft > 20 ? "#7af798" : timeLeft > 10 ? "#facc15" : "#f87171";
  const timerPercent = (timeLeft / 45) * 100;

  return (
    <div className="home-wrapper">
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      <div className="home-frame" style={{ width: "95vw", height: "90vh", maxWidth: "none", flexDirection: "row", gap: "40px", padding: "40px" }}>
        <div className="home-center" style={{ flex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <h2 className="home-title" style={{ fontSize: "2rem", marginBottom: "20px" }}>Create your Meme</h2>
          <div className="meme-container" style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", width: "100%", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {imgUrl && <img src={imgUrl} alt="Meme Canvas" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px", boxShadow: "0 0 30px rgba(0,0,0,0.6)" }} />}
          </div>
          <button className="home-btn home-btn-secondary" style={{ marginTop: "20px", padding: "15px 40px", fontSize: "1.2rem", alignSelf: "center" }} onClick={fetchNewMeme} disabled={loading || isSubmitted}>
            {loading ? "Loading..." : "New Random Meme"}
          </button>
        </div>

        <div className="home-center" style={{ flex: 1, justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", background: "rgba(0,0,0,0.4)", padding: "30px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Zeit verbleibend</span>
                <span style={{ color: timerColor, fontWeight: "bold", fontSize: "1.4rem", fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${timerPercent}%`, background: timerColor, borderRadius: "999px", transition: "width 1s linear, background 0.5s ease" }} />
              </div>
            </div>

            <label style={{ color: "white", marginBottom: "15px", opacity: 0.9, fontSize: "1.2rem", display: "block", fontWeight: "bold" }}>Your Caption:</label>
            <input className="home-input" value={inputText} onChange={(e) => handleTextChange(e.target.value)} placeholder="Type something funny..." autoFocus disabled={isSubmitted} style={{ width: "100%", fontSize: "1.2rem", padding: "15px" }} />

            <button onClick={handleSubmit} disabled={!inputText.trim() || isSubmitted} style={{ marginTop: "20px", width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: "bold", letterSpacing: "0.06em", border: "none", borderRadius: "12px", cursor: isSubmitted || !inputText.trim() ? "not-allowed" : "pointer", background: isSubmitted ? "rgba(0,200,100,0.2)" : "linear-gradient(135deg, #7eb8f7 0%, #a78bfa 100%)", color: isSubmitted ? "#7af798" : "#0a0a0a", boxShadow: isSubmitted ? "none" : "0 0 24px rgba(126,184,247,0.4), 0 4px 15px rgba(0,0,0,0.3)", transition: "all 0.2s ease" }}>
              {isSubmitted ? "✓  Abgegeben!" : "🔥  Submit Meme"}
            </button>

            {totalPlayers > 0 && (
              <div style={{ marginTop: "24px" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginBottom: "10px" }}>{submittedPlayers.length} / {totalPlayers} abgegeben</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {submittedPlayers.map((name) => (
                    <span key={name} style={{ padding: "4px 12px", background: "rgba(0,200,100,0.15)", border: "1px solid rgba(0,200,100,0.35)", borderRadius: "999px", color: "#7af798", fontSize: "0.8rem" }}>✓ {name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}