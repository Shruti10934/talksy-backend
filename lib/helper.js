import { userSocketIDs } from "../app.js";

const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());

const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user.toString()));
  return sockets;
};

const getBase64 = (file) =>{
  if (!file || !file.mimetype || !file.buffer) {
    console.error("Invalid file object:", file);
    throw new Error("File object is missing required properties.");
  }
  console.log("getbase64");
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

export { getOtherMember, getSockets, getBase64 };
