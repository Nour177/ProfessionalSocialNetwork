import Notification from '../models/notificationSchema.js';

// Get all notifications for current user
export const getNotifications = async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { limit = 20, unreadOnly = false } = req.query;
        const query = { recipient: req.session.user._id };
        
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'firstname lastname profileImagePath')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            notifications: notifications.map(notif => ({
                ...notif,
                sender: notif.sender ? {
                    _id: notif.sender._id,
                    firstname: notif.sender.firstname,
                    lastname: notif.sender.lastname,
                    fullName: `${notif.sender.firstname} ${notif.sender.lastname}`,
                    profileImagePath: notif.sender.profileImagePath || '/images/profile.png'
                } : null
            }))
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get notification count
export const getNotificationCount = async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.json({
                success: true,
                networkCount: 0,
                messagingCount: 0,
                notificationsCount: 0
            });
        }

        const unreadCount = await Notification.countDocuments({
            recipient: req.session.user._id,
            read: false
        });

        res.json({
            success: true,
            networkCount: 0, 
            messagingCount: 0, 
            notificationsCount: unreadCount
        });
    } catch (error) {
        console.error('Error getting notification count:', error);
        res.json({
            success: true,
            networkCount: 0,
            messagingCount: 0,
            notificationsCount: 0
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { notificationId } = req.params;
        
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: req.session.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        if (!req.session?.user?._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        await Notification.updateMany(
            { recipient: req.session.user._id, read: false },
            { read: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a notification (helper function for other controllers)
export const createNotification = async (recipientId, type, title, message, senderId = null, link = null, metadata = {}) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            title,
            message,
            link,
            metadata
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
