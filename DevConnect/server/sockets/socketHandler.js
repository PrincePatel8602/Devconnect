const onlineUsers = new Map();

const socketHandler = (io) => {

    io.on("connection", (socket) => {

        console.log("User Connected:", socket.id);

        socket.on("join", (userId) => {

    onlineUsers.set(userId, socket.id);

    socket.join(userId);

    io.emit(
        "onlineUsers",
        Array.from(onlineUsers.keys())
    );

});

        // Join a conversation room
        socket.on("joinConversation", (conversationId) => {

            socket.join(conversationId);

        });
         socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
});
        // Typing
        socket.on("typing", (data) => {

            socket.to(data.conversationId).emit("typing", data);

        });

        // Stop Typing
        socket.on("stopTyping", (conversationId) => {

            socket.to(conversationId).emit("stopTyping");

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
                Array.from(onlineUsers.keys())
            );

            console.log("Disconnected:", socket.id);

        });

    });

};

export default socketHandler;