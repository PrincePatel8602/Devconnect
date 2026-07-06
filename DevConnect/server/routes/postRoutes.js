import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    likePost,
    getFollowingPosts,
    getUserPosts,
} from "../controllers/postController.js";

const router = express.Router();

// Create Post
router.post(
    "/",
    protect,
    upload.single("image"),
    createPost
);

// Feed (keep BEFORE /:id)
router.get(
    "/feed",
    protect,
     getAllPosts
);

// User Posts (keep BEFORE /:id)
router.get(
    "/user/:username",
    getUserPosts
);

// All Posts
router.get("/", getAllPosts);

// Single Post (must be LAST among GET routes)
router.get("/:id", getPostById);

// Delete
router.delete(
    "/:id",
    protect,
    deletePost
);

// Like
router.put(
    "/:id/like",
    protect,
    likePost
);

export default router;