import React, { useEffect, useState } from 'react';
import '../styles/MemesRangliste.css';

interface MemeEntry {
  id: string;
  url: string;
  uploaderName: string;
  ratings: number[];
  averageRating: number;
}

interface PlayerEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export default function MemesLeaderboard() {
  const [memes, setMemes] = useState<MemeEntry[]>([]);
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Daten aus sessionStorage — wurden von MemeRating gespeichert
    const stored = sessionStorage.getItem('ranglisteData');
    if (stored) {
      const data = JSON.parse(stored);
      setMemes([...data.memes].sort((a: MemeEntry, b: MemeEntry) => b.averageRating - a.averageRating));
      setPlayers([...data.players].sort((a: PlayerEntry, b: PlayerEntry) => b.score - a.score));
      setLoading(false);
    }
  }, []);

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const ratingColor = (rating: number) => {
    if (rating >= 8.5) return '#6366f1';
    if (rating >= 6.5) return '#22c55e';
    if (rating >= 4.5) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="rl-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="rl-card">

        <div className="rl-header">
          <div className="rl-eyebrow">● ERGEBNIS</div>
          <h1 className="rl-title">Meme <span>Rangliste</span></h1>
        </div>

        <div className="rl-divider" />

        {loading && (
          <div className="rl-loading">
            <div className="rl-loading-dot" />
            <div className="rl-loading-dot" />
            <div className="rl-loading-dot" />
            <span>Warte auf Ergebnisse...</span>
          </div>
        )}

        {!loading && (
          <div className="rl-body">

            {/* LEFT: Memes */}
            <div className="rl-memes-col">
              <div className="rl-col-label">ALLE MEMES</div>
              <div className="rl-memes-list">
                {memes.length === 0 && (
                  <div className="rl-empty">Noch keine Memes bewertet</div>
                )}
                {memes.map((meme, idx) => (
                  <div key={meme.id} className={`rl-meme-item ${idx === 0 ? 'rl-meme-winner' : ''}`}>
                    <div className="rl-meme-rank">{rankIcon(idx + 1)}</div>
                    <div className="rl-meme-img-wrap">
                      <img src={meme.url} alt={`Meme von ${meme.uploaderName}`} className="rl-meme-img" />
                    </div>
                    <div className="rl-meme-info">
                      <span className="rl-meme-uploader">{meme.uploaderName}</span>
                      <span className="rl-meme-score" style={{ color: ratingColor(meme.averageRating) }}>
                        {meme.averageRating > 0 ? meme.averageRating.toFixed(1) : '—'}
                        <span className="rl-meme-score-max"> / 10</span>
                      </span>
                      <span className="rl-meme-ratings">
                        {meme.ratings.length} {meme.ratings.length === 1 ? 'Bewertung' : 'Bewertungen'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Spieler Rangliste */}
            <div className="rl-players-col">
              <div className="rl-col-label">SPIELER RANGLISTE</div>
              <div className="rl-players-list">
                {players.length === 0 && (
                  <div className="rl-empty">Noch keine Spielerdaten</div>
                )}
                {players.map((player) => (
                  <div key={player.id} className={`rl-player-row ${player.rank === 1 ? 'rl-player-first' : ''}`}>
                    <span className="rl-player-rank">{rankIcon(player.rank)}</span>
                    <span className="rl-player-name">{player.name}</span>
                    <span className="rl-player-score" style={{ color: ratingColor(player.score) }}>
                      {player.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}