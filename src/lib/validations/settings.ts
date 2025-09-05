import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepProgressType } from "@/constants/step-progress-type";

export const formSchema = z.object({
  activitySummaryDays: z.coerce
    .number()
    .min(1, {
      message: "入力してください",
    })
    .max(100, { message: "100以内にしてください" }),
  stepProgressType: z.enum(
    [
      StepProgressType.SEQUENTIAL_ALL.toString(),
      StepProgressType.SEQUENTIAL_ANY.toString(),
      StepProgressType.PARALLEL_ALL.toString(),
    ],
    { message: "選択してください" }
  ),
  categories: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "入力してください" })
        .max(10, { message: "10文字以内にしてください" }),
    })
  ),
  theme: z.enum(["system", "light", "dark"], { message: "選択してください" }),
});

export type FormValues = z.infer<typeof formSchema>;

export const formResolver = zodResolver(formSchema);
