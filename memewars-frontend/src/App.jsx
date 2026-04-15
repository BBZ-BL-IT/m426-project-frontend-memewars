import './styles/index.css'
import { Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import ReactPlate from "./views/Reactplate";
import SocketView from "./views/SocketView";
import LobbyView from './views/LobbyView';
import GameView from './views/GameView'; 
import MemeRating from './views/MemeRating';
import MemesLeaderboard from './views/MemesLeaderboard';

/**
 * MemeWars Spiel-Navigation
 * 
 * Ablauf:
 * 1. / = HomeView: Spieler wählt Name, erstellt oder tritt Lobby bei
 * 2. /lobby = LobbyView: Wartebereich, alle Spieler müssen "Bereit" sein
 * 3. /game = GameView: 45 Sekunden Zeit zum Caption schreiben
 * 4. /rating = MemeRating: Je Meme 15 Sekunden zum Bewerten (1-10)
 * 5. /leaderboard = MemesLeaderboard: Endergebnis zeigen
 * 
 * Debug-Routes:
 * - /reactplate: Vite + React Template (kann gelöscht werden)
 * - /socket: Socket-Verbindungs-Test
 */

function App() {

   return (
    <>
      <Routes>
        <Route path="/" element={<HomeView/>}/>
        <Route path="/lobby" element={<LobbyView/>}/>
        <Route path="/reactplate" element={<ReactPlate />} />
        <Route path="/socket" element={<SocketView />} />
        <Route path="/game" element={<GameView />}/>
        <Route path="/rating" element={<MemeRating />}/>
        <Route path="/leaderboard" element={<MemesLeaderboard />}/>
      </Routes>
    </>
  );
}

export default App