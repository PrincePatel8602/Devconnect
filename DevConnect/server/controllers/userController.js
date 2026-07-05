import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";
// Get Logged-in User
export const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get User by Username
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Update Profile
export const updateProfile = async (req, res) => {

    try {

        const {
            fullName,
            bio,
            location,
            website,
            skills,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (fullName) user.fullName = fullName;
        if (bio) user.bio = bio;
        if (location) user.location = location;
        if (website) user.website = website;
        if (skills) user.skills = skills;

        await user.save();

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};
export const uploadProfilePicture = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded",
            });
        }

        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: "DevConnect/ProfilePictures",
        });

        const user = await User.findById(req.user._id);

        user.profilePic = result.secure_url;

        await user.save();

        res.status(200).json({
            success: true,
            profilePic: result.secure_url,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
export const toggleBookmark = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const index = user.bookmarks.findIndex(
            (id) => id.toString() === post._id.toString()
        );

        if (index !== -1) {
            // Remove bookmark
            user.bookmarks.splice(index, 1);

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Bookmark removed",
                bookmarks: user.bookmarks,
            });
        }

        // Add bookmark
        user.bookmarks.push(post._id);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Post bookmarked",
            bookmarks: user.bookmarks,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const toggleFollow = async (req, res) => {
    try {

        const currentUser = await User.findById(req.user._id);
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You can't follow yourself",
            });
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === targetUser._id.toString()
        );

        // Unfollow
        if (alreadyFollowing) {

            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== targetUser._id.toString()
            );

            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== currentUser._id.toString()
            );

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({
                success: true,
                following: false,
                message: "Unfollowed successfully",
            });
        }

        // Follow
        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);

        await currentUser.save();
        await targetUser.save();

        // Create Notification
        const notification = await Notification.create({
            recipient: targetUser._id,
            sender: currentUser._id,
            type: "follow",
        });

        await notification.populate(
            "sender",
            "fullName username profilePic"
        );

        // Send Real-Time Notification
        const io = getIO();

        io.to(targetUser._id.toString()).emit(
            "newNotification",
            notification
        );

        res.status(200).json({
            success: true,
            following: true,
            message: "Followed successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const getFollowers = async (req, res) => {
    try {

        const user = await User.findById(req.params.id)
            .populate(
                "followers",
                "fullName username profilePic"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            followers: user.followers,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const getFollowing = async (req, res) => {
    try {

        const user = await User.findById(req.params.id)
            .populate(
                "following",
                "fullName username profilePic"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            following: user.following,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const suggestedUsers = async (req, res) => {
    try {

        const currentUser = await User.findById(req.user._id);

        const users = await User.find({
            _id: {
                $nin: [...currentUser.following, currentUser._id]
            }
        })
        .select("-password")
        .limit(10);

        res.status(200).json({
            success: true,
            users,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
export const searchUsers = async (req, res) => {

    try {

        const keyword = req.query.keyword;

        if (!keyword || keyword.trim() === "") {

            return res.status(200).json({
                success: true,
                users: [],
            });

        }

        const users = await User.find({

            $or: [

                {
                    fullName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    username: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

            ],

        })
        .select("fullName username profilePic")
        .limit(20);

        res.status(200).json({
            success: true,
            users,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const getBookmarks = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .populate({
                path: "bookmarks",
                populate: {
                    path: "user",
                    select: "fullName username profilePic",
                },
            });

        res.status(200).json({
            success: true,
            bookmarks: user.bookmarks,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};