import './styles/App.css'
import HomeView from "./views/HomeView";


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