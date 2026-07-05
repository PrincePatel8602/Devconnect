import { io } from "socket.io-client";

const socket = io("https://devconnect-1-rbax.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;