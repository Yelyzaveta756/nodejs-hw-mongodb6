import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
    registerUserController,
    loginUserController,
    logoutUserController,
    refreshUserController,
    sendResetEmailController,
    resetPasswordController } from "../controllers/auth.js";
import { registerUserSchema, loginUserSchema, sendResetUserSchema, resetPasswordSchema } from "../validation/auth.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerUserSchema), ctrlWrapper(registerUserController));
authRouter.post("/login", validateBody(loginUserSchema), ctrlWrapper(loginUserController));
authRouter.post("/refresh", ctrlWrapper(refreshUserController));
authRouter.post("/logout", ctrlWrapper(logoutUserController));
authRouter.post("/send-reset-email", validateBody(sendResetUserSchema), ctrlWrapper(sendResetEmailController));
authRouter.post("/reset-pwd", validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

