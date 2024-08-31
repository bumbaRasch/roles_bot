// src/routes/index.js
import { Router } from "express";
import botRouter from "./botRouter.js";

const router = new Router();

router.use("/bot", botRouter);

export default router;
