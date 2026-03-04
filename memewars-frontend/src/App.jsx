import './styles/App.css'
import ReactPlate from './views/ReactPlate';
import SocketView from './views/SocketView';
import { Routes, Route } from 'react-router-dom'

function App() {

   return (
    <>
      <Routes>
        {/* Hier HomeView einfügen mit / */}
        <Route path="/reactplate" element={<ReactPlate />} />
        <Route path="/socket" element={<SocketView />} />
      </Routes>
    </>
  );
}

export default App
