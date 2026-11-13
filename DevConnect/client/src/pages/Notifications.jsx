import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { FiTrash2, FiHeart, FiMessageCircle, FiUserPlus } from "react-icons/fi";

const messageFor = (n) => {
    switch (n.type) {
        case "like":
            return n.entityType === "reel"
                ? "liked your reel"
                : "liked your post";

        case "comment":
            return n.entityType === "reel"
                ? "commented on your reel"
                : "commented on your post";

        case "follow":
            return "started following you";

        case "reply":
            return "replied to you";

        case "reaction":
            return "reacted to your message";

        case "message":
            return "sent you a message";

        default:
            return "sent you a notification";
    }
};

// Text shown after the name(s). Handles counts and "and N others".
const textFor = (g) => {
    const n = g.items[0];
    const others = g.senders.length - 1;
    const who = others > 0 ? ` and ${others} other${others > 1 ? "s" : ""}` : "";

    if (n.type === "message" && g.total > 1) {
        return { who, text: `sent you ${g.total} messages` };
    }
    if (n.type === "comment" && g.total > 1 && others === 0) {
        return {
            who,
            text: `commented ${g.total} times on your ${n.entityType === "reel" ? "reel" : "post"}`,
        };
    }
    return { who, text: messageFor(n) };
};

// Merge notifications into groups:
//  - likes / comments on the same post or reel  -> one row ("A and 3 others liked your post")
//  - messages from the same person              -> one row ("A sent you 5 messages")
const groupNotifications = (list) => {
    const groups = new Map();

    list.forEach((n) => {
        const target = n.post || n.reel || "";
        let key;

        if (n.type === "like" || n.type === "comment") {
            key = `${n.type}-${n.entityType}-${target}`;
        } else if (n.type === "message" || n.type === "reaction") {
            key = `${n.type}-${n.sender?._id}`;
        } else {
            key = n._id; // follow, reply... stay separate
        }

        if (!groups.has(key)) {
            groups.set(key, { key, items: [], senders: [], total: 0, unread: false });
        }

        const g = groups.get(key);
        g.items.push(n);
        g.total += n.count || 1;
        if (!n.read) g.unread = true;
        if (!g.senders.some((s) => s._id === n.sender._id)) g.senders.push(n.sender);
    });

    return Array.from(groups.values()); // list is already newest-first
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

    const removeGroup = async (group) => {
        try {
            const ids = group.items.map((n) => n._id);
            await Promise.all(ids.map((id) => API.delete(`/notifications/${id}`)));
            setNotifications((prev) => prev.filter((n) => !ids.includes(n._id)));
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        markAllRead();
    }, []);

    // ✅ FIXED SOCKET (NO DUPLICATES)
    useEffect(() => {
        socket.on("newNotification", (data) => {
            // a merged notification comes back with the same _id:
            // replace the old copy and move it to the top
            setNotifications((prev) => [
                data,
                ...prev.filter((n) => n._id !== data._id),
            ]);
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
                    groupNotifications(notifications).map((g) => {
                        const n = g.items[0]; // newest in the group
                        const { who, text } = textFor(g);

                        return (
                            <div
                                key={g.key}
                                className="bg-white p-4 mb-3 shadow rounded-xl flex items-center justify-between gap-3"
                            >
                                <Link
                                    to={
                                        n.type === "message"
                                            ? "/chat"
                                            : `/profile/${n.sender.username}`
                                    }
                                    className="flex items-center gap-3 flex-1"
                                >
                                    <img
                                        src={
                                            n.sender.profilePic ||
                                            "/Ultimate.jpeg"
                                        }
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                    <p className="flex items-center gap-2">
                                        {iconFor(n.type)}
                                        <span>
                                            <b>{n.sender.fullName}</b>
                                            {who} {text}
                                        </span>
                                    </p>
                                </Link>

                                <button
                                    onClick={() => removeGroup(g)}
                                    className="text-gray-400 hover:text-red-500"
                                    title="Delete notification"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        );
                    })
                )}

            </div>
        </>
    );
}