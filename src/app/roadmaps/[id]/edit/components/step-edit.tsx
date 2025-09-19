import { forwardRef, useImperativeHandle } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X } from "lucide-react";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  Separator,
} from "@/components/ui";
import { ActivityType } from "@/constants/activity-type";
import { FormValues, formResolver } from "@/lib/validations/step";

const StepEdit = forwardRef(
  (
    {
      onSubmit,
      onCancel,
      onDelete,
      open,
      isNew,
    }: {
      onSubmit: (values: FormValues) => void;
      onCancel: () => void;
      onDelete: () => void;
      open: boolean;
      isNew: boolean;
    },
    ref
  ) => {
    const form = useForm<FormValues>({
      resolver: formResolver,
      defaultValues: {
        title: "",
        note: "",
        allGoalsRequired: "false",
        type: ActivityType.GENERAL.toString(),
        goals: [{ title: "" }],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "goals",
    });

    useImperativeHandle(ref, () => ({
      reset: (values: any) => form.reset(values),
    }));

    return (
      <Dialog open={open}>
        <DialogContent className="max-h-[80vh] overflow-y-auto [&>button]:hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader className="mb-4">
                <DialogTitle>ステップの設定</DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-2 pl-4">
                          <FormLabel>活動記録の入力タイプ：</FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value={ActivityType.GENERAL.toString()}
                              >
                                自由入力のみ
                              </SelectItem>
                              <SelectItem value={ActivityType.COUNT.toString()}>
                                回数を入力
                              </SelectItem>
                              <SelectItem
                                value={ActivityType.DURATION.toString()}
                              >
                                時間を入力
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>ゴール</CardTitle>
                      <Button
                        type="button"
                        onClick={() =>
                          append({
                            title: "",
                          })
                        }
                        variant="outline"
                      >
                        追加
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {fields.map((field, index) => (
                      <div key={field.id} className="mb-4 space-y-1">
                        <FormField
                          control={form.control}
                          name={`goals.${index}.title`}
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
                                    placeholder="ステップ達成条件（ゴール）を入力"
                                    className="flex-1"
                                  />
                                  {fields.length > 1 && (
                                    <Button
                                      type="button"
                                      onClick={() => remove(index)}
                                      size="sm"
                                      variant="outline"
                                      className="px-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    {fields.length > 1 && (
                      <FormField
                        control={form.control}
                        name="allGoalsRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              複数ゴールがある場合のステップ達成条件
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-2"
                              >
                                <FormItem className="flex ">
                                  <FormControl>
                                    <RadioGroupItem value="false" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    いずれかのゴールを達成
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex">
                                  <FormControl>
                                    <RadioGroupItem value="true" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    全てのゴールを達成
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
              <DialogFooter className="mt-6">
                {!isNew && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    キャンセル
                  </Button>
                )}
                <Button type="submit">保存</Button>
              </DialogFooter>
              <Separator className="mt-6" />
              <DialogFooter className="mt-6 sm:justify-center">
                <Button
                  type="button"
                  onClick={onDelete}
                  className="bg-destructive"
                >
                  削除
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);

StepEdit.displayName = "StepEdit";
export default StepEdit;
