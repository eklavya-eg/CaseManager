import z from "zod";

export const getPredictionSchema = z.object({
    model_id: z.string(),
    data_id: z.string(),
})

export const getPredictionShapSchema = z.object({
    model_id: z.string(),
    data_id: z.string(),
    row_id: z.string(),
})