import z from "zod"

export const datasetPost = z.object({
    name: z.string().min(5).refine(v=>v.endsWith(".csv"), {message:"Must ends with .csv"})
})