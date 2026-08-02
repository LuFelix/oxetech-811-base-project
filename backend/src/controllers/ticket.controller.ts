import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { NotFoundError } from "../domain/errors/app-error";
import { mapTicketDetails } from "../domain/utils/ticket.mapper";
import {
  calculateTicketSummary,
  filterTickets,
} from "../domain/utils/ticket.utils";
import { sanitizeUser } from "../domain/utils/user.mapper";
import * as repository from "../infrastructure/database/prisma.repository";
import * as ticketService from "../domain/services/ticket.service";

export function healthCheck(_request: AuthenticatedRequest, response: Response) {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
}

export async function listUsers(_request: AuthenticatedRequest, response: Response) {
  const users = await repository.getUsers();
  const sanitizedUsers = users.map((user) => sanitizeUser(user));
  response.json(sanitizedUsers);
}

export async function listTickets(request: AuthenticatedRequest, response: Response) {
  let tickets = await repository.getTickets();
  const users = await repository.getUsers();
  const comments = await repository.getComments();

  if (request.user?.role === "student") {
    tickets = tickets.filter((t) => t.requesterId === request.user?.id);
  }

  const { status, category, search } = request.query;

  const filteredTickets = filterTickets(tickets, {
    status: status as string,
    category: category as string,
    search: search as string,
  });

  const result = filteredTickets.map((ticket) => mapTicketDetails(ticket, users, comments));

  response.json(result);
}

export async function getTicketSummary(request: AuthenticatedRequest, response: Response) {
  let tickets = await repository.getTickets();
  if (request.user?.role === "student") {
    tickets = tickets.filter((t) => t.requesterId === request.user?.id);
  }
  const summary = calculateTicketSummary(tickets);
  response.json(summary);
}

export async function getTicketById(request: AuthenticatedRequest, response: Response) {
  const tickets = await repository.getTickets();
  const ticket = tickets.find((item) => item.id === (request.params.id as string));

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (request.user?.role === "student" && ticket.requesterId !== request.user?.id) {
    response.status(403).json({ error: "Acesso proibido: Permissão insuficiente" });
    return;
  }

  const users = await repository.getUsers();
  const comments = await repository.getComments();

  const enrichedTicket = mapTicketDetails(ticket, users, comments, true);

  response.json(enrichedTicket);
}

export async function createTicket(request: AuthenticatedRequest, response: Response) {
  const { requesterId } = request.body;
  if (request.user?.role === "student" && requesterId !== request.user.id) {
    response.status(403).json({ error: "Acesso proibido: Não é permitido criar chamados para outros usuários" });
    return;
  }

  const ticket = await ticketService.createTicket(request.body);
  response.status(201).json(ticket);
}

export async function updateTicketStatus(request: AuthenticatedRequest, response: Response) {
  if (request.user?.role === "student") {
    response.status(403).json({ error: "Acesso proibido: Permissão insuficiente" });
    return;
  }

  const { status, authorId, comment } = request.body;
  const ticket = await ticketService.updateTicketStatus(
    request.params.id as string,
    status,
    authorId,
    comment,
  );
  response.json(ticket);
}

export async function addTicketComment(request: AuthenticatedRequest, response: Response) {
  const tickets = await repository.getTickets();
  const ticket = tickets.find((item) => item.id === (request.params.id as string));

  if (!ticket) {
    throw new NotFoundError("Ticket nao encontrado");
  }

  if (request.user?.role === "student" && ticket.requesterId !== request.user?.id) {
    response.status(403).json({ error: "Acesso proibido: Permissão insuficiente" });
    return;
  }

  const { authorId, message } = request.body;
  const comment = await ticketService.addTicketComment(
    request.params.id as string,
    authorId,
    message,
  );
  response.status(201).json(comment);
}
