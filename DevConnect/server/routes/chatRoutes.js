import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";

import {
    createConversation,
    getConversations,
    changeWallpaper
} from "../controllers/chatController.js";

const router = express.Router();

router.post(
    "/:userId",
    protect,
    createConversation
);

router.get(
    "/",
    protect,
    getConversations
);
router.put(
    "/wallpaper/:id",
    protect,
    upload.single("wallpaper"),
    changeWallpaper
);

export default router;