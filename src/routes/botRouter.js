// src/routes/botRouter.js

import { Router } from "express";

const router = new Router();

router.get("/", (req, res) => {
    res.status(200).send("Hello bot");
});

export default router;