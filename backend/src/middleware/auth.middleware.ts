import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const secret = process.env.JWT_SECRET || "oxetech-helpdesk-super-secret-key-2026";
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Não autorizado: Token não fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Não autorizado: Token inválido ou expirado" });
    return;
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autorizado: Usuário não autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Acesso proibido: Permissão insuficiente" });
      return;
    }

    next();
  };
}
