import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log route call
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Route called`);

    // Override res.json to log success
    const originalJson = res.json;
    res.json = function (body: any) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - SUCCESS (${duration}ms)`);
        return originalJson.call(this, body);
    };

    // Override res.status().json to log errors
    const originalStatus = res.status;
    res.status = function (code: number) {
        const duration = Date.now() - start;
        if (code >= 400) {
            console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ERROR ${code} (${duration}ms)`);
        }
        return originalStatus.call(this, code);
    };

    // Handle unhandled errors
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (res.statusCode >= 400) {
            console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ERROR ${res.statusCode} (${duration}ms)`);
        }
    });

    next();
};
