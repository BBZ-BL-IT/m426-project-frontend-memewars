import { io } from "socket.io-client";

export const socket = io("http://10.142.166.167:8080", {
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
