"use client";

import { MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Textarea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ActivityType } from "@/constants/activity-type";
import { formResolver, FormValues } from "@/lib/validations/activity";
import { useAlertDialog } from "@/stores/alert-dialog";

export default function ActivityFormCount({
  onSubmit,
  onComplete,
  onCancel,
  stepTitle,
  roadmapTitle,
  date,
  content,
  count,
}: {
  onSubmit: (data: FormValues[ActivityType.COUNT]) => void;
  onComplete: () => void;
  onCancel: () => void;
  stepTitle: string;
  roadmapTitle: string;
  date?: string;
  content?: string;
  count?: number;
}) {
  const { openDialog } = useAlertDialog();
  type LocalFormValues = FormValues[ActivityType.COUNT];

  // フォームの初期値を設定
  const defaultValues: Partial<LocalFormValues> = {
    date: date ?? new Date().toISOString().substring(0, 10),
    count: count ?? undefined,
    remarks: content ?? "",
  };

  // フォームを初期化
  const form = useForm<LocalFormValues>({
    resolver: formResolver[ActivityType.COUNT],
    defaultValues,
  });

  return (
    <Card className="max-w-md mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            async (data: LocalFormValues) => {
              await onSubmit(data);
              openDialog({
                title: "登録完了",
                description: "正常に登録が完了しました。",
                onConfirm: onComplete,
              });
            },
            (errors) => {
              console.log("Form validation errors:", errors);
            }
          )}
        >
          <CardHeader className="space-y-3 pb-1">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {roadmapTitle}
              </CardTitle>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">
                {stepTitle}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 my-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日付</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>回数</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備考</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="備考があれば入力"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex gap-2 pt-2 border-t justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit">保存する</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
