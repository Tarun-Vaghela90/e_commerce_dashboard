import { io } from "socket.io-client";

const socket = io('http://localhost:5000'); // Change if backend on different URL
export default socket;