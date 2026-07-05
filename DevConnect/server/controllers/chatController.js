import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

export const changeWallpaper = async (req, res) => {

    try {

        const conversation = await Conversation.findById(
            req.params.id
        );

        if (!conversation) {

            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });

        }

        let wallpaper = "";

        if (req.file) {

            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

            const result = await cloudinary.uploader.upload(
                base64,
                {
                    folder: "DevConnect/Wallpapers",
                }
            );

            wallpaper = result.secure_url;

        }

        conversation.wallpaper = wallpaper;

        await conversation.save();

        res.json({
            success: true,
            wallpaper,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// Create or Get Conversation
export const createConversation = async (req, res) => {
    try {

        const senderId = req.user._id;
        const receiverId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        if (senderId.toString() === receiverId) {
            return res.status(400).json({
                success: false,
                message: "You cannot create a conversation with yourself.",
            });
        }

        let conversation = await Conversation.findOne({
            participants: {
                $all: [senderId, receiverId],
            },
        })
            .populate("participants", "fullName username profilePic")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "fullName username profilePic",
                },
            });

        if (!conversation) {

            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });

            conversation = await Conversation.findById(conversation._id)
                .populate("participants", "fullName username profilePic")
                .populate({
                    path: "lastMessage",
                    populate: {
                        path: "sender",
                        select: "fullName username profilePic",
                    },
                });
        }

        res.status(200).json({
            success: true,
            conversation,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// Get Conversations
export const getConversations = async (req, res) => {
    try {

        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate(
                "participants",
                "fullName username profilePic"
            )
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "fullName username profilePic",
                },
            })
            .sort({
                updatedAt: -1,
            });

        res.status(200).json({
            success: true,
            conversations,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};