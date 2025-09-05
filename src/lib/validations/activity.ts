import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityType } from "@/constants/activity-type";

export const formSchemaGeneral = z.object({
  date: z
    .string()
    .min(10, { message: "入力してください" })
    .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
      message: "無効な値です",
    }),
  remarks: z.string(),
});

export const formSchemaCount = formSchemaGeneral.merge(
  z.object({
    count: z.coerce
      .number({
        message: "入力してください",
      })
      .min(1, {
        message: "入力してください",
      })
      .max(10000, {
        message: "10000以内にしてください",
      }),
  })
);

export const formSchemaDuration = formSchemaGeneral.merge(
  z.object({
    hours: z.coerce
      .number({
        message: "入力してください",
      })
      .min(0, {
        message: "0以上にしてください",
      })
      .max(23, {
        message: "23以下にしてください",
      })
      .optional(),
    minutes: z.coerce
      .number({
        message: "入力してください",
      })
      .min(0, {
        message: "0以上にしてください",
      })
      .max(59, {
        message: "59以下にしてください",
      })
      .optional(),
  })
);

export const formSchema = {
  [ActivityType.GENERAL]: formSchemaGeneral,
  [ActivityType.COUNT]: formSchemaCount,
  [ActivityType.DURATION]: formSchemaDuration,
};

export type FormValues = {
  [ActivityType.GENERAL]: z.infer<typeof formSchemaGeneral>;
  [ActivityType.COUNT]: z.infer<typeof formSchemaCount>;
  [ActivityType.DURATION]: z.infer<typeof formSchemaDuration>;
};

export const formResolver = {
  [ActivityType.GENERAL]: zodResolver(formSchemaGeneral),
  [ActivityType.COUNT]: zodResolver(formSchemaCount),
  [ActivityType.DURATION]: zodResolver(formSchemaDuration),
};
