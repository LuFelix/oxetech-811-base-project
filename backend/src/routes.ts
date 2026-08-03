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
import { authenticateToken } from "./middleware/auth.middleware";

const router = Router();

router.get("/health", healthCheck);
router.get("/users", authenticateToken, listUsers);
router.post("/users", createUser);
router.post("/auth/login", authController.login);
router.get("/tickets", authenticateToken, listTickets);
router.get("/tickets/summary", authenticateToken, getTicketSummary);
router.get("/tickets/:id", authenticateToken, getTicketById);
router.post("/tickets", authenticateToken, createTicket);
router.patch("/tickets/:id/status", authenticateToken, updateTicketStatus);
router.post("/tickets/:id/comments", authenticateToken, addTicketComment);

export default router;
