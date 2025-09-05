"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { schema } from "@/db";
import { updateSettings } from "@/app/actions/setting";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { StepProgressTypeLabel } from "@/constants/step-progress-type";
import { useSessionSettings } from "@/contexts/session-settings-context";
import { signOut } from "@/lib/supabase-auth/auth-google";
import { FormValues, formResolver } from "@/lib/validations/settings";
import { useAlertDialog } from "@/stores/alert-dialog";

export function SettingsForm({ settings }: { settings: schema.Setting }) {
  const { setSessionSettings } = useSessionSettings();
  const router = useRouter();
  const { openDialog } = useAlertDialog();

  // フォームの初期値を設定
  const defaultValues: Partial<FormValues> = {
    activitySummaryDays: settings.activitySummaryDays,
    stepProgressType: String(settings.stepProgressType),
    categories: settings.categories.map((value: string) => ({
      name: value,
    })),
    theme: settings.theme as "system" | "light" | "dark",
  };

  // フォームを初期化
  const form = useForm<FormValues>({
    resolver: formResolver,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  // フォーム送信時の処理
  async function onSubmit(data: FormValues) {
    const result = await updateSettings({
      activitySummaryDays: data.activitySummaryDays,
      stepProgressType: data.stepProgressType,
      categories: data.categories,
      theme: data.theme,
    });

    if (result.ok) {
      setSessionSettings({
        activitySummaryDays: data.activitySummaryDays,
        stepProgressType: Number(data.stepProgressType),
        categories: data.categories.map((value) => value.name),
        theme: data.theme,
      });
      openDialog({
        title: "変更完了",
        description: "設定を保存しました。",
        onConfirm: () => {},
      });
    } else {
      openDialog({
        title: "エラー",
        description: "設定を保存に失敗しました。",
        onConfirm: () => {},
      });
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アプリケーションの設定を管理します
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            defaultValue="application"
            orientation="vertical"
            className="w-full"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <TabsList className="flex flex-row md:flex-col h-fit w-full md:w-48 p-1 bg-muted">
                <TabsTrigger
                  value="application"
                  className="w-full justify-center md:justify-start text-center md:text-left data-[state=active]:bg-background"
                >
                  アプリケーション
                </TabsTrigger>
                <TabsTrigger
                  value="display"
                  className="w-full justify-center md:justify-start text-center md:text-left data-[state=active]:bg-background"
                >
                  表示
                </TabsTrigger>
                <TabsTrigger
                  value="authentication"
                  className="w-full justify-center md:justify-start text-center md:text-left data-[state=active]:bg-background"
                >
                  認証
                </TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="application" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>アプリケーション設定</CardTitle>
                      <CardDescription>
                        アプリケーションの動作に関する設定を行います
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="activitySummaryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>活動記録のサマリーグラフ日数</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                className="w-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stepProgressType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>現在進行中のステップ</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(StepProgressTypeLabel).map(
                                    ([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <Label>カテゴリー</Label>
                        <Button
                          type="button"
                          onClick={() => append({ name: "" })}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          追加
                        </Button>
                      </div>
                      {fields.map((field, index) => (
                        <div key={field.id}>
                          <FormField
                            control={form.control}
                            name={`categories.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      type="text"
                                      {...field}
                                      placeholder={`カテゴリー ${index + 1}`}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => remove(index)}
                                      size="sm"
                                      variant="outline"
                                      className="px-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="display" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>表示設定</CardTitle>
                      <CardDescription>
                        アプリケーションの表示に関する設定を行います
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>モード</FormLabel>
                            <FormControl>
                              <RadioGroup
                                defaultValue={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="system"
                                    id="theme_system"
                                  />
                                  <Label htmlFor="theme_system">システム</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="light"
                                    id="theme_light"
                                  />
                                  <Label htmlFor="theme_light">ライト</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="dark"
                                    id="theme_dark"
                                  />
                                  <Label htmlFor="theme_dark">ダーク</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="authentication" className="space-y-6 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>認証設定</CardTitle>
                      <CardDescription>
                        認証に関する設定を行います
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const result = await signOut();
                          if (result) router.refresh();
                        }}
                      >
                        ログアウト
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
