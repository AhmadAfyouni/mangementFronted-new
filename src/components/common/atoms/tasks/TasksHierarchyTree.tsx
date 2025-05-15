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
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { ChevronRight, Layers, CheckCircle, CircleDashed, PlayCircle } from "lucide-react";

type TaskHierarchyTreeProps = {
  data: TaskTree[];
  nodeStyles?: (isLightMode: boolean, status?: string) => string;
  nodeColors?: { target: string; source: string };
  height?: number;
  width?: string;
  lightMode?: boolean;
};

// Helper to get status icon
const getStatusIcon = (status?: string) => {
  switch (status) {
    case "DONE":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "ONGOING":
      return <PlayCircle className="w-4 h-4 text-blue-400" />;
    default:
      return <CircleDashed className="w-4 h-4 text-gray-400" />;
  }
};

// Helper to get priority color
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500/10 border-red-500/50";
    case "MEDIUM":
      return "bg-yellow-500/10 border-yellow-500/50";
    case "LOW":
      return "bg-green-500/10 border-green-500/50";
    default:
      return "bg-gray-500/10 border-gray-500/50";
  }
};

const generateLayout = (data: TaskTree[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: "TB", 
    align: "UL", 
    nodesep: 80, 
    ranksep: 120,
    marginx: 50, 
    marginy: 50 
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.forEach((item) => {
    dagreGraph.setNode(item.id, { label: item.name, width: 200, height: 80 });
    nodes.push({
      id: item.id,
      type: "custom",
      data: { 
        label: item.name,
        status: item.status,
        priority: item.priority,
        assignee: item.assignee,
        isOverdue: item.is_over_due,
      },
      position: { x: 0, y: 0 },
    });

    if (item.parentId) {
      dagreGraph.setEdge(item.parentId, item.id);
      edges.push({
        id: `e-${item.parentId}-${item.id}`,
        source: item.parentId,
        target: item.id,
        animated: true,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
        },
      });
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id);
    node.position = { x: x - 100, y: y - 40 };
  });

  return { nodes, edges };
};

const TaskHierarchyTree: React.FC<TaskHierarchyTreeProps> = ({
  data,
  nodeStyles,
  nodeColors = { target: "#3b82f6", source: "#3b82f6" },
  width = "100%",
  lightMode = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const CustomNode = ({ data, selected }: NodeProps) => {
    const isHovered = hoveredNode === data.id;
    const priorityClass = getPriorityColor(data.priority);
    
    const defaultNodeStyles = `
      relative min-w-[200px] p-4 cursor-pointer transition-all duration-300
      ${lightMode ? "bg-white" : "bg-secondary"}
      ${priorityClass}
      ${isHovered ? "scale-105 shadow-xl" : "shadow-md"}
      border-2 rounded-xl
      ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
    `;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={nodeStyles ? nodeStyles(lightMode, data.status) : defaultNodeStyles}
        onMouseEnter={() => setHoveredNode(data.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* Header with status icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(data.status)}
            <span className="font-semibold text-sm text-twhite">{data.status || "PENDING"}</span>
          </div>
          {data.isOverdue && (
            <span className="text-xs text-red-400 font-medium">Overdue</span>
          )}
        </div>

        {/* Task name */}
        <div className="text-twhite font-bold text-base mb-1 line-clamp-2">
          {data.label}
        </div>

        {/* Assignee */}
        {data.assignee && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {data.assignee.name?.charAt(0).toUpperCase()}
            </div>
            <span>{data.assignee.name}</span>
          </div>
        )}

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-gray-700"
          style={{ 
            background: nodeColors.target,
            top: -6,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-gray-700"
          style={{ 
            background: nodeColors.source,
            bottom: -6,
          }}
        />
      </motion.div>
    );
  };

  const nodeTypes = { custom: CustomNode };

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const { nodes: generatedNodes, edges: generatedEdges } = generateLayout(data);
      setNodes(generatedNodes);
      setEdges(generatedEdges);
    }
  }, [data]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className={`relative h-[600px] w-full bg-main rounded-2xl shadow-inner overflow-hidden`}>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Layers className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-twhite">Task Hierarchy</h3>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="!bg-transparent"
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color={lightMode ? "#e5e7eb" : "#374151"}
        />
        <Controls 
          className="!bg-secondary !border-gray-700 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap 
          className="!bg-secondary !border-gray-700 !rounded-lg !shadow-lg"
          nodeColor={node => {
            const priority = node.data?.priority;
            switch (priority) {
              case "HIGH": return "#ef4444";
              case "MEDIUM": return "#f59e0b";
              case "LOW": return "#10b981";
              default: return "#6b7280";
            }
          }}
          maskColor={lightMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"}
        />
      </ReactFlow>
    </div>
  );
};

export default TaskHierarchyTree;
