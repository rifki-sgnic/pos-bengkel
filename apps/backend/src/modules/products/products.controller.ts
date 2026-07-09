import { Request, Response } from "express";
import { productsService } from "./products.service";

export const productsController = {
  async create(req: Request, res: Response) {
    try {
      const product = await productsService.create(req.body);

      res
        .status(201)
        .json({ message: "Produk berhasil dibuat", data: product });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async findAll(req: Request, res: Response) {
    const role = req.user!.role;
    const products = await productsService.findAll(role);

    res.status(200).json({ data: products });
  },

  async findById(req: Request, res: Response) {
    try {
      const role = req.user!.role;
      const id = req.params.id as string;
      const product = await productsService.findById(id, role);

      res.status(200).json({ data: product });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(404).json({ message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await productsService.update(id, req.body);

      res
        .status(200)
        .json({ message: "Produk berhasil diupdate", data: product });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await productsService.deactivate(id);

      res.status(200).json({ message: "Produk berhasil dinonaktifkan" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async adjustStock(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;

      const result = await productsService.adjustStock(id, userId, req.body);

      res.status(200).json({ message: "Stok berhasil diupdate", data: result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      res.status(400).json({ message });
    }
  },

  async getLowStock(req: Request, res: Response) {
    const products = await productsService.getLowStock();

    res.status(200).json({ data: products });
  },
};
