import { Server } from "socket.io";

let io;

// Store online users
const onlineUsers = new Map();

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {

        console.log("User Connected:", socket.id);

        // User joins
        socket.on("join", (userId) => {

            onlineUsers.set(userId, socket.id);

            socket.join(userId);

            io.emit(
                "onlineUsers",
                [...onlineUsers.keys()]
            );

        });

        // Join conversation room
        socket.on("joinConversation", (conversationId) => {

            socket.join(conversationId);

        });

        // Leave conversation room
        socket.on("leaveConversation", (conversationId) => {

            socket.leave(conversationId);

        });

        // Typing
        socket.on("typing", (data) => {

            socket
                .to(data.conversationId)
                .emit("typing", data);

        });

        // Stop typing
        socket.on("stopTyping", (conversationId) => {

            socket
                .to(conversationId)
                .emit("stopTyping");

        });

        // Disconnect
        socket.on("disconnect", () => {

            for (const [userId, socketId] of onlineUsers.entries()) {

                if (socketId === socket.id) {

                    onlineUsers.delete(userId);

                    break;

                }

            }

            io.emit(
                "onlineUsers",
                [...onlineUsers.keys()]
            );

            console.log("User Disconnected:", socket.id);

        });

    });

};

export const getIO = () => io;

export const getOnlineUsers = () => onlineUsers;