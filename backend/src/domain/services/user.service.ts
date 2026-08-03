import { hashPassword } from "../../services/security/password";
import { ValidationError } from "../errors/app-error";
import type { User, UserRole } from "../types";
import * as repository from "../../infrastructure/database/prisma.repository";
import { generateId } from "../utils/ticket.utils";

export async function createUser(
  name: string,
  email: string,
  plainPassword: string,
  inviteCode?: string,
): Promise<User> {
  if (!name || !email || !plainPassword) {
    throw new ValidationError("Nome, e-mail e senha são obrigatórios");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Formato de e-mail inválido");
  }

  // Validate password strength (minimum 6 characters)
  if (plainPassword.length < 6) {
    throw new ValidationError("A senha deve conter no mínimo 6 caracteres");
  }

  // Check if email already exists
  const existingUser = await repository.getUserByEmail(email);
  if (existingUser) {
    throw new ValidationError("Este e-mail já está cadastrado");
  }

  // Determine user role based on invite code
  let role: UserRole = "student";
  if (inviteCode && inviteCode.trim() !== "") {
    const supportCode = process.env.SUPPORT_INVITE_CODE || "OXE-SUP-2026";
    const teacherCode = process.env.TEACHER_INVITE_CODE || "OXE-PROF-2026";

    if (inviteCode === supportCode) {
      role = "support";
    } else if (inviteCode === teacherCode) {
      role = "teacher";
    } else {
      throw new ValidationError("Código de convite inválido");
    }
  }

  const hashedPassword = hashPassword(plainPassword);

  const newUser: User = {
    id: generateId("user"),
    name,
    email,
    role,
    password: hashedPassword,
  };

  await repository.saveUser(newUser);

  return newUser;
}
