import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Card,
  CardContent,
} from "@/components/ui";
import { useSessionSettings } from "@/contexts/session-settings-context";
import { FormValues, formResolver } from "@/lib/validations/roadmap";

const RoadmapEdit = forwardRef((props, ref) => {
  const { sessionSettings } = useSessionSettings();

  const form1 = useForm<FormValues>({
    resolver: formResolver,
    defaultValues: {
      title: "",
      note: "",
      category: "",
    },
  });

  useImperativeHandle(ref, () => ({
    getValues: () => form1.getValues(),
    reset: (values: any) => form1.reset(values),
  }));

  return (
    <Form {...form1}>
      <form>
        <Card>
          <CardContent className="space-y-4">
            {sessionSettings && sessionSettings.categories.length > 0 && (
              <div className="space-y-2">
                <FormField
                  control={form1.control}
                  name={`category`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[240px]">
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
                    </FormItem>
                  )}
                />
              </div>
            )}
            <div className="space-y-2">
              <FormField
                control={form1.control}
                name={`title`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="text" placeholder={"タイトル"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form1.control}
                name={`note`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea rows={4} placeholder={"メモ"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
});

RoadmapEdit.displayName = "RoadmapEdit";
export default RoadmapEdit;
