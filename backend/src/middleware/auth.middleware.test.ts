import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticateToken, authorizeRoles } from "./auth.middleware";
import jwt from "jsonwebtoken";

describe("auth.middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("authenticateToken", () => {
    it("should call next() if valid token is provided in headers", () => {
      const payload = { id: "user_ana", name: "Ana", email: "ana@email.com", role: "student" };
      const token = jwt.sign(payload, "test-secret");
      mockRequest.headers["authorization"] = `Bearer ${token}`;

      authenticateToken(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe("user_ana");
    });

    it("should return 401 if authorization header is missing", () => {
      authenticateToken(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Não autorizado: Token não fornecido" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", () => {
      mockRequest.headers["authorization"] = "Bearer invalid-token";

      authenticateToken(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Não autorizado: Token inválido ou expirado" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorizeRoles", () => {
    it("should call next() if user has one of the allowed roles", () => {
      mockRequest.user = { id: "user_carla", role: "support" };
      const middleware = authorizeRoles("support", "teacher");

      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should return 401 if user is missing on request", () => {
      const middleware = authorizeRoles("support");

      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Não autorizado: Usuário não autenticado" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if user role is not allowed", () => {
      mockRequest.user = { id: "user_ana", role: "student" };
      const middleware = authorizeRoles("support", "teacher");

      middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Acesso proibido: Permissão insuficiente" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
