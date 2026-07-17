import { Router } from "express";
import { authenticate, requireOwner } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { transactionsController } from "./transactions.controller";
import {
  createTransactionSchema,
  transactionQuerySchema,
  voidTransactionSchema,
} from "./transactions.schema";
import { validateQuery } from "../../middlewares/validateQuery";

const router = Router();

router.get(
  "/",
  authenticate,
  validateQuery(transactionQuerySchema),
  transactionsController.findAll,
);
router.get("/:id", authenticate, transactionsController.findById);
router.post(
  "/",
  authenticate,
  validate(createTransactionSchema),
  transactionsController.create,
);
router.patch(
  "/:id/void",
  authenticate,
  requireOwner,
  validate(voidTransactionSchema),
  transactionsController.void,
);

export default router;
