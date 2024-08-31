// src/routes/botRouter.js

import { Router } from "express";
import botController from "../controllers/bot.controller.js";
import { bodyEmptyValidations } from "../middlewares/body.empty.validations.js";

const router = new Router();

router.get("/", (req, res) => {
    res.status(200).send("Hello bot");
});

router.post("/find_role", bodyEmptyValidations, botController.findRole);

export default router;