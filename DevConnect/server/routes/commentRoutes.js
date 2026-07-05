import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
    addComment,
    getComments,
    deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post(
    "/:postId",
    protect,
    addComment
);

router.get(
    "/:postId",
    getComments
);

router.delete(
    "/:commentId",
    protect,
    deleteComment
);

export default router;