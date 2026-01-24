import Notification from "../models/notification.model.js";

// GET MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 }); 
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error getMyNotifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE NOTIFICATION (This was missing!)
export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};