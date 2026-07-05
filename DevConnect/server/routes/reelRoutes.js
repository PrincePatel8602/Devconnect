import express from "express";

import protect from "../middleware/authMiddleware.js";
import { uploadVideo } from "../middleware/uploadMiddleware.js";

import {
    createReel,
    getAllReels,
    getUserReels,
    likeReel,
    viewReel,
    deleteReel,
    addReelComment,
    getReelComments,
} from "../controllers/reelController.js";

const router = express.Router();

// Create Reel
router.post("/", protect, uploadVideo.single("video"), createReel);

// Feed (keep BEFORE /:id)
router.get("/", getAllReels);

// User's Reels (keep BEFORE /:id)
router.get("/user/:username", getUserReels);

// Like
router.put("/:id/like", protect, likeReel);

// View count
router.put("/:id/view", viewReel);

// Comments
router.post("/:id/comments", protect, addReelComment);
router.get("/:id/comments", getReelComments);

// Delete
router.delete("/:id", protect, deleteReel);

export default router;
