import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { BACKEND_URL } from "../assets/config";

function SocketView() {
  const [message, setMessage] = useState("");
  const [socketMsg, setSocketMsg] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setSocketMsg(`Verbunden mit SocketServer: ${socket.id}`);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    fetch(BACKEND_URL) // URL zum Backend
      .then((res) => res.text()) // oder res.json() falls JSON
      .then((data) => setMessage(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Socket läuft</h1>
      <p>{socketMsg}</p>
      <h1>Nachricht vom Backend:</h1>
      <p>{message}</p>
    </div>
  );
}

export default SocketView;
