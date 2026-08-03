import type { Ticket, TicketComment, User, AuditLog } from "../types";
import { sanitizeUser } from "./user.mapper";

export function mapTicketDetails(
  ticket: Ticket,
  users: User[],
  comments: TicketComment[],
  includeFullDetails = false,
  auditLogs: AuditLog[] = [],
) {
  const requester = sanitizeUser(users.find((user) => user.id === ticket.requesterId));
  const assigned = sanitizeUser(users.find((user) => user.id === ticket.assignedToId));
  const ticketComments = comments.filter((comment) => comment.ticketId === ticket.id);

  if (includeFullDetails) {
    const commentsWithAuthor = ticketComments.map((comment) => ({
      ...comment,
      author: sanitizeUser(users.find((user) => user.id === comment.authorId)),
    }));

    const ticketAuditLogs = auditLogs
      .filter((log) => log.ticketId === ticket.id)
      .map((log) => ({
        ...log,
        user: sanitizeUser(users.find((user) => user.id === log.userId)),
      }));

    return {
      ...ticket,
      requester,
      assigned,
      comments: commentsWithAuthor,
      auditLogs: ticketAuditLogs,
    };
  }

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: ticketComments.length,
  };
}
