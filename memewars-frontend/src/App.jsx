import './styles/index.css'
import { Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import ReactPlate from "./views/ReactPlate";
import SocketView from "./views/SocketView";
import LobbyView from './views/LobbyView';
import GameView from './views/GameView'; 
import MemeRating from './views/MemeRating';
import MemesLeaderboard from './views/MemesLeaderboard';


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