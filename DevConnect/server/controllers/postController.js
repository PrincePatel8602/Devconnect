import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../config/socket.js";
import { createNotification } from "../utils/createNotification.js";
// Create Post
export const createPost = async (req, res) => {
    try {

        let imageUrl = "";

        if (req.file) {

            const base64 =
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

            const result = await cloudinary.uploader.upload(base64, {
                folder: "DevConnect/Posts",
            });

            imageUrl = result.secure_url;
        }

        const post = await Post.create({
            user: req.user._id,
            text: req.body.text,
            image: imageUrl,
        });

        res.status(201).json({
            success: true,
            post,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
export const getAllPosts = async (req, res) => {

    try {

        const posts = await Post.find()
            .populate("user", "username fullName profilePic")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};
export const getPostById = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id)
            .populate("user", "username fullName profilePic");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json({
            success: true,
            post
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
export const deletePost = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        await post.deleteOne();

        res.json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
export const likePost = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const alreadyLiked = post.likes.some(
            id => id.toString() === req.user._id.toString()
        );

        if (alreadyLiked) {

            post.likes = post.likes.filter(
                id => id.toString() !== req.user._id.toString()
            );

        }  else {

    post.likes.push(req.user._id);

    await createNotification({

    recipient: post.user,

    sender: req.user._id,

    type: "like",

    post: post._id,

    io: getIO(),

});
}
        await post.save();

        res.json({

            success: true,
            likes: post.likes.length,
            liked: !alreadyLiked,

        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


export const getFollowingPosts = async (req, res) => {

    try {

        const currentUser = await User.findById(req.user._id);

        const posts = await Post.find({
            user: {
                $in: [...currentUser.following, currentUser._id]
            }
        })
        .populate(
            "user",
            "fullName username profilePic"
        )
        .sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            posts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const getUserPosts = async (req, res) => {

    try {

        const user = await User.findOne({
            username: req.params.username
        });

        const posts = await Post.find({
            user: user._id
        })
        .populate(
            "user",
            "fullName username profilePic"
        )
        .sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            posts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};