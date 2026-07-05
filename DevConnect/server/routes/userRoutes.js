import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    getMe,
    getUserProfile,
    updateProfile,
    uploadProfilePicture,
    toggleBookmark,
    toggleFollow,
    getFollowers,
    getFollowing,
    suggestedUsers,
    searchUsers,
     getBookmarks,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.get("/profile/:username", getUserProfile);

router.put("/update", protect, updateProfile);

router.put(
    "/profile-picture",
    protect,
    upload.single("image"),
    uploadProfilePicture
);

router.put("/bookmark/:id", protect, toggleBookmark);

router.put("/follow/:id", protect, toggleFollow);

router.get("/followers/:id", getFollowers);

router.get("/following/:id", getFollowing);

router.get("/suggested", protect, suggestedUsers);

router.get("/search", protect, searchUsers);
router.get(
    "/bookmarks",
    protect,
    getBookmarks
);

export default router;