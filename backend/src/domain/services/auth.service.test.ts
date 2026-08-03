import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./auth.service";
import * as repository from "../../infrastructure/database/prisma.repository";
import { ValidationError } from "../errors/app-error";
import { hashPassword } from "../../services/security/password";
import jwt from "jsonwebtoken";

vi.mock("../../infrastructure/database/prisma.repository", () => ({
  getUserByEmail: vi.fn(),
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("login", () => {
    it("should login successfully and return sanitized user and token when credentials are correct", async () => {
      const mockPassword = hashPassword("correctpass");
      const mockUser = {
        id: "user_ana",
        name: "Ana",
        email: "ana@email.com",
        role: "student",
        password: mockPassword,
      };

      vi.mocked(repository.getUserByEmail).mockResolvedValue(mockUser as any);

      const result = await service.login("ana@email.com", "correctpass");

      expect(result.user).toEqual({
        id: "user_ana",
        name: "Ana",
        email: "ana@email.com",
        role: "student",
      });
      expect(result.token).toBeDefined();

      const decoded = jwt.verify(result.token, "test-secret") as any;
      expect(decoded.id).toBe("user_ana");
      expect(decoded.role).toBe("student");
    });

    it("should throw ValidationError if email or password is empty", async () => {
      await expect(
        service.login("", "pass")
      ).rejects.toThrow(ValidationError);

      await expect(
        service.login("email@email.com", "")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if user is not found in db", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      await expect(
        service.login("nonexistent@email.com", "pass")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if password does not match", async () => {
      const mockUser = {
        id: "user_ana",
        name: "Ana",
        email: "ana@email.com",
        role: "student",
        password: hashPassword("correctpass"),
      };

      vi.mocked(repository.getUserByEmail).mockResolvedValue(mockUser as any);

      await expect(
        service.login("ana@email.com", "wrongpass")
      ).rejects.toThrow(ValidationError);
    });
  });
});
