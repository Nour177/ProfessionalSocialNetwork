import express from 'express';
import {
    getNotifications,
    getNotificationCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

export const router = express.Router();

router.get('/notifications', (req, res) => {
    if (!req.session?.user) {
        return res.redirect('/pages/login.html');
    }
    res.render('notifications');
});

// Get notifications
router.get('/api/notifications', getNotifications);

// Get notification count
router.get('/api/notifications/count', getNotificationCount);

// Mark notification as read
router.put('/api/notifications/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/api/notifications/read-all', markAllAsRead);
