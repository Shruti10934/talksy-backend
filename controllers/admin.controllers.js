import { TryCatch } from "../middlewares/error.middleware.js";
import { User } from "../models/user.models.js";
import { Chat } from "../models/chat.models.js";
import { Message } from "../models/message.models.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";

const allUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  const transformedUsers = await Promise.all(
    users.map(async ({ _id, name, username, avatar }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);
      return {
        _id,
        name,
        username,
        avatar: avatar.url,
        friends,
        groups,
      };
    })
  );

  return res.status(200).json({ success: true, users: transformedUsers });
});

const allChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ _id, name, groupChat, members, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });
      return {
        _id,
        name,
        groupChat,
        avatar: members
          .slice(0, 3)
          .map((member) => (member.avatar.url)),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || "none",
          avatar: creator?.avatar.url || "",
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({ success: true, chats: transformedChats });
});

const allMessages = TryCatch(async (req, res, next) => {
  const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "chatId groupChat");

  const transformedMessages = messages.map(
    ({ _id, content, attachments, sender, chat, createdAt }) => ({
      _id,
      content,
      createdAt,
      attachments,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    })
  );

  return res.status(200).json({ success: true, messages: transformedMessages });
});

const getDashboardStats = TryCatch(async (req, res, next) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

    
    const today = new Date();
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 7);
    
    const last7daysMessages = await Message.find({
      createdAt: { $gte: last7days, $lte: today },
    }).select("createdAt");
    
    const messages = new Array(7).fill(0);

    const stats = {
      groupsCount,
      usersCount,
      messagesCount,
      totalChatsCount,
      messagesChart: messages
    };
    
  last7daysMessages.forEach((message) => {
    const index = Math.floor(
      (today.getTime() - message.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );
    messages[6 - index] += 1;
  });

  return res.status(200).json({ success: true, stats });
});

const adminLogin = (req, res, next) => {
  const { secretKey } = req.body;

  const isMatch = secretKey === adminSecretKey;
  if (!isMatch) {
    return next(new ErrorHandler("Invalid Admin Key", 401));
  }

  const token = jwt.sign(secretKey, process.env.JWT_SECRET_KEY);

  return res
    .status(200)
    .cookie("chatapp-admin", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .json({ success: true, message: "Authenticated Successfully" });
};

const adminLogout = (req, res, next) => {
  return res
    .status(200)
    .cookie("chatapp-admin", "", { ...cookieOptions, maxAge: 0 })
    .json({ success: true, message: "Admin logged out Successfully" });
};

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({ admin: true });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
