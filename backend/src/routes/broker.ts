import { Router } from "express";
import { brokerController } from "../controllers/broker";

export const router = Router()

router.post("/push", brokerController.pushInference)