import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);

        initSocket(server);

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();