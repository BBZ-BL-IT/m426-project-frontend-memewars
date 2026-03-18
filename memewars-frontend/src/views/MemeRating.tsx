import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MemeRating.css';
import { socket } from '../socket/socket';

interface CurrentMeme {
  id: string;
  url: string;
  uploaderName: string;
  timeLimit?: number;
  memeIndex?: number;
  totalMemes?: number;
}

export default function MemeRating() {
  const navigate = useNavigate();
  const [currentMeme, setCurrentMeme] = useState<CurrentMeme | null>(null);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    // FIX: eerste Meme aus sessionStorage laden — wurde von GameView gespeichert
    // bevor navigate() aufgerufen wurde, also garantiert vorhanden
    const stored = sessionStorage.getItem("firstMeme");
    console.log("MemeRating mount, firstMeme:", stored); 
    if (stored) {
      const meme = JSON.parse(stored);
      setCurrentMeme(meme);
      setRating(5);
      setSubmitted(false);
      setTimeLeft(meme.timeLimit ?? 15);
      setWaiting(false);
    } else {
      // Fallback falls kein gespeichertes Meme — warte auf Socket
      setWaiting(true);
    }

    // Alle weiteren Memes kommen per Socket
    socket.on('currentMeme', (meme: CurrentMeme) => {
      setCurrentMeme(meme);
      setRating(5);
      setSubmitted(false);
      setTimeLeft(meme.timeLimit ?? 15);
      setWaiting(false);
    });

    socket.on('waitingForNextMeme', () => {
      setWaiting(true);
    });

    socket.on('ranglisteData', (data) => {
      sessionStorage.setItem('ranglisteData', JSON.stringify(data));
      setTimeout(() => navigate('/rangliste'), 0);
    });

    return () => {
      socket.off('currentMeme');
      socket.off('waitingForNextMeme');
      socket.off('ranglisteData');
    };
  }, []);

  // Timer
  useEffect(() => {
    if (waiting || submitted || !currentMeme) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted, waiting, currentMeme]);

  const handleSubmit = () => {
    if (submitted || !currentMeme) return;
    setSubmitted(true);
    socket.emit('submitRating', { memeId: currentMeme.id, rating });
  };

  const ratingLabel = () => {
    if (rating <= 2) return { text: 'TRASH', color: '#ef4444' };
    if (rating <= 4) return { text: 'MEH', color: '#f97316' };
    if (rating <= 6) return { text: 'OK', color: '#eab308' };
    if (rating <= 8) return { text: 'NICE', color: '#22c55e' };
    return { text: 'LEGENDARY', color: '#6366f1' };
  };

  const label = ratingLabel();
  const timerLimit = currentMeme?.timeLimit ?? 15;
  const timerProgress = (timeLeft / timerLimit) * 100;

  // Warte-Screen
  if (waiting || !currentMeme) {
    return (
      <div className="rating-wrapper">
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="rating-card rating-card--waiting">
          <div className="rating-eyebrow">● BEREIT</div>
          <h1 className="rating-title">Warte auf<br /><span>Meme...</span></h1>
          <div className="rating-waiting-dots">
            <div className="rating-dot" />
            <div className="rating-dot" />
            <div className="rating-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="rating-card">
        <div className="rating-header">
          <div className="rating-eyebrow">● BEWERTUNG</div>
          <h1 className="rating-title">Rate this <span>Meme</span></h1>
          <div className="rating-uploader">
            von {currentMeme.uploaderName}
            {currentMeme.totalMemes && (
              <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: '10px', fontSize: '0.85rem' }}>
                ({(currentMeme.memeIndex ?? 0) + 1} / {currentMeme.totalMemes})
              </span>
            )}
          </div>
        </div>

        <div className="timer-row">
          <span className="timer-label">TIME LEFT</span>
          <span className="timer-count" style={{ color: timeLeft <= 5 ? '#ef4444' : '#6366f1' }}>{timeLeft}</span>
        </div>
        <div className="timer-bar-wrap">
          <div className="timer-bar-fill" style={{ width: `${timerProgress}%`, background: timeLeft <= 5 ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
        </div>

        <div className="meme-frame">
          <img src={currentMeme.url} alt="Meme to rate" className="meme-img" />
        </div>

        <div className="slider-section">
          <div className="slider-meta">
            <span className="slider-label">DEINE BEWERTUNG</span>
            <span className="slider-value" style={{ color: label.color }}>
              {rating} / 10 &mdash; <span>{label.text}</span>
            </span>
          </div>
          <input type="range" min={1} max={10} step={1} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rating-slider" disabled={submitted} />
          <div className="slider-numbers">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`tick-num ${i + 1 === rating ? 'current' : ''}`} style={{ color: i + 1 === rating ? label.color : undefined }}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        <button className={`rating-submit-btn ${submitted ? 'submitted' : ''}`} onClick={handleSubmit} disabled={submitted}>
          {submitted ? '✓ BEWERTET — NÄCHSTES MEME...' : 'BEWERTUNG ABGEBEN'}
        </button>
      </div>
    </div>
  );
}