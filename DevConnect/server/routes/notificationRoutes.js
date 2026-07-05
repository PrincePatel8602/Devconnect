import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
    getNotifications,
    markAllRead,
    deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getNotifications
);

router.put(
    "/read",
    protect,
    markAllRead
);

router.delete(
    "/:notificationId",
    protect,
    deleteNotification
);

export default router;