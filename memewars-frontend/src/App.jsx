import './styles/index.css'
import { Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import ReactPlate from "./views/Reactplate";
import SocketView from "./views/SocketView";
import LobbyView from './views/LobbyView';
import GameView from './views/GameView'; // <--- DIESE ZEILE HAT GEFEHLT!
import MemeRating from './views/MemeRating';


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
      </Routes>
    </>
  );
}

export default App