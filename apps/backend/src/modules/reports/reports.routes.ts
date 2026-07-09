import { Router } from "express";
import { authenticate, requireOwner } from "../../middlewares/auth";
import { validateQuery } from "../../middlewares/validateQuery";
import { reportsController } from "./reports.controller";
import { reportFilterSchema, topProductsFilterSchema } from "./reports.schema";

const router = Router();

router.get(
  "/summary",
  authenticate,
  requireOwner,
  validateQuery(reportFilterSchema),
  reportsController.getSummary,
);

router.get(
  "/top-products",
  authenticate,
  requireOwner,
  validateQuery(topProductsFilterSchema),
  reportsController.getTopProducts,
);

export default router;
