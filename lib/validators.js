import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);
  const errorMessage = errors
    .array()
    .map((error) => error.msg)
    .join(", ");
  console.log(errorMessage);
  if (errors.isEmpty()) return next();
  else return next(new ErrorHandler(errorMessage, 400));
};

const registerValidator = () => [
  body("name", "Please enter name").notEmpty(),
  body("username", "Please enter username").notEmpty(),
  body("bio", "Please enter bio").notEmpty(),
  body("password", "Please enter password").notEmpty(),
];

const loginValidator = () => [
  body("username", "Please enter username").notEmpty(),
  body("password", "Please enter password").notEmpty(),
];

const newGroupValidator = () => [
  body("name", "Please enter group name").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please enter members")
    .isArray({ min: 2, max: 100 })
    .withMessage("Members must be 2-100"),
];

const addMemberValidator = () => [
  body("chatId", "Please enter chatId").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please enter members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be 1-97"),
];

const removeMemberValidator = () => [
  body("chatId", "Please enter chatId").notEmpty(),
  body("userId", "Please enter userId").notEmpty(),
];

const sendAttachmentValidator = () => [
  body("chatId", "Please provide chatId").notEmpty(),
];

const chatIdValidator = () => [
  param("id", "Please enter a valid chatId").notEmpty(),
];

const renameGroupValidator = () => [
  param("id", "Please enter a valid chatId").notEmpty(),
  body("name", "Please enter new group name").notEmpty(),
];

const sendRequestValidator = () => [
  body("userId", "Please enter user ID").notEmpty(),
];

const acceptRequestValidator = () => [
  body("requestId", "Please enter request ID").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage("Please add accept")
    .isBoolean()
    .withMessage("Accept must be boolean"),
];

const adminLoginValidator = () => [
  body("secretKey", "Please enter Secret Key").notEmpty(),
];

export {
  acceptRequestValidator,
  addMemberValidator,
  adminLoginValidator,
  chatIdValidator,
  loginValidator,
  newGroupValidator,
  registerValidator,
  removeMemberValidator,
  renameGroupValidator,
  sendAttachmentValidator,
  sendRequestValidator,
  validateHandler,
};
