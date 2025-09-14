import { Router } from "express";
import { pushInference } from "../controllers/queue";

const router = Router()

router.post("/push", pushInference)