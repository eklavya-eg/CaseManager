import { Router } from "express";
import {router as modelRouter} from "./model";
import {router as dataRouter} from "./data";
import {router as brokerRouter} from "./broker";

class BaseRouter {
    constructor(public readonly router: Router){
        this.router.use("/v1", modelRouter)
        this.router.use("/v1", dataRouter)
        this.router.use("/v1", brokerRouter)
    }
}

export const baseRouter = new BaseRouter(Router());