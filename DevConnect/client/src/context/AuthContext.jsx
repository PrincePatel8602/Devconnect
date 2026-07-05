import { createContext, useContext, useState, useEffect } from "react";
import socket from "../socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);

    }, []);

    useEffect(() => {

        if (user) {
            socket.emit("join", user._id);
        }

        return () => {
            socket.off("onlineUsers");
        };

    }, [user]);

    const login = (data) => {

        setUser(data.user);

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

    };

    const logout = () => {

        socket.disconnect();

        setUser(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);