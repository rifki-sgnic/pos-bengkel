import { Router } from "express";
import { authenticate, requireOwner } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { productsController } from "./products.controller";
import {
  adjustStockSchema,
  createProductSchema,
  updateProductSchema,
} from "./products.schema";

const router = Router();

router.get("/", authenticate, productsController.findAll);
router.get("/low-stock", authenticate, productsController.getLowStock);
router.get("/:id", authenticate, productsController.findById);

router.post(
  "/",
  authenticate,
  requireOwner,
  validate(createProductSchema),
  productsController.create,
);
router.patch(
  "/:id",
  authenticate,
  requireOwner,
  validate(updateProductSchema),
  productsController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireOwner,
  productsController.deactivate,
);

router.post(
  "/:id/adjust-stock",
  authenticate,
  requireOwner,
  validate(adjustStockSchema),
  productsController.adjustStock,
);

export default router;
