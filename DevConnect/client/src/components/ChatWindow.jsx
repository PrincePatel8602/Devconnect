import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";

export default function ChatWindow({ conversation }) {

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
            className="flex flex-col h-[80vh] bg-cover bg-center bg-gray-50"
            style={{
                backgroundImage: conversation?.wallpaper
                    ? `url(${conversation.wallpaper})`
                    : "none",
            }}
        >

            {/* HEADER */}

            <div className="sticky top-0 z-20 bg-white border-b px-5 py-3 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <img
                        src={
                            otherUser?.profilePic ||
                            "https://via.placeholder.com/50"
                        }
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border"
                    />

                    <div>

                        <h2 className="font-semibold text-lg">
                            {otherUser?.fullName}
                        </h2>

                        <p className="text-sm text-gray-500">
                            @{otherUser?.username}
                        </p>

                    </div>

                </div>

            </div>

            {/* PINNED MESSAGE */}

            {
                messages.find(msg => msg.pinned) && (

                    <div className="bg-yellow-50 border-b px-4 py-3">

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

            <div className="flex-1 overflow-y-auto px-5 py-4">

                {

                    messages.map((msg) => (

                        <div
                            key={msg._id}
                            className={`flex mb-5 ${
                                msg.sender?._id === user._id
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >

                            <div className="group relative max-w-[72%]">

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

                                {/* MESSAGE BUBBLE */}

                                <div
                                    className={`rounded-3xl px-4 py-3 shadow-sm ${
                                        msg.sender?._id === user._id
                                            ? "bg-blue-600 text-white rounded-br-md"
                                            : "bg-white text-gray-900 rounded-bl-md"
                                    }`}
                                ></div>
                                                                {/* TEXT */}

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

                                        )

                                    )
                                }

                                {/* IMAGE */}

                                {
                                    msg.image && (

                                        <img
                                            src={msg.image}
                                            alt=""
                                            className="mt-3 rounded-2xl max-h-80 object-cover border"
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

                                <div className="hidden group-hover:flex items-center gap-2 mt-3 flex-wrap">

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
                                        msg.sender?._id === user._id && (

                                            <span>

                                                {
                                                    msg.seen
                                                        ? "✓✓ Seen"
                                                        : "✓ Sent"
                                                }

                                            </span>

                                        )
                                    }

                                </div>

                            </div>

                        </div>

                    ))

                }

                <div ref={bottomRef}></div>

            </div>
                        {/* Typing Indicator */}

            {
                typing && (

                    <div className="px-5 pb-2">

                        <p className="text-sm italic text-gray-500">

                            {otherUser?.fullName} is typing...

                        </p>

                    </div>

                )
            }

            {/* Bottom Input */}
{/* Bottom Input */}

<div className="border-t bg-white px-4 py-3">

    {replyMessage && (

        <div className="flex justify-between items-center bg-gray-100 rounded-xl p-3 mb-3">

            <div>

                <p className="text-xs text-gray-500">
                    Replying to
                </p>

                <p className="text-sm">
                    {replyMessage.text}
                </p>

            </div>

            <button
                onClick={() => setReplyMessage(null)}
                className="text-red-500"
            >
                ✕
            </button>

        </div>

    )}

    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">

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
            className="flex-1 bg-transparent outline-none px-2"
        />

        {/* Emoji */}

        <button
            onClick={() =>
                setShowEmojiPicker(!showEmojiPicker)
            }
            className="text-2xl mx-1"
        >
            😊
        </button>

        {showEmojiPicker && (

            <div className="absolute bottom-20 right-20 z-50">

                <EmojiPicker
                    onEmojiClick={onEmojiClick}
                />

            </div>

        )}

        {/* Choose Image */}

        <label className="cursor-pointer text-xl mx-1">

            🖼️

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
            className={`mx-1 text-xl ${
                recording
                    ? "text-red-500"
                    : "text-green-600"
            }`}
        >
            🎤
        </button>

        {/* Send */}

        <button
            onClick={sendMessage}
            className="ml-2 text-blue-600 font-semibold"
        >
            Send
        </button>

    </div>

</div>

        </div>

    );

}