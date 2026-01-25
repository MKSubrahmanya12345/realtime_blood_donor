import Notification from "../models/notification.model.js";

// GET MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
    })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getMyNotifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// MARK NOTIFICATION AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id }, // 🔐 ownership check
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user._id, // 🔐 ownership check
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleteNotification:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// (OPTIONAL) GET UNREAD COUNT — super useful for notification bell 🔔
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error getUnreadCount:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
