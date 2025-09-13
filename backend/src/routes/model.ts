import { Router } from "express";
import { deleteModel, getModel, getModels, postModel } from "../controllers/model";
import { upload } from "..";

const router = Router();

router.get("/model", getModels)
router.post("/model", upload.single("file"), postModel)
router.get("/model/:id", getModel)
router.delete("/model:id", deleteModel)