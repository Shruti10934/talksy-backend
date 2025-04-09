import { compare } from "bcrypt";
import { User } from "../models/user.models.js";
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.models.js";
import { Request } from "../models/request.models.js";
import { NEW_REQUEST, REFETCH_CHAT } from "../constants/event.js";
import { getOtherMember } from "../lib/helper.js";

const newUser = TryCatch(async (req, res, next) => {
 
  const { name, username, password, bio } = req.body;

  const file = req.file;

  if (!file) return next(new ErrorHandler("Please Upload Avatar"));

  const result = await uploadFilesToCloudinary([file]);

  const avatar = { public_id: result[0].public_id, url: result[0].url };

  console.log(req.body);
  const user = await User.create({
    name,
    password,
    bio,
    username,
    avatar,
  });
  sendToken(res, user, 201, "User created successfully");
});

const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");
  if (!user) return next(new ErrorHandler("User not Found", 404));

  const isMatch = await compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Invalid Password", 400));

  sendToken(res, user, 200, `Welcome ${user.username}`);
});

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user) return next(new ErrorHandler("User not found", 404));

  return res.status(200).json({ success: true, user });
});

const logout = TryCatch(async (req, res, next) => {
  return res
    .cookie("chatapp", "", { ...cookieOptions, maxAge: 0 })
    .status(200)
    .json({ success: true, message: "User logout successfully" });
});

const searchUser = TryCatch(async (req, res, next) => {
  const { name = "" } = req.query;

  const myChats = await Chat.find({ members: req.user, groupChat: false });

  const allUsersFromMyChat = myChats.map((chat) => chat.members).flat();
  allUsersFromMyChat.push(req.user);


  const usersNotInMyChat = await User.find({
    _id: { $nin: allUsersFromMyChat },
    name: { $regex: name, $options: "i" },
  }); // option == case insensitive

  const users = usersNotInMyChat.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({ success: true, users });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ErrorHandler("Request is already sent", 400));

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res
    .status(200)
    .json({ success: true, message: "Friend Request Sent" });
});

const acceptFrientRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findOne({ _id: requestId })
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ErrorHandler("No request found", 404));

  if (req.user.toString() !== request.receiver._id.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Friend Request rejected" });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHAT, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

const getMyNotifications = TryCatch(async (req, res, next) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: { _id: sender._id, name: sender.name, avatar: sender.avatar.url },
  }));

  console.log(allRequests);

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res, next) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    groupChat: false,
    members: req.user,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherMembers = getOtherMember(members, req.user);
    return {
      _id: otherMembers._id,
      name: otherMembers.name,
      avatar: otherMembers.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );
    return res.status(200).json({ success: true, friends: availableFriends });
  } else {
    return res.status(200).json({ success: true, friends });
  }
});

export {
  login,
  newUser,
  getMyProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFrientRequest,
  getMyNotifications,
  getMyFriends,
};
