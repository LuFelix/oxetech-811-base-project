import { Router } from "express";
import {
  addTicketComment,
  createTicket,
  getTicketById,
  getTicketSummary,
  healthCheck,
  listTickets,
  listUsers,
  updateTicketStatus,
} from "./controllers/ticket.controller";
import { createUser } from "./controllers/user.controller";
import * as authController from "./controllers/auth.controller";

const router = Router();

router.get("/health", healthCheck);
router.get("/users", listUsers);
router.post("/users", createUser);
router.post("/auth/login", authController.login);
router.get("/tickets", listTickets);
router.get("/tickets/summary", getTicketSummary);
router.get("/tickets/:id", getTicketById);
router.post("/tickets", createTicket);
router.patch("/tickets/:id/status", updateTicketStatus);
router.post("/tickets/:id/comments", addTicketComment);

export default router;
