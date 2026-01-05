import { Notification } from '../models/notification.model';

export const getUserNotifications = async (userId: string) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

export const markRead = async (userId: string, notificationId: string) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

export const markAllRead = async (userId: string) => {
    return await Notification.updateMany({ userId, read: false }, { read: true });
};

// Helper to easy create notification
export const createNotification = async (userId: string, type: string, title: string, message: string, data?: any) => {
    return await Notification.create({ userId, type, title, message, data });
};
