import { io } from "socket.io-client";
import { BACKEND_URL } from "../assets/config";

/**
 * Socket.io Client Initialisierung
 *
 * Verbindung zum Backend wird sofort hergestellt (autoConnect: true)
 * Socket-ID wird global verfügbar gemacht für alle Views
 *
 * Wichtige Socket-Events (Listener werden in den Views registriert):
 * - getLobbies: Alle verfügbaren Lobbies abrufen
 * - createLobby: Neue Lobby erstellen
 * - joinLobby: Existierende Lobby beitreten
 * - getLobbyState: Aktuellen Lobby-Status abrufen
 * - toggleReady: Ready-Status wechseln
 * - startGame: Spiel starten (nur Host)
 * - submitCaption: Meme Caption einreichen
 * - submitRating: Meme-Rating abgeben
 **/

export const socket = io(BACKEND_URL, {
  autoConnect: true, // Sofort nach Seiten-Load verbinden
});

// Debug: Verbindungsstatus in Konsole
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
