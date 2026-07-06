import Notification from "../models/Notification.js";

export const createNotification = async ({
    recipient,
    sender,
    type,
    post = null,
    reel = null,
    message = null,
    entityType = null,
    io = null,
}) => {

    if (recipient.toString() === sender.toString()) return;

   const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    reel,
    message,
    entityType,
});

    const populatedNotification =
        await Notification.findById(notification._id)
            .populate(
                "sender",
                "fullName username profilePic"
            );

    if (io) {

        io.to(recipient.toString()).emit(
            "newNotification",
            populatedNotification
        );

    }

    return populatedNotification;

};