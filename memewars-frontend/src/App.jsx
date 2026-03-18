import './styles/index.css'
import { Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import ReactPlate from "./views/Reactplate";
import SocketView from "./views/SocketView";
import LobbyView from './views/LobbyView';
import GameView from './views/GameView'; 
import MemeRating from './views/MemeRating';
import MemesRangliste from './views/MemesRangliste';


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
        <Route path="/rangliste" element={<MemesRangliste />}/>
      </Routes>
    </>
  );
}

export default App