import { useEffect, useState, useRef } from "react";
import { FaSearch, FaEdit, FaCommentDots } from "react-icons/fa";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Chat() {

    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");
const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const searchInputRef = useRef(null);

    // FETCH conversations
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

       const res = await API.get(
    `/users/search?keyword=${value}`
);

        setUsers(res.data.users || []);

    } catch (err) {

        console.log(err);

    }

};
const createConversation = async (userId) => {

    try {

        const res = await API.post(
            `/chat/${userId}`
        );

        fetchConversations();

        setSelected(res.data.conversation);

        setSearch("");

        setUsers([]);

    } catch (err) {

        console.log(err);

    }

};
const changeWallpaper = async (file) => {

    if (!file || !selected) return;

    try {

        const formData = new FormData();

        formData.append("wallpaper", file);

        const res = await API.put(
            `/chat/wallpaper/${selected._id}`,
            formData
        );

        fetchConversations();

        setSelected({
            ...selected,
            wallpaper: res.data.wallpaper,
        });

    } catch (err) {

        console.log(err);

    }

};
    useEffect(() => {
        fetchConversations();
    }, []);

    // JOIN SOCKET
    useEffect(() => {
        if (user) {
            socket.emit("join", user._id);
        }
    }, [user]);

    // ONLINE USERS
    useEffect(() => {
        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => socket.off("onlineUsers");
    }, []);

    return (
        <>
            <Navbar />

            <div className="max-w-6xl mx-auto mt-6 flex gap-6">

                {/* LEFT SIDE */}
                <div className="w-1/3 bg-white shadow rounded p-4">

          <div className="flex items-center justify-between mb-5">
    <h2 className="text-2xl font-bold">Messages</h2>

    <button
        onClick={() => searchInputRef.current?.focus()}
        className="p-2 rounded-full hover:bg-gray-100"
        title="Start a new message"
    >
        ✏️
    </button>
</div>         

 <div className="relative mb-5">

    <FaSearch className="absolute left-3 top-3 text-gray-400" />

    <input
        ref={searchInputRef}
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e)=>searchUsers(e.target.value)}
        className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 outline-none"
    />

</div>
{
users.length > 0 && (

<div className="mb-4">

    {
    users.map((u) => (

        <div
            key={u._id}
            onClick={() => createConversation(u._id)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
        >

            <img
                src={
                    u.profilePic ||
                    "https://via.placeholder.com/40"
                }
                alt=""
                className="w-10 h-10 rounded-full"
            />

            <div>

                <p className="font-semibold">
                    {u.fullName}
                </p>

                <p className="text-gray-500">
                    @{u.username}
                </p>

            </div>

        </div>

    ))
    }

</div>

)
}
            {conversations.length === 0 ? (
    <p className="text-gray-500 text-center mt-4">
        No conversations yet.
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
        return (
            <div
                key={chat._id}
                onClick={() => setSelected(chat)}
                className="flex items-center justify-between p-3 hover:bg-gray-100 rounded cursor-pointer mb-2"
            >
                <div className="flex items-center gap-3">

                    <img
                        src={
                            otherUser?.profilePic ||
                            "https://via.placeholder.com/40"
                        }
                        alt={otherUser?.fullName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                    />

                    <span>{otherUser?.fullName}</span>

                </div>

                

<div className="flex items-center gap-2">

    {onlineUsers.includes(otherUser?._id) && (
        <span className="w-3 h-3 rounded-full bg-green-500"></span>
    )}

    {unread > 0 && (
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unread}
        </span>
    )}

</div>
            </div>
        );
    })
)}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 bg-white shadow rounded">

    {selected && (

        <div className="border-b p-3">

            <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                    changeWallpaper(e.target.files[0])
                }
            />

        </div>

    )}

                    {selected ? (
                      <ChatWindow
    conversation={selected}
    wallpaper={selected?.wallpaper}
/>
                    ) : (
                        <div className="flex justify-center items-center h-[80vh] text-gray-500">
                            Select a conversation
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}