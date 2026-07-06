
const notificationSchema = new mongoose.Schema(
{
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    type: {
        type: String,
        enum: ["like", "comment", "follow", "message", "reply", "reaction"],
        required: true,
    },

    entityType: {
        type: String,
        enum: ["post", "reel", "message"],
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },

    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel",
    },

    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },

    read: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true,
});