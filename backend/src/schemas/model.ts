import z, { minLength } from "zod"

export const modelPost = z.object({
    name: z.string().min(3),
    type: z.enum(["classification", "anomaly_detection"]),
})