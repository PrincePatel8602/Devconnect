const startServer = async () => {
    await connectDB();

    const server = http.createServer(app);

    initSocket(server);

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
};

startServer();