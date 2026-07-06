import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../config/socket.js";
import { createNotification } from "../utils/createNotification.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {

        const {
    conversationId,
    text,
    replyTo,
} = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        let imageUrl = "";

        // IMAGE UPLOAD
        if (req.file) {

            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

            const result = await cloudinary.uploader.upload(base64, {
                folder: "DevConnect/Messages",
            });

            imageUrl = result.secure_url;
        }
        let audioUrl = "";

if (req.files?.audio) {

    const base64 = `data:${req.files.audio[0].mimetype};base64,${req.files.audio[0].buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
        resource_type: "video",
        folder: "DevConnect/Voice",
    });

    audioUrl = result.secure_url;
}

        // CREATE MESSAGE
        const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text || "",
    image: imageUrl,
    replyTo: replyTo || null,
});

        // update last message
        // Update last message
conversation.lastMessage = message._id;

// Increase unread count for receiver
const receiverId = conversation.participants.find(
    (id) => id.toString() !== req.user._id.toString()
);

const currentUnread =
    conversation.unreadCounts.get(receiverId.toString()) || 0;

conversation.unreadCounts.set(
    receiverId.toString(),
    currentUnread + 1
);

await conversation.save();

        // populate sender
       await message.populate(
    "replyTo",
    "text sender"
);

        // SOCKET EMIT (ROOM MUST MATCH FRONTEND JOIN)
        const io = getIO();


await createNotification({
    recipient: receiverId,
    sender: req.user._id,
    type: "message",
    io: getIO(),
});
if (replyTo) {

    const repliedMessage = await Message.findById(replyTo);

    if (
        repliedMessage &&
        repliedMessage.sender.toString() !== req.user._id.toString()
    ) {

        await createNotification({

            recipient: repliedMessage.sender,

            sender: req.user._id,

            type: "reply",

            io: getIO(),

        });

    }

}
        io.to(conversation._id.toString()).emit(
            "newMessage",
            message
        );

        res.status(201).json({
            success: true,
            message,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// GET CONVERSATIONS
export const getConversations = async (req, res) => {
    try {

        const conversations = await Conversation.find({
            participants: req.user._id,   // ✅ FIXED
        })
        .populate(
            "participants",
            "fullName username profilePic"
        )
        .populate({
            path: "lastMessage",
            populate: {
                path: "sender",
                select: "fullName username profilePic",
            },
        })
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// GET MESSAGES
export const getMessages = async (req, res) => {
    try {

        const messages = await Message.find({
            conversation: req.params.conversationId,
        })
        .populate(
            "sender",
            "fullName username profilePic"
        )
        .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


// MARK AS SEEN
export const markAsSeen = async (req, res) => {

    try {

        await Message.updateMany(
            {
                conversation: req.params.conversationId,
                sender: { $ne: req.user._id },
                seen: false,
            },
            {
                seen: true,
            }
        );

        const conversation = await Conversation.findById(
            req.params.conversationId
        );

        if (conversation) {

            conversation.unreadCounts.set(
                req.user._id.toString(),
                0
            );

            await conversation.save();

        }

        const io = getIO();

        io.to(req.params.conversationId).emit(
            "messagesSeen",
            req.params.conversationId
        );

        res.status(200).json({
            success: true,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const deleteMessage = async (req, res) => {

    try {

        const message = await Message.findById(req.params.messageId);

        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found",
            });

        }

        if (message.sender.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });

        }

        await Message.findByIdAndDelete(req.params.messageId);

        const io = getIO();

        io.to(message.conversation.toString()).emit(
            "messageDeleted",
            message._id
        );

        res.status(200).json({
            success: true,
            message: "Message deleted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const editMessage = async (req, res) => {

    try {

        const { text } = req.body;

        const message = await Message.findById(req.params.messageId);

        if (!message) {

            return res.status(404).json({
                success: false,
                message: "Message not found",
            });

        }

        if (message.sender.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });

        }

        message.text = text;
        message.edited = true;

        await message.save();

        await message.populate(
            "sender",
            "fullName username profilePic"
        );

        const io = getIO();

        io.to(message.conversation.toString()).emit(
            "messageEdited",
            message
        );

        res.json({
            success: true,
            message,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
export const reactToMessage = async (req, res) => {

    try {

        const { emoji } = req.body;

        const message = await Message.findById(req.params.messageId);

        if (!message) {

            return res.status(404).json({
                success:false,
                message:"Message not found",
            });

        }

        const alreadyReacted = message.reactions.find(
            r => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReacted && alreadyReacted.emoji === emoji) {

            // tapping the same reaction again removes it
            message.reactions = message.reactions.filter(
                r => r.user.toString() !== req.user._id.toString()
            );

        } else if (alreadyReacted) {

            alreadyReacted.emoji = emoji;

        } else {

            message.reactions.push({
                user:req.user._id,
                emoji,
            });

        }

        await message.save();
if (message.sender.toString() !== req.user._id.toString()) {

    await createNotification({

        recipient: message.sender,

        sender: req.user._id,

        type: "reaction",

        io: getIO(),

    });

}
        const io = getIO();

        io.to(message.conversation.toString()).emit(
            "messageReaction",
            message
        );

        res.json({
            success:true,
            message,
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }

};
export const pinMessage = async (req, res) => {

    try {

        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        message.pinned = !message.pinned;

        await message.save();

        await message.populate(
            "sender",
            "fullName username profilePic"
        );

        const io = getIO();

        io.to(message.conversation.toString()).emit(
            "messagePinned",
            message
        );

        res.json({
            success: true,
            message,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};