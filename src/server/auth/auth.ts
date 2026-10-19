import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { sendEmail } from "@/server/email";

export const auth = betterAuth({
  appName: "NSD Business Academy",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Stage 1: staff accounts are created by the CEO under Users & access.
    // Public student registration opens in Stage 2.
    disableSignUp: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60 * 24,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Set your NSD Business Academy password",
        text: `Hello ${user.name},\n\nUse this link to set your password. It expires in 24 hours.\n\n${url}\n\nIf you did not expect this email, ignore it.`,
      });
    },
    // Completing a reset proves the person controls the address the link was sent to.
    onPasswordReset: async ({ user }) => {
      await db.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email address",
        text: `Hello ${user.name},\n\nConfirm your email address for NSD Business Academy:\n\n${url}`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 12, // staff sessions last one working day
    updateAge: 60 * 60,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: env.isProduction,
  },
  plugins: [twoFactor({ issuer: "NSD Business Academy" }), nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
