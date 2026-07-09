import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);

      res.status(201).json({ message: "Register berhasil", data: user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({ message: "Login berhasil", data: result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(401).json({ message });
    }
  },
};
