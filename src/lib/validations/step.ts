import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityType } from "@/constants/activity-type";

export const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "入力してください。",
    })
    .max(30, {
      message: "30文字以内にしてください。",
    }),
  note: z.string().max(500, {
    message: "500文字以内にしてください。",
  }),
  type: z.enum(
    [
      ActivityType.GENERAL.toString(),
      ActivityType.COUNT.toString(),
      ActivityType.DURATION.toString(),
    ],
    { message: "選択してください" }
  ),
  allGoalsRequired: z.enum(["true", "false"]).optional(),
  goals: z.array(
    z.object({
      id: z.string().optional(),
      title: z
        .string()
        .min(1, {
          message: "入力してください。",
        })
        .max(50, {
          message: "50文字以内にしてください。",
        }),
    })
  ),
});

export type FormValues = z.infer<typeof formSchema>;

export const formResolver = zodResolver(formSchema);
