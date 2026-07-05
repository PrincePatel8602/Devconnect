import Notification from "../models/Notification.js";


// Get Notifications
export const getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.find({
            recipient: req.user._id,
        })
            .populate("sender", "fullName username profilePic")
            .sort({ createdAt: -1 });

        res.json({
            notifications,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


// Mark All Read
export const markAllRead = async (req, res) => {

    try {

        await Notification.updateMany(

            {
                recipient: req.user._id,
                read: false,
            },

            {
                read: true,
            }

        );

        res.json({
            message: "Notifications marked as read",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};


// Delete Notification
export const deleteNotification = async (req, res) => {

    try {

        await Notification.findByIdAndDelete(
            req.params.notificationId
        );

        res.json({
            message: "Notification deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};