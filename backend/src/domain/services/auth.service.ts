import jwt from "jsonwebtoken";
import { comparePassword } from "../../services/security/password";
import { ValidationError } from "../errors/app-error";
import * as repository from "../../infrastructure/database/prisma.repository";
import { sanitizeUser } from "../utils/user.mapper";
import type { SanitizedUser } from "../types";

export interface LoginResult {
  user: SanitizedUser;
  token: string;
}

export async function login(email: string, plain: string): Promise<LoginResult> {
  const secret = process.env.JWT_SECRET || "oxetech-helpdesk-super-secret-key-2026";

  if (!email || !plain) {
    throw new ValidationError("E-mail e senha são obrigatórios");
  }

  const user = await repository.getUserByEmail(email);
  if (!user) {
    throw new ValidationError("E-mail ou senha incorretos");
  }

  if (!comparePassword(plain, user.password)) {
    throw new ValidationError("E-mail ou senha incorretos");
  }

  const sanitized = sanitizeUser(user);

  // Generate JWT Token (valid for 24h)
  const token = jwt.sign(
    {
      id: sanitized.id,
      name: sanitized.name,
      email: sanitized.email,
      role: sanitized.role,
    },
    secret,
    { expiresIn: "24h" }
  );

  return {
    user: sanitized,
    token,
  };
}
