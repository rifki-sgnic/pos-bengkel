import { Router } from "express";
import { authenticate, requireOwner } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { categoriesController } from "./categories.controller";
import { createCategorySchema } from "./categories.schema";

const router = Router();

router.get("/", authenticate, categoriesController.findAll);
router.post(
  "/",
  authenticate,
  requireOwner,
  validate(createCategorySchema),
  categoriesController.create,
);
router.delete("/:id", authenticate, requireOwner, categoriesController.delete);

export default router;
