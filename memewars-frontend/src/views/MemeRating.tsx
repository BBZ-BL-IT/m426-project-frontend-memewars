import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MemeRating.css';
import { socket } from '../socket/socket';

interface MemeRatingProps {
  memeUrl?: string;
  onSubmit?: (rating: number) => void;
}

export default function MemeRating({ memeUrl, onSubmit }: MemeRatingProps) {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    socket.emit('submitRating', { rating });
    onSubmit?.(rating);
  };

  const ratingLabel = () => {
    if (rating <= 2) return { text: 'TRASH', color: '#ef4444' };
    if (rating <= 4) return { text: 'MEH', color: '#f97316' };
    if (rating <= 6) return { text: 'OK', color: '#eab308' };
    if (rating <= 8) return { text: 'NICE', color: '#22c55e' };
    return { text: 'LEGENDARY', color: '#6366f1' };
  };

  const label = ratingLabel();
  const timerProgress = (timeLeft / 30) * 100;

  return (
    <div className="rating-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="rating-card">

        {/* Header */}
        <div className="rating-header">
          <div className="rating-eyebrow">● BEWERTUNG</div>
          <h1 className="rating-title">
            Rate this <span>Meme</span>
          </h1>
        </div>

        {/* Timer Bar */}
        <div className="timer-row">
          <span className="timer-label">TIME LEFT</span>
          <span className="timer-count" style={{ color: timeLeft <= 5 ? '#ef4444' : '#6366f1' }}>
            {timeLeft}s
          </span>
        </div>
        <div className="timer-bar-wrap">
          <div
            className="timer-bar-fill"
            style={{
              width: `${timerProgress}%`,
              background: timeLeft <= 5
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : 'linear-gradient(90deg, #6366f1, #a855f7)',
            }}
          />
        </div>

        {/* Meme Image */}
        <div className="meme-frame">
          <img
            src={memeUrl ?? 'https://api.dicebear.com/7.x/bottts/svg?seed=memewars'}
            alt="Meme to rate"
            className="meme-img"
          />
        </div>

        {/* Slider */}
        <div className="slider-section">
          <div className="slider-meta">
            <span className="slider-label">DEINE BEWERTUNG</span>
            <span className="slider-value" style={{ color: label.color }}>
              {rating} / 10 &mdash; <span>{label.text}</span>
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rating-slider"
            disabled={submitted}
          />

          <div className="slider-numbers">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`tick-num ${i + 1 === rating ? 'current' : ''}`}
                style={{ color: i + 1 === rating ? label.color : undefined }}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`rating-submit-btn ${submitted ? 'submitted' : ''}`}
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? '✓ BEWERTET' : 'BEWERTUNG ABGEBEN'}
        </button>

      </div>
    </div>
  );
}