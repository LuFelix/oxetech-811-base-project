import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password";

describe("password utility", () => {
  it("should generate a valid bcrypt hash starting with $2a$", () => {
    const hash = hashPassword("minhaSenha123");
    expect(hash).toBeDefined();
    const isValidBcrypt = hash.startsWith("$2a$") || hash.startsWith("$2b$");
    expect(isValidBcrypt).toBe(true);
  });

  it("should verify correct password match", () => {
    const hash = hashPassword("testePass");
    expect(comparePassword("testePass", hash)).toBe(true);
  });

  it("should reject incorrect password", () => {
    const hash = hashPassword("testePass");
    expect(comparePassword("wrongPass", hash)).toBe(false);
  });
});
