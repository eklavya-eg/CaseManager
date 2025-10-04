import z from "zod";

export const pushInferenceSchema = z.object({
    modelId: z.string(),
    datasetId: z.string(),
    accuracy_check: z.boolean().default(false),
    columnName: z.string().optional()
})