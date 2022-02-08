import express, { Router } from "express";
import generateGiftCardController from "./generate";
import listGiftCardController from "./list";

const router:Router = express.Router();

router.get("/", listGiftCardController);
router.post("/buy", generateGiftCardController);

export default router;