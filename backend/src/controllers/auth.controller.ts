import type { Request, Response } from "express";
import * as authService from "../domain/services/auth.service";

export async function login(request: Request, response: Response) {
  const { email, password } = request.body;
  const result = await authService.login(email, password);
  response.json(result);
}
