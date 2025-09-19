"use client";

import React, { use, useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { schema } from "@/db";
import { Edge, Node, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { StepWithGoals } from "@/types/api";
import { useAlertDialog } from "@/stores/alert-dialog";
import RoadmapEdit from "./components/roadmap-edit";
import StepEdit from "./components/step-edit";
import StepFlow from "./components/step-flow";
import { getRoadmap, updateRoadmap } from "@/app/actions/roadmap";
import { generateSteps } from "@/app/actions/ai";
import { FormValues as RoadmapValues } from "@/lib/validations/roadmap";
import { FormValues as StepValues } from "@/lib/validations/step";
import { StepInput } from "@/types/api";
import { ActivityType } from "@/constants/activity-type";

export default function RoadmapEditContainer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [stepGoal, setStepGoal] = useState<Node | null>(null);
  const router = useRouter();
  const { openDialog, closeDialog } = useAlertDialog();
  const [roadmap, setRoadmap] = useState<any>();
  const [openStepEdit, setOpenStepEdit] = useState(false);
  const [isStepNew, setIsStepNew] = useState(false);
  const roadmapEditRef = useRef({
    getValues: () => ({} as RoadmapValues),
    reset: (values: any) => values,
  });
  const stepEditRef = useRef({ reset: (values: StepValues) => values });
  const stepFlowRef = useRef({
    getNodes: () => [] as Node[],
    getEdges: () => [] as Edge[],
    setNodes: (value: React.SetStateAction<Node[]>) => false,
    setFlow: (steps: StepWithGoals[], isNew: boolean) => false,
  });
  const [isPending, setTransition] = useTransition();

  useEffect(() => {
    setTransition(async () => {
      openDialog({ type: "loading" });
      const result = await getRoadmap(id);
      if (result.ok && result.data) {
        setRoadmap(result.data);
        closeDialog();
      } else {
        openDialog({
          title: "エラー",
          description: "データの取得に失敗しました。",
          onConfirm: () => router.push("/roadmaps"),
        });
      }
    });
  }, [id, openDialog, closeDialog, router]);

  useEffect(() => {
    if (roadmap) {
      const data = roadmap;
      roadmapEditRef.current?.reset({
        title: data.title,
        note: data.note,
        categoryId: String(data.categoryId),
      });

      const steps = data.steps.map((step: StepWithGoals) => ({
        ...step,
        goals: step.goals,
      }));
      stepFlowRef.current?.setFlow(steps, false);
    }
  }, [roadmap]);

  return (
    <>
      <div className="min-h-screen py-6 px-6 space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex flex-col md:flex-row gap-2 justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ロードマップ編集
              </h1>
            </div>

            {/* 決定ボタンのみ右上に配置 */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/roadmaps")}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const result = await handleSubmitRoadmap(
                    id,
                    roadmapEditRef.current?.getValues(),
                    stepFlowRef.current?.getNodes(),
                    stepFlowRef.current?.getEdges()
                  );
                  if (result.ok) {
                    openDialog({
                      title: "更新完了",
                      description: "正常に更新が完了しました。",
                      onConfirm: () => router.push(`/roadmaps`),
                    });
                  } else {
                    openDialog({
                      title: "エラー",
                      description: "更新処理に失敗しました。",
                      onConfirm: () => {},
                    });
                  }
                }}
                disabled={isPending || !roadmap}
              >
                保存する
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左パネル - ロードマップ情報 */}
            <div className="lg:col-span-1">
              <RoadmapEdit ref={roadmapEditRef} />
            </div>

            {/* 右パネル - ステップ編集エリア */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>ステップとゴールの設定</CardTitle>
                  <Button
                    type="button"
                    onClick={async () => {
                      let isCanceled = false;
                      openDialog({
                        type: "fetching",
                        onCancel: () => {
                          isCanceled = true;
                        },
                      });
                      const result = await handleAI(
                        roadmapEditRef.current?.getValues()
                      );
                      if (!isCanceled) {
                        if (result.ok) {
                          stepFlowRef.current?.setFlow(result.data, true);
                        }
                        closeDialog();
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    自動生成
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <ReactFlowProvider>
                      <StepFlow
                        ref={stepFlowRef}
                        onSelect={(node, isNew) => {
                          setStepGoal(node);
                          stepEditRef.current?.reset({
                            title: (node.data.label as string) || "",
                            note: (node.data.note as string) || "",
                            type: ActivityType.GENERAL.toString(),
                            goals: (node.data.goals as any[]) || [
                              {
                                title: "",
                              },
                            ],
                            allGoalsRequired: (node.data
                              .allGoalsRequired as boolean)
                              ? "true"
                              : "false",
                          });
                          setOpenStepEdit(true);
                          setIsStepNew(isNew);
                        }}
                      />
                    </ReactFlowProvider>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <StepEdit
        ref={stepEditRef}
        onSubmit={(values) => {
          handleSubmitStep(stepGoal, values);
          setOpenStepEdit(false);
        }}
        onCancel={() => setOpenStepEdit(false)}
        onDelete={() => {
          stepFlowRef.current?.setNodes((nds) =>
            nds.filter((node) => node.id !== stepGoal?.id)
          );
          setOpenStepEdit(false);
        }}
        open={openStepEdit}
        isNew={isStepNew}
      />
    </>
  );
}

async function handleAI(data: RoadmapValues) {
  return await generateSteps(data);
}

function handleSubmitStep(stepGoal: Node | null, values: StepValues) {
  if (stepGoal == null) return;
  stepGoal.data.label = values.title;
  stepGoal.data.note = values.note;
  stepGoal.data.goals = values.goals;
  stepGoal.data.allGoalsRequired = values.allGoalsRequired;
}

async function handleSubmitRoadmap(
  id: string,
  values: RoadmapValues,
  nodes: Node[],
  edges: Edge[]
) {
  const steps: StepInput[] = [];

  nodes.forEach((node: Node) => {
    if (node.id == "0") return;

    const parentIds = edges
      .filter(
        (edge: Edge) =>
          edge.target == node.id && nodes.some((n: Node) => n.id == edge.source)
      )
      .map((edge: Edge) => edge.source);
    if (parentIds.length == 0) {
      return;
    }

    steps.push({
      id: node.id,
      new: node.data.new as boolean,
      parentIds: parentIds,
      values: {
        title: node.data.label as string,
        note: node.data.note as string,
        type: node.data.type as string,
        goals: node.data.goals as {
          title: string;
          id?: string | undefined;
        }[],
        allGoalsRequired: node.data.allGoalsRequired ? "true" : "false",
      },
    });
  });
  return await updateRoadmap(id, values, steps);
}
