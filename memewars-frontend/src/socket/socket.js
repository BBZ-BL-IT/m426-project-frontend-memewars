import { io } from "socket.io-client";
import { BACKEND_URL } from "../assets/config";

export const socket = io(BACKEND_URL, {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
