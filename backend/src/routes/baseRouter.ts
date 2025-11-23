import { Router } from "express";
import {router as modelRouter} from "./model";
import {router as dataRouter} from "./data";
import {router as brokerRouter} from "./broker";
import {router as predictionsRouter} from "./predictions";
import {router as predictionStatusesRouter} from "./prediction_statuses";

class BaseRouter {
    constructor(public readonly router: Router){
        this.router.use("/v1", modelRouter)
        this.router.use("/v1", dataRouter)
        this.router.use("/v1", brokerRouter)
        this.router.use("/v1", predictionsRouter)
        this.router.use("/v1", predictionStatusesRouter)
    }
}

export const baseRouter = new BaseRouter(Router());