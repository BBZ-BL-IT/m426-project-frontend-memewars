# MemeWars Frontend

Unser Frontend Repository für das MemeWars Projekt aus dem Modul 426

## 📋 Spiel-Ablauf

1. **HomeView** (`/`): Spieler gibt Namen ein und wählt Lobby (neu erstellen oder beitreten)
2. **LobbyView** (`/lobby`): Wartebereich - Host startet Spiel wenn alle bereit sind
3. **GameView** (`/game`): Spieler haben 45 Sekunden um einen Meme-Caption zu schreiben
4. **MemeRating** (`/rating`): 15 Sekunden zum Bewerten aller Captions (1-10 Punkte)
5. **MemesLeaderboard** (`/leaderboard`): Endergebnis mit Meme-Rankings und Spieler-Scores

## 📚 Architektur

```
src/
├── views/          # Alle Spiel-Screens (mit TypeScript/JSX)
├── components/     # Wiederverwendbare UI-Komponenten
├── services/       # API-Calls (REST, momentan leer)
├── socket/         # Socket.io Kommunikation mit Backend
├── styles/         # CSS für alle Views
└── assets/         # Konfiguration (Backend-URL)
```

## 🔌 Socket.io Events

**Emittiert vom Frontend:**

- `getLobbies` - Alle verfügbaren Lobbies abrufen
- `createLobby` - Neue Lobby erstellen
- `joinLobby` - Existierende Lobby beitreten
- `toggleReady` - Ready-Status wechseln
- `startGame` - Spiel starten (nur Host)
- `submitCaption` - Fertige Caption einreichen
- `submitRating` - Bewertung abgeben

**Empfängt vom Backend:**

- `lobbyList` - Liste aller Lobbies
- `lobbyUpdate` - Spieler-Status in der Lobby
- `startCountdown` - Countdown vor Spielstart
- `submissionsUpdate` - Wie viele Spieler eingereicht haben
- `currentMeme` - Nächstes Meme zum Bewerten
- `ranglisteData` - Endergebnis mit Rankings

## 🎨 Styling

Alle Views nutzen ein einheitliches Neon-Cyberpunk-Design mit:

- Gradient-Hintergründe (`bg-grid`, `bg-glow`)
- Animationen für Timer und Übergänge
- Responsive Design für verschiedene Bildschirmgrößen

In das Verzeichnis wechseln

    cd memewars-frontend

React installieren

    npm install react

Frontend starten

    npm run dev

## Startseite

Auf [localhost:5173](localhost:5173) nun die Website aufrufen

## Verwendete Namenskonvention:

camelCase
