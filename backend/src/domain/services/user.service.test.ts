import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./user.service";
import * as repository from "../../infrastructure/database/prisma.repository";
import { ValidationError } from "../errors/app-error";

vi.mock("../../infrastructure/database/prisma.repository", () => ({
  saveUser: vi.fn(),
  getUserByEmail: vi.fn(),
}));

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPPORT_INVITE_CODE = "OXE-SUP-2026";
    process.env.TEACHER_INVITE_CODE = "OXE-PROF-2026";
  });

  describe("createUser", () => {
    it("should create a student user successfully when payload is valid and no invite code is provided", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      const user = await service.createUser("Marcos Teste", "marcos@email.com", "senha123");

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Marcos Teste");
      expect(user.email).toBe("marcos@email.com");
      expect(user.role).toBe("student");
      expect(user.password).toBeDefined();
      expect(repository.saveUser).toHaveBeenCalledWith(user);
    });

    it("should create a support user successfully when correct support invite code is provided", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      const user = await service.createUser("Marcos Sup", "marcos.sup@email.com", "senha123", "OXE-SUP-2026");

      expect(user.role).toBe("support");
      expect(repository.saveUser).toHaveBeenCalledWith(user);
    });

    it("should create a teacher user successfully when correct teacher invite code is provided", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      const user = await service.createUser("Marcos Teacher", "marcos.tea@email.com", "senha123", "OXE-PROF-2026");

      expect(user.role).toBe("teacher");
      expect(repository.saveUser).toHaveBeenCalledWith(user);
    });

    it("should throw ValidationError if name, email or password is empty", async () => {
      await expect(
        service.createUser("", "marcos@email.com", "senha123")
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createUser("Marcos", "", "senha123")
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createUser("Marcos", "marcos@email.com", "")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if email format is invalid", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      await expect(
        service.createUser("Marcos", "marcos_invalid", "senha123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if password is too short", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      await expect(
        service.createUser("Marcos", "marcos@email.com", "123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if email is already taken", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue({ id: "existing" } as any);

      await expect(
        service.createUser("Marcos", "marcos@email.com", "senha123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if invite code is invalid", async () => {
      vi.mocked(repository.getUserByEmail).mockResolvedValue(null);

      await expect(
        service.createUser("Marcos", "marcos@email.com", "senha123", "INVALID-CODE")
      ).rejects.toThrow(ValidationError);
    });
  });
});
