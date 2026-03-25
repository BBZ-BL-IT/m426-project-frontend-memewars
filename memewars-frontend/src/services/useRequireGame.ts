import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";

export function useRequireGame() {
  const navigate = useNavigate();

  useEffect(() => {
    // Kein Socket → zurück zum Start
    if (!socket.connected) {
      navigate("/");
      return;
    }

    // Kein Spiel im sessionStorage → zurück zum Start
    const hasGame = sessionStorage.getItem("ranglisteData") || 
                    sessionStorage.getItem("firstMeme") ||
                    sessionStorage.getItem("submissions");
                    
    if (!hasGame) {
      navigate("/");
    }
  }, []);
}