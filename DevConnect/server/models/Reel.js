import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        caption: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        video: {
            type: String,
            required: true,
        },

        thumbnail: {
            type: String,
            default: "",
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;
