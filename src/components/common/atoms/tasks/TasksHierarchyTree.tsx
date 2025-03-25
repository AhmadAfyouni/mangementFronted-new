"use client";

import { TaskTree } from "@/types/trees/Task.tree.type";
import dagre from "dagre";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Edge,
  EdgeChange,
  Handle,
  Node,
  NodeChange,
  NodeProps,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

type TaskHierarchyTreeProps = {
  data: TaskTree[];
  nodeStyles?: (isLightMode: boolean) => string;
  nodeColors?: { target: string; source: string };
  height?: number;
  width?: string;
  lightMode?: boolean;
};

const generateLayout = (data: TaskTree[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", align: "UL", marginx: 50, marginy: 50 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.forEach((item) => {
    dagreGraph.setNode(item.id, { label: item.name, width: 150, height: 50 });
    nodes.push({
      id: item.id,
      type: "custom",

      data: { label: item.name },
      position: { x: 0, y: 0 },
    });

    if (item.parentId) {
      dagreGraph.setEdge(item.parentId, item.id);
      edges.push({
        id: `e-${item.parentId}-${item.id}`,
        source: item.parentId,
        target: item.id,
      });
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id);
    node.position = { x, y };
  });

  return { nodes, edges };
};

const TaskHierarchyTree: React.FC<TaskHierarchyTreeProps> = ({
  data,
  nodeStyles = (isLightMode) =>
    `relative min-w-[120px] text-center shadow-md ${
      isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
    } border-2 ${"border-yellow-500/50"} text-twhite rounded-lg py-3 px-5`,
  nodeColors = { target: "#4A90E2", source: "#4A90E2" },
  width = "70%",
  lightMode = false,
}) => {
  const CustomNode = ({ data }: NodeProps) => {
    return (
      <div className={nodeStyles(lightMode)}>
        <strong>{data.label}</strong>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: nodeColors.target }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: nodeColors.source }}
        />
      </div>
    );
  };

  const nodeTypes = { custom: CustomNode };

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (data) {
      console.log("node data  :  ", data);

      const { nodes: generatedNodes, edges: generatedEdges } =
        generateLayout(data);
      setNodes(generatedNodes);
      setEdges(generatedEdges);
    }
  }, [data]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div
      className={`h-[500px] w-[${width}] border-4 border-slate-600 rounded-3xl shadow-lg`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default TaskHierarchyTree;
