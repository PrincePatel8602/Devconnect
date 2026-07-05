import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { getIO } from "../config/socket.js";
import { createNotification } from "../utils/createNotification.js";
// Add Comment
export const addComment = async (req, res) => {
    try {

        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const comment = await Comment.create({
            post: post._id,
            user: req.user._id,
            text,
        });
        if (post.user.toString() !== req.user._id.toString()) {

    await createNotification({

        recipient: post.user,

        sender: req.user._id,

        type: "comment",

        post: post._id,

        io: getIO(),


    });

}
              await comment.populate(
            "user",
            "fullName username profilePic"
        );

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
export const getComments = async (req, res) => {
    try {

        const comments = await Comment.find({
            post: req.params.postId,
        })
            .populate(
                "user",
                "fullName username profilePic"
            )
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
export const deleteComment = async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        if (
            comment.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await comment.deleteOne();

        res.json({
            success: true,
            message: "Comment deleted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};