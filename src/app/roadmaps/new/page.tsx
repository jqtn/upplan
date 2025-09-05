"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Input,
  Textarea,
  Button,
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { useSessionSettings } from "@/contexts/session-settings-context";
import { createRoadmap } from "@/app/actions/roadmap";
import { FormValues, formResolver } from "@/lib/validations/roadmap";

export default function NewRoadmapPage() {
  const router = useRouter();
  const { sessionSettings } = useSessionSettings();

  const defaultValues: Partial<FormValues> = {
    title: "",
    category: "0",
    note: "",
  };

  const form = useForm<FormValues>({
    resolver: formResolver,
    defaultValues,
  });

  async function onSubmit(data: FormValues) {
    const result = await createRoadmap(data);
    if (result.ok) {
      router.push(`/roadmaps/${result.id}/edit`);
    }
  }

  function onCancel() {
    () => router.push("/roadmaps");
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">新規ロードマップ作成</h1>
      <Card className="max-w-md mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 my-4">
              {sessionSettings && sessionSettings.categories.length > 0 && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリー</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="カテゴリーを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionSettings.categories.map(
                            (item: string, index: number) => (
                              <SelectItem
                                key={String(index)}
                                value={String(index)}
                              >
                                {item}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メモ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="補足などがあれば入力してください"
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
              <Button type="submit">作成する</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
