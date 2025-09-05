import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ReactFlow,
  Edge,
  Node,
  useReactFlow,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  FlowNodeStep,
  FlowNodeStart,
} from "@/app/roadmaps/components/flow-node";
import type { StepWithGoals } from "@/types/api";

const StepFlow = forwardRef(
  (
    {
      onSelect,
    }: {
      onSelect: (node: Node, isNew: boolean) => void;
    },
    ref
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { fitView } = useReactFlow();
    const [needFitView, setNeedFitView] = useState(false);
    const [targetNode, setTargetNode] = useState<Node>();
    const [openOpSelect, setOpenOpSelect] = useState(false);

    useImperativeHandle(ref, () => ({
      getNodes: () => nodes,
      getEdges: () => edges,
      setNodes: (value: React.SetStateAction<Node[]>) => setNodes(value),
      setFlow: (steps: StepWithGoals[], isNew: boolean) => {
        const { nodes, edges } = createFlow(steps, isNew);
        setNodes(nodes);
        setEdges(edges);
        setNeedFitView(true);
      },
    }));

    useEffect(() => {
      if (needFitView) {
        setTimeout(() => {
          fitView({
            padding:
              nodes.length == 1
                ? { bottom: "70%" }
                : { top: "5%", left: "5%", right: "5%", bottom: "15%" },
          });
        }, 100);
        setNeedFitView(false);
      }
    }, [needFitView, fitView, nodes]);

    return (
      <>
        <div style={{ width: "100%", height: "100%" }}>
          <ReactFlow
            nodeTypes={{
              step: FlowNodeStep,
              start: FlowNodeStart,
            }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connection: Connection) =>
              setEdges((eds) => addEdge(connection, eds))
            }
            onNodeClick={(event: React.MouseEvent, node: Node) => {
              setTargetNode(node);
              setOpenOpSelect(true);
            }}
            fitView
          />
        </div>

        <Dialog open={openOpSelect}>
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                操作の選択
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-2">
              {targetNode && targetNode.id !== "0" && (
                <Button
                  variant="default"
                  onClick={() => {
                    setOpenOpSelect(false);
                    targetNode && onSelect(targetNode, false);
                  }}
                >
                  このステップを編集する
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => {
                  setOpenOpSelect(false);
                  if (targetNode) {
                    const { newNode, newEdge } = createNewNode(
                      targetNode,
                      nodes
                    );
                    setNodes([...nodes, newNode]);
                    setEdges([...edges, newEdge]);
                    setNeedFitView(true);
                    onSelect(newNode, true);
                  }
                }}
              >
                次のステップを追加する
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setOpenOpSelect(false);
                }}
              >
                キャンセル
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

function createNewNode(node: Node, nodes: Node[]) {
  const id = Math.random().toString(36).substring(2, 9);

  let x = node.position.x;
  const y = node.position.y + 100;
  while (
    nodes.find(
      (n) =>
        n.position.x <= x &&
        x <= n.position.x + (n.measured?.width ?? 0) &&
        n.position.y <= y &&
        y <= n.position.y + (n.measured?.height ?? 0)
    )
  ) {
    x += 100;
  }

  const newNode: Node = {
    id,
    type: "step",
    position: { x, y },
    data: { label: "", new: true },
  };
  const newEdge: Edge = {
    id,
    source: node.id,
    target: id,
  };
  return { newNode, newEdge };
}

function createFlow(
  steps: StepWithGoals[],
  isNew: boolean
): { nodes: Node[]; edges: Edge[] } {
  const newNodes: Node[] = steps.map((step: StepWithGoals) => ({
    id: String(step.id),
    type: "step",
    data: {
      label: step.title,
      note: step.note,
      goals: step.goals,
      allGoalsRequired: step.allGoalsRequired,
      new: isNew,
    },
    position: { x: 0, y: 0 },
  }));

  newNodes.unshift({
    id: "0",
    type: "start",
    data: {
      label: "開始",
    },
    position: { x: 0, y: 0 },
    selectable: false,
  });

  const newEdges: Edge[] = steps.reduce((acc: Edge[], step: StepWithGoals) => {
    if (step.parentIds && step.parentIds.length > 0) {
      step.parentIds.forEach((parentId: number) => {
        acc.push({
          id: `e${parentId}-${step.id}`,
          source: String(parentId),
          target: String(step.id),
        });
      });
    } else {
      acc.push({
        id: `e0-${step.id}`,
        source: "0",
        target: String(step.id),
      });
    }
    return acc;
  }, []);

  const layoutedNodes = getLayoutedNodes(newNodes, newEdges);

  return { nodes: layoutedNodes, edges: newEdges };
}

function getLayoutedNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  const NODE_WIDTH = 260;
  const NODE_HEIGHT = 60;

  // デフォルトのエッジのラベルにダミーデータとして空のオブジェクトを設定
  g.setDefaultEdgeLabel(() => ({}));

  // グラフのレイアウト方向はrankdirの値で決定されます。'LR'だとノードが左から右に並びます
  g.setGraph({ rankdir: "TB" });

  // ノードのIDとそのサイズ（幅と高さ）を指定して登録します
  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // ReactFlowで利用するエッジ情報から、source（ノードの接続元）とtarget（ノードの接続先）をそのまま登録します
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // レイアウトを実行
  dagre.layout(g);

  // レイアウトされたノードの位置情報を元にReactFlow用の位置情報に変換します
  const layoutedNodes = nodes.map((node) => {
    // Dagreから取得したノードの中心位置
    const { x, y } = g.node(node.id);
    return {
      ...node,
      // ReactFlowではノードの位置が左上基準なので、中心基準から左上基準に変換
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
    };
  });

  return layoutedNodes;
}

StepFlow.displayName = "StepFlow";
export default StepFlow;
