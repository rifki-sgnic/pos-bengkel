import { Router } from "express";
import { authenticate, requireOwner } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { transactionsController } from "./transactions.controller";
import {
  createTransactionSchema,
  voidTransactionSchema,
} from "./transactions.schema";

const router = Router();

router.get("/", authenticate, transactionsController.findAll);
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
