import { useEffect, useState, useRef } from "react";
import { FiSearch, FiEdit } from "react-icons/fi";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const timeAgo = (date) => {

    if (!date) return "";

    const diff = (Date.now() - new Date(date).getTime()) / 1000;

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });

};

const previewFor = (chat, myId) => {

    const last = chat.lastMessage;

    if (!last) return "Say hello 👋";

    const prefix = last.sender?._id === myId ? "You: " : "";

    if (last.image) return `${prefix}📷 Photo`;
    if (last.audio) return `${prefix}🎤 Voice message`;
    if (last.text) return `${prefix}${last.text}`;

    return `${prefix}Sent a message`;

};

export default function Chat() {

    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const searchInputRef = useRef(null);

    const fetchConversations = async () => {
        try {
            const res = await API.get("/chat");
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.log(err);
            setConversations([]);
        }
    };

    const searchUsers = async (value) => {

        setSearch(value);

        if (!value.trim()) {
            setUsers([]);
            return;
        }

        try {

            const res = await API.get(`/users/search?keyword=${value}`);
            setUsers(res.data.users || []);

        } catch (err) {

            console.log(err);

        }

    };

    const createConversation = async (userId) => {

        try {

            const res = await API.post(`/chat/${userId}`);

            fetchConversations();
            setSelected(res.data.conversation);
            setSearch("");
            setUsers([]);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (user) {
            socket.emit("join", user._id);
        }
    }, [user]);

    useEffect(() => {

        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => socket.off("onlineUsers");

    }, []);

    return (
        <>
            <Navbar />

            <div className="max-w-6xl mx-auto mt-2 sm:mt-4 border rounded-2xl bg-white overflow-hidden flex h-[calc(100dvh-72px)] sm:h-[calc(100dvh-96px)] shadow-sm">

                {/* LEFT SIDE — conversation list */}
                <div
                    className={`w-full md:w-[380px] border-r flex-col ${
                        selected ? "hidden md:flex" : "flex"
                    }`}
                >

                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="text-xl font-bold">{user?.username}</h2>

                        <button
                            onClick={() => searchInputRef.current?.focus()}
                            className="p-2 rounded-full hover:bg-gray-100 text-xl"
                            title="Start a new message"
                        >
                            <FiEdit />
                        </button>
                    </div>

                    <div className="relative mx-4 mb-3">

                        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />

                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => searchUsers(e.target.value)}
                            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 outline-none text-sm"
                        />

                    </div>

                    <div className="flex-1 overflow-y-auto">

                        {users.length > 0 && (

                            <div className="mb-2">

                                <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase">
                                    Users
                                </p>

                                {users.map((u) => (

                                    <div
                                        key={u._id}
                                        onClick={() => createConversation(u._id)}
                                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer"
                                    >

                                        <img
                                            src={u.profilePic || "https://via.placeholder.com/44"}
                                            alt=""
                                            className="w-11 h-11 rounded-full object-cover"
                                        />

                                        <div>
                                            <p className="font-semibold text-sm">{u.fullName}</p>
                                            <p className="text-gray-500 text-sm">@{u.username}</p>
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                        {conversations.length === 0 ? (

                            <p className="text-gray-500 text-center mt-8 px-6 text-sm">
                                No messages yet. Search for someone to start chatting.
                            </p>

                        ) : (

                            conversations.map((chat) => {

                                const otherUser = chat.participants.find(
                                    (p) => p._id !== user?._id
                                );

                                const unread =
                                    chat.unreadCounts?.[user._id] ||
                                    chat.unreadCounts?.get?.(user._id) ||
                                    0;

                                const isOnline = onlineUsers.includes(otherUser?._id);
                                const isSelected = selected?._id === chat._id;

                                return (

                                    <div
                                        key={chat._id}
                                        onClick={() => setSelected(chat)}
                                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer ${
                                            isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                                        }`}
                                    >

                                        <div className="relative shrink-0">

                                            <img
                                                src={otherUser?.profilePic || "https://via.placeholder.com/48"}
                                                alt={otherUser?.fullName || "User"}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />

                                            {isOnline && (
                                                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                                            )}

                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <p className={`text-sm truncate ${unread > 0 ? "font-bold text-black" : "font-medium text-gray-900"}`}>
                                                {otherUser?.fullName}
                                            </p>

                                            <p className={`text-sm truncate ${unread > 0 ? "font-semibold text-black" : "text-gray-500"}`}>
                                                {previewFor(chat, user._id)} · {timeAgo(chat.lastMessage?.createdAt || chat.updatedAt)}
                                            </p>

                                        </div>

                                        {unread > 0 && (
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                                        )}

                                    </div>

                                );

                            })

                        )}

                    </div>

                </div>

                {/* RIGHT SIDE — active conversation */}
                <div className={`flex-1 flex-col ${selected ? "flex" : "hidden md:flex"}`}>

                    {selected ? (

                        <ChatWindow
                            key={selected._id}
                            conversation={selected}
                            isOnline={onlineUsers.includes(
                                selected.participants.find((p) => p._id !== user?._id)?._id
                            )}
                            onBack={() => setSelected(null)}
                        />

                    ) : (

                        <div className="flex-1 flex flex-col justify-center items-center h-full text-gray-400 gap-3">
                            <FiEdit className="text-5xl" />
                            <p className="text-lg font-medium text-gray-600">Your messages</p>
                            <p className="text-sm">Select a conversation to start chatting</p>
                        </div>

                    )}

                </div>

            </div>
        </>
    );
}
