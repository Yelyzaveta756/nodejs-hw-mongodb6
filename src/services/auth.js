import createHttpError from "http-errors";
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { UserCollection } from "../db/models/auth.js";
import { SessionsCollection } from "../db/models/session.js";
import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, ONE_DAY, SMTP } from "../constants/auth.js";
import { sendEmail } from "../utils/sendEmail.js";
import { createJwtToken, verifyToken } from "../utils/jwt.js";
import { TEMPLATES_DIR } from "../constants/auth.js";
import { env } from "../utils/env.js";

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');
    const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
    const refreshTokenValidUntil = new Date(Date.now() + ONE_DAY);

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
      };
};

export const registerUser = async (payload) => {
    const { email } = payload;
    const user = await UserCollection.findOne({email});

    if (user) throw createHttpError(409, 'Email in use');

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    const data = await UserCollection.create({
        ...payload,
        password: encryptedPassword});
    delete data._doc.password;
    return data._doc;
};

export const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await UserCollection.findOne({email});

    if (!user) {
        throw createHttpError(404, 'User not found');
      };

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual)
        throw createHttpError(401, 'Unauthorized');

    await SessionsCollection.deleteOne({userId: user._id});

    const sessionData = createSession();

    const userSession = await SessionsCollection.create({
        userId: user._id,
        ...sessionData
    });

    return userSession;
};

export const refreshUser = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if(!session)
    throw createHttpError(401, 'Session not found');

  const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
  };

  export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });
  };

  export const sendResetUser = async (email) => {
    const user = await UserCollection.findOne({email});
    console.log(user);

      if (!user) {
        throw createHttpError(404, 'User not found');
      };

      const resetToken = createJwtToken({sub: user._id, email,});
      console.log(resetToken);

      const resetPasswordTemplatePath = path.join(TEMPLATES_DIR, 'send-reset-email.html');

      const templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString();

      const template = handlebars.compile(templateSource);
      const html = template({
        name: user.name,
        link: `${env(SMTP.APP_DOMAIN)}/auth/send-reset-email?token=${resetToken}`,
      });

      const emailSent = await sendEmail({
        to: email,
        subject: "Reset your password",
        html,
      });

      if (!emailSent) {
        throw createHttpError(500, 'Failed to send the email, please try again later.');
      }
  };


  export const resetPassword = async (payload) => {
    const entries = verifyToken(payload.token);

    const user = await UserCollection.findOne({
      email: entries.email,
      _id: entries.sub,
    });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UserCollection.updateOne(
      { _id: user._id },
      { password: encryptedPassword },
    );
  };
