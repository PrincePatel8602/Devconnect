import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    getConversations,
    sendMessage,
    getMessages,
    markAsSeen,
    deleteMessage,
    editMessage,
    reactToMessage,
    pinMessage,
} from "../controllers/messageController.js";

const router = express.Router();
router.put(
    "/pin/:messageId",
    protect,
    pinMessage
);
// Conversation list
router.get(
    "/conversations",
    protect,
    getConversations
);

// Send message
router.post(
    "/:conversationId",
    protect,
    upload.fields([
        {
            name: "image",
            maxCount: 1,
        },
        {
            name: "audio",
            maxCount: 1,
        },
    ]),
    sendMessage
);
// Get messages
router.get(
    "/:conversationId",
    protect,
    getMessages
);

// Mark messages as seen
router.put(
    "/seen/:conversationId",
    protect,
    markAsSeen
);

// Edit message
router.put(
    "/edit/:messageId",
    protect,
    editMessage
);

// Delete message
router.delete(
    "/:messageId",
    protect,
    deleteMessage
);
router.put(
    "/reaction/:messageId",
    protect,
    reactToMessage
);

export default router;