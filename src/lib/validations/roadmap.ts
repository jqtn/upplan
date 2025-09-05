import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "入力してください",
    })
    .max(20, {
      message: "20文字以内にしてください",
    }),
  category: z.string().optional(),
  note: z.string().max(500, "500文字以内にしてください"),
});

export type FormValues = z.infer<typeof formSchema>;

export const formResolver = zodResolver(formSchema);
