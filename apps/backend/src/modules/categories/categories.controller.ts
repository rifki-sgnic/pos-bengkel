import { Request, Response } from "express";
import { categoriesService } from "./categories.service";

export const categoriesController = {
  async create(req: Request, res: Response) {
    try {
      const category = await categoriesService.create(req.body);
      res
        .status(201)
        .json({ message: "Kategori berhasil dibuat", data: category });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async findAll(req: Request, res: Response) {
    const categories = await categoriesService.findAll();
    res.status(200).json({ data: categories });
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      await categoriesService.delete(id);
      res.status(200).json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },
};
