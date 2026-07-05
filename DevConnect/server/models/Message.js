import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        seen: {
            type: Boolean,
            default: false,
        },
        edited: {
    type: Boolean,
    default: false,
},
reactions: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            emoji: String,
        },
    ],
    pinned: {
    type: Boolean,
    default: false,
},
replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
},
audio: {
    type: String,
    default: "",
},
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;