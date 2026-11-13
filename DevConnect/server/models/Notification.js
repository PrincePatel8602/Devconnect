import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "message", "reply", "reaction"],
        required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    reel: { type: mongoose.Schema.Types.ObjectId, ref: "Reel" },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    entityType: { type: String, enum: ["post", "reel", "message"] },
    read: { type: Boolean, default: false },
    // how many times this same event happened (e.g. 5 messages from one person)
    count: { type: Number, default: 1 },
},{ timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);


export default Notification;