import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { FiTrash2, FiHeart, FiMessageCircle, FiUserPlus } from "react-icons/fi";

const messageFor = (type) => {
    switch (type) {
        case "like":
            return "liked your post";
        case "comment":
            return "commented on your post";
        case "follow":
            return "started following you";
        case "reply":
            return "replied to you";
        case "reaction":
            return "reacted to your message";
        /*default:
            return "sent you a notification";*/
    }
};

const iconFor = (type) => {
    switch (type) {
        case "like":
            return <FiHeart className="text-red-500" />;
        case "comment":
            return <FiMessageCircle className="text-blue-500" />;
        case "follow":
            return <FiUserPlus className="text-green-600" />;
        default:
            return <FiHeart />;
    }
};

export default function Notifications() {

    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications);
        } catch (err) {
            console.log(err);
        }
    };

    const markAllRead = async () => {
        try {
            await API.put("/notifications/read");
        } catch (err) {
            console.log(err);
        }
    };

    const removeNotification = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        markAllRead();
    }, []);

    useEffect(() => {

        socket.on("newNotification", (data) => {
            setNotifications((prev) => [data, ...prev]);
        });

        return () => socket.off("newNotification");

    }, []);

    return (
        <>
            <Navbar />

            <div className="max-w-2xl mx-auto mt-6 px-4">

                <h1 className="text-2xl font-bold mb-4">
                    Notifications
                </h1>

                {notifications.length === 0 ? (
                    <p className="text-gray-500">
                        No notifications yet
                    </p>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            className="bg-white p-4 mb-3 shadow rounded-xl flex items-center justify-between gap-3"
                        >
                            <Link
                                to={`/profile/${n.sender.username}`}
                                className="flex items-center gap-3 flex-1"
                            >
                                <img
                                    src={n.sender.profilePic || "https://via.placeholder.com/40"}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                />

                                <p className="flex items-center gap-2">
                                    {iconFor(n.type)}
                                    <span>
                                        <b>{n.sender.fullName}</b> {messageFor(n.type)}
                                    </span>
                                </p>
                            </Link>

                            <button
                                onClick={() => removeNotification(n._id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete notification"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))
                )}

            </div>
        </>
    );
}
