import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import { FiArrowLeft, FiImage, FiSend } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function ChatWindow({ conversation, isOnline, onBack, onChangeWallpaper }) {

    const isSameDay = (a, b) =>
        new Date(a).toDateString() === new Date(b).toDateString();

    const formatDateSeparator = (date) => {

        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (isSameDay(d, today)) return "Today";
        if (isSameDay(d, yesterday)) return "Yesterday";

        return d.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        });

    };

    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);

    const [typing, setTyping] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const [replyMessage, setReplyMessage] = useState(null);

    const [audio, setAudio] = useState(null);
    const [recording, setRecording] = useState(false);

    const [showEmojiPicker, setShowEmojiPicker] =
        useState(false);

    const [activeMenu, setActiveMenu] = useState(null);
    const [viewImage, setViewImage] = useState(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const messagesContainerRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const bottomRef = useRef(null);

    const otherUser = conversation?.participants?.find(
        (p) => p._id !== user?._id
    );

    // ----------------------------
    // JOIN ROOM
    // ----------------------------

    useEffect(() => {

        if (!conversation) return;

        fetchMessages();

        markMessagesSeen();

        socket.emit(
            "joinConversation",
            conversation._id
        );

        return () => {

            socket.emit(
                "leaveConversation",
                conversation._id
            );

        };

    }, [conversation]);

    // ----------------------------
    // NEW MESSAGE
    // ----------------------------

    useEffect(() => {

        const handleNewMessage = (message) => {

            if (
                message.conversation !==
                conversation?._id
            )
                return;

            setMessages((prev) => {

                const exists = prev.some(
                    (msg) => msg._id === message._id
                );

                if (exists) return prev;

                return [...prev, message];

            });

        };

        socket.on(
            "newMessage",
            handleNewMessage
        );

        return () =>
            socket.off(
                "newMessage",
                handleNewMessage
            );

    }, [conversation]);

    // ----------------------------
    // TYPING
    // ----------------------------

    useEffect(() => {

        socket.on("typing", () => {

            setTyping(true);

        });

        socket.on("stopTyping", () => {

            setTyping(false);

        });

        return () => {

            socket.off("typing");
            socket.off("stopTyping");

        };

    }, []);

    // ----------------------------
    // SEEN
    // ----------------------------

    useEffect(() => {

        socket.on("messagesSeen", () => {

            setMessages((prev) =>
                prev.map((msg) => ({
                    ...msg,
                    seen: true,
                }))
            );

        });

        return () => {

            socket.off("messagesSeen");

        };

    }, []);

    // ----------------------------
    // DELETE
    // ----------------------------

    useEffect(() => {

        socket.on(
            "messageDeleted",
            (messageId) => {

                setMessages((prev) =>
                    prev.filter(
                        (msg) =>
                            msg._id !== messageId
                    )
                );

            }
        );

        return () => {

            socket.off("messageDeleted");

        };

    }, []);

    // ----------------------------
    // EDIT
    // ----------------------------

    useEffect(() => {

        socket.on(
            "messageEdited",
            (updated) => {

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === updated._id
                            ? updated
                            : msg
                    )
                );

            }
        );

        return () => {

            socket.off("messageEdited");

        };

    }, []);

    // ----------------------------
    // REACTION
    // ----------------------------

    useEffect(() => {

        socket.on(
            "messageReaction",
            (updated) => {

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === updated._id
                            ? updated
                            : msg
                    )
                );

            }
        );

        return () => {

            socket.off("messageReaction");

        };

    }, []);

    // ----------------------------
    // PIN
    // ----------------------------

    useEffect(() => {

        socket.on(
            "messagePinned",
            (updated) => {

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === updated._id
                            ? updated
                            : msg
                    )
                );

            }
        );

        return () => {

            socket.off("messagePinned");

        };

    }, []);

    // ----------------------------
    // AUTO SCROLL
    // ----------------------------

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);
        // ----------------------------
    // FETCH MESSAGES
    // ----------------------------

    const fetchMessages = async () => {

        try {

            const res = await API.get(
                `/messages/${conversation._id}`
            );

            setMessages(res.data.messages || []);

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // EMOJI
    // ----------------------------

    const onEmojiClick = (emojiData) => {

        setText((prev) => prev + emojiData.emoji);

    };

    // ----------------------------
    // REACT MESSAGE
    // ----------------------------

    const reactMessage = async (
        messageId,
        emoji
    ) => {

        try {

            await API.put(
                `/messages/reaction/${messageId}`,
                {
                    emoji,
                }
            );

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // SEND MESSAGE
    // ----------------------------

    const sendMessage = async () => {

        if (
            !text.trim() &&
            !image &&
            !audio
        )
            return;

        try {

            const formData = new FormData();

            formData.append(
                "conversationId",
                conversation._id
            );

            formData.append(
                "text",
                text
            );

            if (replyMessage) {

                formData.append(
                    "replyTo",
                    replyMessage._id
                );

            }

            if (image) {

                formData.append(
                    "image",
                    image
                );

            }

            if (audio) {

                formData.append(
                    "audio",
                    new File(
                        [audio],
                        "voice.webm",
                        {
                            type:
                                "audio/webm",
                        }
                    )
                );

            }

            await API.post(
                `/messages/${conversation._id}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            socket.emit(
                "stopTyping",
                conversation._id
            );

            setText("");
            setImage(null);
            setAudio(null);
            setReplyMessage(null);
            setShowEmojiPicker(false);

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // QUICK HEART (tap the heart button with an empty composer)
    // ----------------------------

    const sendHeart = async () => {

        try {

            const formData = new FormData();

            formData.append("conversationId", conversation._id);
            formData.append("text", "❤️");

            await API.post(
                `/messages/${conversation._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // MARK AS SEEN
    // ----------------------------

    const markMessagesSeen =
        async () => {

            try {

                await API.put(
                    `/messages/seen/${conversation._id}`
                );

            } catch (error) {

                console.log(error);

            }

        };

    // ----------------------------
    // DELETE
    // ----------------------------

    const deleteMessage =
        async (messageId) => {

            try {

                await API.delete(
                    `/messages/${messageId}`
                );

            } catch (error) {

                console.log(error);

            }

        };

    // ----------------------------
    // SAVE EDIT
    // ----------------------------

    const saveEdit = async () => {

        try {

            await API.put(
                `/messages/edit/${editingId}`,
                {
                    text: editText,
                }
            );

            setEditingId(null);
            setEditText("");

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // PIN
    // ----------------------------

    const pinMessage = async (
        messageId
    ) => {

        try {

            await API.put(
                `/messages/pin/${messageId}`
            );

        } catch (error) {

            console.log(error);

        }

    };

    // ----------------------------
    // START RECORDING
    // ----------------------------

    const startRecording =
        async () => {

            const stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        audio: true,
                    }
                );

            mediaRecorderRef.current =
                new MediaRecorder(stream);

            audioChunks.current = [];

            mediaRecorderRef.current.start();

            setRecording(true);

            mediaRecorderRef.current.ondataavailable =
                (e) => {

                    audioChunks.current.push(
                        e.data
                    );

                };

        };

    // ----------------------------
    // STOP RECORDING
    // ----------------------------

    const stopRecording = () => {

        mediaRecorderRef.current.stop();

        mediaRecorderRef.current.onstop =
            () => {

                const blob =
                    new Blob(
                        audioChunks.current,
                        {
                            type:
                                "audio/webm",
                        }
                    );

                setAudio(blob);

                audioChunks.current = [];

                setRecording(false);

            };

    };
        return (

        <div
            className="relative flex flex-col h-full bg-cover bg-center bg-gray-50"
            style={{
                backgroundImage: conversation?.wallpaper
                    ? `url(${conversation.wallpaper})`
                    : "none",
            }}
        >

            {/* HEADER */}

            <div className="sticky top-0 z-20 bg-white border-b px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2">

                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">

                    <button
                        onClick={onBack}
                        className="md:hidden text-xl text-gray-700 shrink-0"
                    >
                        <FiArrowLeft />
                    </button>

                    <div className="relative shrink-0">

                        <img
                            src={
                                otherUser?.profilePic ||
                                "https://via.placeholder.com/50"
                            }
                            alt=""
                            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border"
                        />

                        {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}

                    </div>

                    <div className="min-w-0">

                        <h2 className="font-semibold text-sm sm:text-base leading-tight truncate">
                            {otherUser?.fullName}
                        </h2>

                        <p className="text-xs text-gray-500 truncate">
                            {isOnline ? "Active now" : `@${otherUser?.username}`}
                        </p>

                    </div>

                </div>

                <button
                    onClick={onChangeWallpaper}
                    className="text-lg text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 shrink-0"
                    title="Change chat theme"
                >
                    <FiImage />
                </button>

            </div>

            {/* PINNED MESSAGE */}

            {
                messages.find(msg => msg.pinned) && (

                    <div className="bg-yellow-50 border-b px-3 sm:px-4 py-2.5 sm:py-3">

                        <p className="text-xs font-semibold text-yellow-700">
                            📌 PINNED MESSAGE
                        </p>

                        <p className="text-sm mt-1">
                            {messages.find(msg => msg.pinned).text}
                        </p>

                    </div>

                )
            }

            {/* CHAT AREA */}

            <div
                ref={messagesContainerRef}
                onScroll={() => {

                    const el = messagesContainerRef.current;
                    if (!el) return;

                    const distanceFromBottom =
                        el.scrollHeight - el.scrollTop - el.clientHeight;

                    setShowScrollBtn(distanceFromBottom > 300);

                }}
                className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 relative"
            >

                {

                    messages.map((msg, index) => {

                        const prevMsg = messages[index - 1];

                        const showDateSeparator =
                            !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);

                        const isLastMessage = index === messages.length - 1;

                        return (
                        <div key={msg._id}>

                        {showDateSeparator && (

                            <div className="flex justify-center my-4">
                                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                                    {formatDateSeparator(msg.createdAt)}
                                </span>
                            </div>

                        )}

                        <div
                            className={`flex mb-5 ${
                                msg.sender?._id === user._id
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >

                            <div className="group relative max-w-[82%] sm:max-w-[72%]">

                                {/* REPLY */}

                                {
                                    msg.replyTo && (

                                        <div className="bg-gray-100 border-l-4 border-blue-500 rounded px-3 py-2 mb-2">

                                            <p className="text-xs font-semibold">

                                                {
                                                    msg.replyTo?.sender
                                                        ?.fullName
                                                }

                                            </p>

                                            <p className="text-sm text-gray-600">

                                                {msg.replyTo.text}

                                            </p>

                                        </div>

                                    )
                                }

                                {/* TEXT BUBBLE */}

                                {
                                    msg.text && (

                                        editingId === msg._id ? (

                                            <div className="flex items-center gap-2">

                                                <input
                                                    value={editText}
                                                    onChange={(e) =>
                                                        setEditText(e.target.value)
                                                    }
                                                    className="px-2 py-1 rounded border text-black flex-1"
                                                />

                                                <button
                                                    onClick={saveEdit}
                                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                                >
                                                    Save
                                                </button>

                                            </div>

                                        ) : (

                                            <div
                                                onDoubleClick={() =>
                                                    reactMessage(msg._id, "❤️")
                                                }
                                                className={`rounded-3xl px-4 py-2.5 shadow-sm select-none cursor-pointer ${
                                                    msg.sender?._id === user._id
                                                        ? "bg-blue-600 text-white rounded-br-md"
                                                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                                                }`}
                                            >

                                                <p className="whitespace-pre-wrap-break-words">

                                                    {msg.text}

                                                    {
                                                        msg.edited && (
                                                            <span className="ml-2 text-xs italic opacity-70">
                                                                (edited)
                                                            </span>
                                                        )
                                                    }

                                                </p>

                                            </div>

                                        )

                                    )
                                }

                                {/* IMAGE */}

                                {
                                    msg.image && (

                                        <img
                                            src={msg.image}
                                            alt=""
                                            onClick={() => setViewImage(msg.image)}
                                            onDoubleClick={() =>
                                                reactMessage(msg._id, "❤️")
                                            }
                                            className="mt-3 rounded-2xl max-h-80 object-cover border cursor-pointer"
                                        />

                                    )
                                }

                                {/* AUDIO */}

                                {
                                    msg.audio && (

                                        <audio
                                            controls
                                            className="mt-3 w-full"
                                        >
                                            <source
                                                src={msg.audio}
                                                type="audio/webm"
                                            />
                                        </audio>

                                    )
                                }

                                <button
                                    onClick={() =>
                                        setActiveMenu(
                                            activeMenu === msg._id ? null : msg._id
                                        )
                                    }
                                    className="text-gray-400 hover:text-gray-700 text-xs mt-1 opacity-60 hover:opacity-100"
                                >
                                    •••
                                </button>

                                {/* REACTIONS */}

                                {
                                    msg.reactions?.length > 0 && (

                                        <div className="flex gap-1 mt-2 flex-wrap">

                                            {
                                                msg.reactions.map((reaction, index) => (

                                                    <span
                                                        key={index}
                                                        className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                                                    >
                                                        {reaction.emoji}
                                                    </span>

                                                ))
                                            }

                                        </div>

                                    )
                                }

                                {/* ACTION BUTTONS */}

                                <div
                                    className={`${
                                        activeMenu === msg._id ? "flex" : "hidden group-hover:flex"
                                    } items-center gap-2 mt-3 flex-wrap`}
                                >

                                    <button
                                        onClick={() =>
                                            reactMessage(msg._id, "👍")
                                        }
                                        className="text-lg"
                                    >
                                        👍
                                    </button>

                                    <button
                                        onClick={() =>
                                            reactMessage(msg._id, "❤️")
                                        }
                                        className="text-lg"
                                    >
                                        ❤️
                                    </button>

                                    <button
                                        onClick={() =>
                                            reactMessage(msg._id, "😂")
                                        }
                                        className="text-lg"
                                    >
                                        😂
                                    </button>

                                    <button
                                        onClick={() =>
                                            reactMessage(msg._id, "🔥")
                                        }
                                        className="text-lg"
                                    >
                                        🔥
                                    </button>

                                    <button
                                        onClick={() =>
                                            setReplyMessage(msg)
                                        }
                                        className="text-xs text-green-600 font-medium"
                                    >
                                        Reply
                                    </button>

                                    {
                                        msg.sender?._id === user._id && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(msg._id);
                                                        setEditText(msg.text);
                                                    }}
                                                    className="text-xs text-blue-600 font-medium"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteMessage(msg._id)
                                                    }
                                                    className="text-xs text-red-600 font-medium"
                                                >
                                                    Delete
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        pinMessage(msg._id)
                                                    }
                                                    className="text-xs text-yellow-600 font-medium"
                                                >
                                                    {
                                                        msg.pinned
                                                            ? "Unpin"
                                                            : "Pin"
                                                    }
                                                </button>
                                            </>
                                        )
                                    }

                                </div>

                                {/* TIME */}

                                <div className="mt-2 flex items-center gap-2 text-xs opacity-70">

                                    <span>

                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}

                                    </span>

                                    {
                                        msg.sender?._id === user._id && isLastMessage && (

                                            <span className={msg.seen ? "text-blue-500" : "text-gray-400"}>

                                                {
                                                    msg.seen
                                                        ? "Seen"
                                                        : "Sent"
                                                }

                                            </span>

                                        )
                                    }

                                </div>

                            </div>

                        </div>

                        </div>
                        );

                    })

                }

                <div ref={bottomRef}></div>

            </div>
                        {/* Typing Indicator */}

            {
                typing && (

                    <div className="px-5 pb-2 flex items-center gap-2">

                        <img
                            src={otherUser?.profilePic || "https://via.placeholder.com/28"}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                        />

                        <div className="bg-gray-100 rounded-3xl px-4 py-3 flex items-center gap-1">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>

                    </div>

                )
            }

            {/* Scroll to bottom */}

            {
                showScrollBtn && (

                    <button
                        onClick={() =>
                            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="absolute bottom-24 right-6 bg-white shadow-lg border rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                        title="Scroll to latest"
                    >
                        ↓
                    </button>

                )
            }

            {/* Bottom Input */}
{/* Bottom Input */}

<div className="border-t bg-white px-3 sm:px-4 py-2.5 sm:py-3">

    {replyMessage && (

        <div className="flex justify-between items-center bg-gray-100 rounded-xl p-3 mb-3 gap-2">

            <div className="min-w-0">

                <p className="text-xs text-gray-500">
                    Replying to
                </p>

                <p className="text-sm truncate">
                    {replyMessage.text}
                </p>

            </div>

            <button
                onClick={() => setReplyMessage(null)}
                className="text-red-500 shrink-0"
            >
                ✕
            </button>

        </div>

    )}

    {image && (

        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2 mb-3">

            <img
                src={URL.createObjectURL(image)}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
            />

            <p className="text-sm text-gray-600 flex-1 truncate">
                Photo ready to send
            </p>

            <button
                onClick={() => setImage(null)}
                className="text-gray-500 hover:text-red-500 px-2"
            >
                ✕
            </button>

        </div>

    )}

    {recording && (

        <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3 mb-3">

            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>

            <p className="text-sm text-red-600 flex-1">
                Recording voice message...
            </p>

            <button
                onClick={stopRecording}
                className="text-xs font-semibold text-red-600 border border-red-300 rounded-full px-3 py-1"
            >
                Stop
            </button>

        </div>

    )}

    {audio && !recording && (

        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2 mb-3">

            <audio controls className="flex-1 h-8">
                <source src={URL.createObjectURL(audio)} type="audio/webm" />
            </audio>

            <button
                onClick={() => setAudio(null)}
                className="text-gray-500 hover:text-red-500 px-2 shrink-0"
            >
                ✕
            </button>

        </div>

    )}

    <div className="flex items-center gap-2">

        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 min-w-0">

            {/* Message */}

            <input
                type="text"
                placeholder="Message..."
                value={text}
                onChange={(e) => {

                    setText(e.target.value);

                    socket.emit("typing", {
                        conversationId: conversation._id,
                        user: user.fullName,
                    });

                }}
                onBlur={() =>
                    socket.emit(
                        "stopTyping",
                        conversation._id
                    )
                }
                onKeyDown={(e) => {

                    if (e.key === "Enter") {

                        sendMessage();

                    }

                }}
                className="flex-1 min-w-0 bg-transparent outline-none px-1 text-sm"
            />

            {/* Emoji */}

            <button
                onClick={() =>
                    setShowEmojiPicker(!showEmojiPicker)
                }
                className="text-lg sm:text-xl mx-0.5 sm:mx-1 text-gray-600 shrink-0"
            >
                😊
            </button>

            {showEmojiPicker && (

                <div className="absolute bottom-20 inset-x-2 sm:inset-x-auto sm:right-6 z-50 flex justify-center sm:block">

                    <div className="max-w-[320px] w-full">

                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            width="100%"
                        />

                    </div>

                </div>

            )}

            {/* Choose Image */}

            <label className="cursor-pointer text-lg sm:text-xl mx-0.5 sm:mx-1 text-gray-600 shrink-0">

                <FiImage />

                <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImage(e.target.files[0])
                    }
                />

            </label>

            {/* Voice */}

            <button
                onClick={
                    recording
                        ? stopRecording
                        : startRecording
                }
                className={`mx-0.5 sm:mx-1 text-lg sm:text-xl shrink-0 ${
                    recording
                        ? "text-red-500"
                        : "text-gray-600"
                }`}
            >
                🎤
            </button>

        </div>

        {/* Send / Quick heart */}

        {text.trim() || image || audio ? (

            <button
                onClick={sendMessage}
                className="text-blue-600 text-xl sm:text-2xl shrink-0"
                title="Send"
            >
                <FiSend />
            </button>

        ) : (

            <button
                onClick={sendHeart}
                className="text-xl sm:text-2xl shrink-0"
                title="Send a like"
            >
                <FaRegHeart className="text-gray-700" />
            </button>

        )}

    </div>

</div>

        {viewImage && (

            <div
                className="fixed inset-0 bg-black/90 z-200 flex items-center justify-center p-4"
                onClick={() => setViewImage(null)}
            >

                <img
                    src={viewImage}
                    alt=""
                    className="max-h-[90vh] max-w-full rounded-lg object-contain"
                />

            </div>

        )}

        </div>

    );

}