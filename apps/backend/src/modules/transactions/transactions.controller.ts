import { Request, Response } from "express";
import { transactionsService } from "./transactions.service";

export const transactionsController = {
  async create(req: Request, res: Response) {
    try {
      const cashierId = req.user!.userId;
      const transaction = await transactionsService.create(req.body, cashierId);
      res
        .status(201)
        .json({ message: "Transaksi berhasil dibuat", data: transaction });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async findAll(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const transactions = await transactionsService.findAll({
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });
    res.status(200).json({ data: transactions });
  },

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const transaction = await transactionsService.findById(id);
      res.status(200).json({ data: transaction });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(404).json({ message });
    }
  },

  async void(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const transaction = await transactionsService.void(id, req.body, userId);
      res
        .status(200)
        .json({ message: "Transaksi berhasil di-void", data: transaction });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },
};
