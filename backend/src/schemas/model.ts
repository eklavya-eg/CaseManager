import z from "zod"

export const modelPost = z.object({
    name: z.string().min(5).refine(v=>v.endsWith(".pkl")||v.endsWith(".cb"), {message:"Must ends with model extensions"}),
    type: z.enum(["CLASSIFICATION", "ANOMALY_DETECTION"]),
})