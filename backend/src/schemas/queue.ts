import z from "zod"

export const pushInferenceSchema = z.object({
    modelId: z.string(),
    datasetId: z.string()
})