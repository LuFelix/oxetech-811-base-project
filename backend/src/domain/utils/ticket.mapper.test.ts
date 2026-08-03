import { describe, it, expect } from "vitest";
import { mapTicketDetails } from "./ticket.mapper";
import type { Ticket, User, TicketComment } from "../types";

describe("ticket.mapper", () => {
  const mockUser: User = {
    id: "user_ana",
    name: "Ana",
    email: "ana@example.com",
    role: "student",
    password: "hashedpassword",
  };

  const mockTicket: Ticket = {
    id: "ticket_001",
    title: "Title",
    description: "Desc",
    category: "infra",
    status: "open",
    priority: "urgent",
    requesterId: "user_ana",
    assignedToId: undefined,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
  };

  const mockComment: TicketComment = {
    id: "comment_001",
    ticketId: "ticket_001",
    authorId: "user_ana",
    message: "Some message",
    createdAt: "2026-05-01T10:00:00.000Z",
  };

  it("should map ticket details and sanitize requester password", () => {
    const result = mapTicketDetails(mockTicket, [mockUser], [mockComment], false) as any;

    expect(result.requester).toBeDefined();
    expect(result.requester?.id).toBe("user_ana");
    expect((result.requester as any).password).toBeUndefined();
    expect(result.commentsCount).toBe(1);
  });

  it("should enrich comment author and sanitize author password", () => {
    const result = mapTicketDetails(mockTicket, [mockUser], [mockComment], true) as any;

    expect(result.comments).toBeDefined();
    expect(result.comments[0].author).toBeDefined();
    expect(result.comments[0].author?.id).toBe("user_ana");
    expect((result.comments[0].author as any).password).toBeUndefined();
  });

  it("should map audit logs and sanitize audit log user password", () => {
    const mockAudit = {
      id: "audit_001",
      ticketId: "ticket_001",
      userId: "user_ana",
      action: "status_changed",
      oldValue: "open",
      newValue: "in_progress",
      createdAt: "2026-05-01T10:05:00.000Z",
    };

    const result = mapTicketDetails(mockTicket, [mockUser], [mockComment], true, [mockAudit]) as any;

    expect(result.auditLogs).toBeDefined();
    expect(result.auditLogs[0].user).toBeDefined();
    expect(result.auditLogs[0].user?.id).toBe("user_ana");
    expect(result.auditLogs[0].user?.password).toBeUndefined();
    expect(result.auditLogs[0].action).toBe("status_changed");
  });
});
