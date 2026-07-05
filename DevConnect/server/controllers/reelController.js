import Reel from "../models/Reel.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../config/socket.js";
import { createNotification } from "../utils/createNotification.js";

// Create Reel
export const createReel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "A video file is required",
            });
        }

        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: "DevConnect/Reels",
            resource_type: "video",
        });

        const reel = await Reel.create({
            user: req.user._id,
            caption: req.body.caption || "",
            video: result.secure_url,
            thumbnail: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        });

        const populated = await Reel.findById(reel._id).populate(
            "user",
            "username fullName profilePic"
        );

        res.status(201).json({
            success: true,
            reel: populated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all reels (feed) — newest first
export const getAllReels = async (req, res) => {
    try {
        const reels = await Reel.find()
            .populate("user", "username fullName profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get a single user's reels
export const getUserReels = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const reels = await Reel.find({ user: user._id })
            .populate("user", "username fullName profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reels,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Like / Unlike a reel
export const likeReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found",
            });
        }

        const alreadyLiked = reel.likes.some(
            (id) => id.toString() === req.user._id.toString()
        );

        if (alreadyLiked) {
            reel.likes = reel.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            reel.likes.push(req.user._id);

            await createNotification({
                recipient: reel.user,
                sender: req.user._id,
                type: "like",
                io: getIO(),
            });
        }

        await reel.save();

        res.json({
            success: true,
            likes: reel.likes.length,
            liked: !alreadyLiked,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Track a view
export const viewReel = async (req, res) => {
    try {
        await Reel.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete a reel (owner only)
export const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found",
            });
        }

        if (reel.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await reel.deleteOne();
        await Comment.deleteMany({ reel: reel._id });

        res.json({
            success: true,
            message: "Reel deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Add comment to a reel
export const addReelComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
            });
        }

        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: "Reel not found",
            });
        }

        const comment = await Comment.create({
            reel: reel._id,
            user: req.user._id,
            text,
        });

        if (reel.user.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: reel.user,
                sender: req.user._id,
                type: "comment",
                io: getIO(),
            });
        }

        await comment.populate("user", "fullName username profilePic");

        res.status(201).json({
            success: true,
            comment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get comments for a reel
export const getReelComments = async (req, res) => {
    try {
        const comments = await Comment.find({ reel: req.params.id })
            .populate("user", "fullName username profilePic")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            comments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
