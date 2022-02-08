import express, { Router } from "express";
import giftCardRouterRouter from "./gift";

const router:Router = express.Router();

router.use("/giftcard", giftCardRouterRouter);

export default router;