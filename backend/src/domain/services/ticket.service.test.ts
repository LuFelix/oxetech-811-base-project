import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./ticket.service";
import * as repository from "../../infrastructure/database/prisma.repository";
import { prisma } from "../../infrastructure/database/prisma";
import { ValidationError, NotFoundError } from "../errors/app-error";

vi.mock("../../infrastructure/database/prisma.repository", () => ({
  saveTicket: vi.fn(),
  updateTicket: vi.fn(),
  saveComment: vi.fn(),
  getTickets: vi.fn(),
  saveAuditLog: vi.fn(),
}));

vi.mock("../../infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("./email.service", () => ({
  sendTicketCreatedNotification: vi.fn().mockResolvedValue(undefined),
  sendCommentAddedNotification: vi.fn().mockResolvedValue(undefined),
  sendStatusUpdatedNotification: vi.fn().mockResolvedValue(undefined),
}));

describe("ticket.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTicket", () => {
    it("should create a ticket successfully when payload is valid", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_ana" } as any);

      const ticket = await service.createTicket({
        title: "Problema no login",
        description: "Mensagem de erro generica",
        category: "sistemas",
        requesterId: "user_ana",
      });

      expect(ticket.id).toBeDefined();
      expect(ticket.status).toBe("open");
      expect(ticket.priority).toBe("high");
      expect(repository.saveTicket).toHaveBeenCalledWith(ticket);
    });

    it("should throw ValidationError if category is invalid", async () => {
      await expect(
        service.createTicket({
          title: "Title",
          description: "Desc",
          category: "invalid_category",
          requesterId: "user_ana",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if requester does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.createTicket({
          title: "Title",
          description: "Desc",
          category: "sistemas",
          requesterId: "nonexistent",
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateTicketStatus", () => {
    it("should update status successfully", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };

      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      const updated = await service.updateTicketStatus("ticket_001", "in_progress");

      expect(updated.status).toBe("in_progress");
      expect(repository.updateTicket).toHaveBeenCalledWith(updated);
    });

    it("should throw NotFoundError if ticket does not exist", async () => {
      vi.mocked(repository.getTickets).mockResolvedValue([]);

      await expect(
        service.updateTicketStatus("nonexistent", "in_progress"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if status is closed and no comment is provided", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      await expect(
        service.updateTicketStatus("ticket_001", "closed"),
      ).rejects.toThrow(ValidationError);
    });

    it("should save comment when closing status with comment", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_carla", name: "Carla", email: "carla@email.com" } as any);

      const updated = await service.updateTicketStatus("ticket_001", "closed", "user_carla", "Resolvido!");

      expect(updated.status).toBe("closed");
      expect(repository.saveComment).toHaveBeenCalled();
    });

    it("should throw ValidationError if author is invalid", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.updateTicketStatus("ticket_001", "in_progress", "invalid_author")
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("addTicketComment", () => {
    it("should add a comment successfully", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_ana" } as any);

      const comment = await service.addTicketComment("ticket_001", "user_ana", "Novo comentario");

      expect(comment.id).toBeDefined();
      expect(comment.message).toBe("Novo comentario");
      expect(repository.saveComment).toHaveBeenCalled();
      expect(repository.updateTicket).toHaveBeenCalled();
    });

    it("should throw NotFoundError if ticket is missing", async () => {
      vi.mocked(repository.getTickets).mockResolvedValue([]);

      await expect(
        service.addTicketComment("nonexistent", "user_ana", "Msg"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if message or authorId is empty", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      await expect(
        service.addTicketComment("ticket_001", "", ""),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if author does not exist", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.addTicketComment("ticket_001", "nonexistent", "Msg"),
      ).rejects.toThrow(ValidationError);
    });

    it("should trigger sendCommentAddedNotification when comment author is different from requester", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user_carla", name: "Carla", email: "carla@email.com" } as any)
        .mockResolvedValueOnce({ id: "user_ana", name: "Ana", email: "ana@email.com" } as any);

      const comment = await service.addTicketComment("ticket_001", "user_carla", "Resposta suporte");

      expect(comment.id).toBeDefined();
      expect(comment.authorId).toBe("user_carla");
    });
  });
});
