import { Router } from "express";

const router = Router();

router.get("/").get(healthCheck);

export default router;
