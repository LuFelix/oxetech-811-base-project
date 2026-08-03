import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./email.service";
import nodemailer from "nodemailer";

const mockSendMail = vi.fn().mockResolvedValue({ messageId: "123" });

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: (...args: any[]) => mockSendMail(...args),
    }),
  },
}));

describe("email.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = "localhost";
    process.env.SMTP_PORT = "1025";
    process.env.SMTP_USER = "";
    process.env.SMTP_PASS = "";
    process.env.SMTP_FROM = "suporte@tiweb.app.br";
  });

  it("should send email successfully calling sendMail on transporter", async () => {
    await service.sendMail("test@example.com", "Test Subject", "<p>Test</p>");

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith({
      from: "suporte@tiweb.app.br",
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test</p>",
    });
  });

  it("should trigger sendTicketCreatedNotification correctly", async () => {
    const mockTicket = {
      id: "ticket_001",
      title: "Problema 1",
      description: "Descricao 1",
      category: "sistemas",
      priority: "high",
    };

    await service.sendTicketCreatedNotification("aluno@example.com", mockTicket);

    expect(mockSendMail).toHaveBeenCalled();
    const args = mockSendMail.mock.calls[0][0];
    expect(args.to).toBe("aluno@example.com");
    expect(args.subject).toContain("Chamado Criado: #ticket_001");
    expect(args.html).toContain("Problema 1");
    expect(args.html).toContain("sistemas");
  });

  it("should trigger sendCommentAddedNotification correctly", async () => {
    const mockComment = {
      authorName: "Carla Suporte",
      message: "Comentário teste",
    };

    await service.sendCommentAddedNotification("aluno@example.com", "ticket_001", mockComment);

    expect(mockSendMail).toHaveBeenCalled();
    const args = mockSendMail.mock.calls[0][0];
    expect(args.to).toBe("aluno@example.com");
    expect(args.subject).toContain("Novo comentário no chamado #ticket_001");
    expect(args.html).toContain("Carla Suporte");
    expect(args.html).toContain("Comentário teste");
  });

  it("should trigger sendStatusUpdatedNotification correctly", async () => {
    await service.sendStatusUpdatedNotification(
      "aluno@example.com",
      "ticket_001",
      "closed",
      "Carla Suporte",
      "Resolvido!"
    );

    expect(mockSendMail).toHaveBeenCalled();
    const args = mockSendMail.mock.calls[0][0];
    expect(args.to).toBe("aluno@example.com");
    expect(args.subject).toContain("Status Atualizado: Chamado #ticket_001");
    expect(args.html).toContain("closed");
    expect(args.html).toContain("Carla Suporte");
    expect(args.html).toContain("Resolvido!");
  });
});
