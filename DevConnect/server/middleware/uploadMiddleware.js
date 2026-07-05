import multer from "multer";

const storage = multer.memoryStorage();

// Default uploader — used for images (posts, profile pictures, chat images)
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Video uploader — used for Reels
export const uploadVideo = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only video files are allowed for Reels"));
        }
    },
});

export default upload;
