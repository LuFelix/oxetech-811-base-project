import type { Request, Response } from "express";
import * as userService from "../domain/services/user.service";
import { sanitizeUser } from "../domain/utils/user.mapper";

export async function createUser(request: Request, response: Response) {
  const { name, email, password, inviteCode } = request.body;
  const user = await userService.createUser(name, email, password, inviteCode);
  response.status(201).json(sanitizeUser(user));
}
