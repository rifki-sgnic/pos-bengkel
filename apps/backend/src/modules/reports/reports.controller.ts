import { Request, Response } from "express";
import { reportsService } from "./reports.service";

export const reportsController = {
  async getSummary(req: Request, res: Response) {
    try {
      const summary = await reportsService.getSummary(req.validatedQuery);
      res.status(200).json({ data: summary });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async getTopProducts(req: Request, res: Response) {
    try {
      const topProducts = await reportsService.getTopProducts(
        req.validatedQuery,
      );
      res.status(200).json({ data: topProducts });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },
};
