import { adminSecretKey } from "../app.js";
import { ErrorHandler } from "../utils/utility.js";

import jwt from "jsonwebtoken";
import { TryCatch } from "./error.middleware.js";
import { User } from "../models/user.models.js";

const isAuthenticated = TryCatch((req, res, next) => {
  const token = req.cookies["chatapp"];

  if (!token)
    return next(
      new ErrorHandler("Please login to get access to your profile", 401)
    );

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = decodedData._id;
  next();
});

const adminOnly = (req, res, next) => {
  const token = req.cookies["chatapp-admin"];

  if (!token)
    return next(new ErrorHandler("Ony Admin can access this route", 401));

  const secretKey = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const isMatch = secretKey === adminSecretKey;
  if (!isMatch) {
    return next(new ErrorHandler("Ony Admin can access this route", 401));
  }
  next();
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies["chatapp"];
    if (!authToken)
      return next(new ErrorHandler("Please login to get this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to get this route", 401));

    socket.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to get this route", 401));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };
