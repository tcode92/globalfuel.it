import { z } from "zod";
import { PASSWORD_REGEX, zEmail } from "../../server/constants";

export const AuthLoginSchema = z.object({
  email: zEmail({
    invalid_error: "Email non valida.",
    invalid_type_error: "Email non valida.",
    required_error: "Email mancante.",
  }),
  password: z
    .string({
      required_error: "Password mancante.",
      invalid_type_error: "Password non valida.",
    })
    .min(10, {
      message: "Password non valida.",
    }),
});
export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;

export const AuthResetPasswordSchema = z
  .object({
    password: z.string().regex(PASSWORD_REGEX, {
      message: "La password inserita non è una password valida.",
    }),
    passwordConfirm: z.string(),
  })
  .superRefine((args, ctx) => {
    if (args.password !== args.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "La password non coincide con la conferma.",
      });
    }
  });
export type AuthResetPasswordInput = z.infer<typeof AuthResetPasswordSchema>;

export const AuthResetExternalPasswordSchema = z
  .object({
    password: z.string().regex(PASSWORD_REGEX, {
      message: "La password inserita non è una password valida.",
    }),
    passwordConfirm: z.string(),
    token: z.string().optional().nullable(),
  })
  .superRefine((args, ctx) => {
    if (args.password !== args.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "La password non coincide con la conferma.",
      });
    }
  });
export type AuthResetPasswordExternalInput = z.infer<
  typeof AuthResetExternalPasswordSchema
>;

export const AuthForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type AuthForgotPasswordInput = z.infer<typeof AuthForgotPasswordSchema>;
