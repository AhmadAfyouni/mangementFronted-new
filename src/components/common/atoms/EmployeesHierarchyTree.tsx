"use client";

import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import { EmpTree } from "@/types/trees/Emp.tree.type";
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
import { User, Briefcase, Building2, Crown, Shield } from "lucide-react";

type EmployeeHierarchyTreeProps = {
  data: EmpTree[];
  nodeStyles?: (isLightMode: boolean, isManager?: boolean) => string;
  nodeColors?: { target: string; source: string };
  height?: number;
  width?: string;
  lightMode?: boolean;
};

const generateLayout = (data: EmpTree[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "TB",
    align: "UL",
    ranksep: 100,
    nodesep: 60,
    marginx: 100,
    marginy: 100,
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.forEach((item) => {
    dagreGraph.setNode(item.id, { label: item.name, width: 200, height: 80 });

    nodes.push({
      id: item.id,
      type: "custom",
      data: {
        label: `${item.name}`,
        title: item.title,
        is_manager: item.is_manager,
        department: item.department,
        parentId: item.parentId,
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

const EmployeeHierarchyTree: React.FC<EmployeeHierarchyTreeProps> = ({
  data,
  nodeStyles,
  nodeColors = { target: "#3b82f6", source: "#3b82f6" },
  width = "100%",
  lightMode = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipNode, setTooltipNode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dept, setDept] = useState<string>("");

  const CustomNode = ({ data, selected }: NodeProps) => {
    const isHovered = hoveredNode === data.id;
    const showTooltip = tooltipNode === data.id;
    const isTopLevel = !data.parentId;

    const roleClass = data.is_manager
      ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/50"
      : isTopLevel
        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50"
        : "bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/50";

    const defaultNodeStyles = `
      relative min-w-[200px] p-4 cursor-pointer transition-all duration-300
      ${lightMode ? "bg-white" : "bg-secondary"}
      ${roleClass}
      ${isHovered ? "scale-105 shadow-xl" : "shadow-md"}
      border-2 rounded-xl
      ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
    `;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={nodeStyles ? nodeStyles(lightMode, data.is_manager) : defaultNodeStyles}
        onMouseEnter={() => {
          setHoveredNode(data.id);
          setDept(data.department);
          setTooltipNode(data.id);
        }}
        onMouseLeave={() => {
          setHoveredNode(null);
          setTooltipNode(null);
        }}
      >
        {/* Employee Info */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`relative p-2 rounded-lg ${data.is_manager ? "bg-red-500/20" : isTopLevel ? "bg-green-500/20" : "bg-blue-500/20"
            }`}>
            {data.is_manager ? (
              <Crown className="w-5 h-5 text-red-400" />
            ) : isTopLevel ? (
              <Shield className="w-5 h-5 text-green-400" />
            ) : (
              <User className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-twhite text-base leading-tight">{data.label}</h3>
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {data.title}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        {(data.is_manager || isTopLevel) && (
          <div className="absolute -top-2 -right-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${data.is_manager ? "bg-red-500 text-white" : "bg-green-500 text-white"
              }`}>
              {data.is_manager ? "Manager" : "Head"}
            </span>
          </div>
        )}

        {/* Department Tooltip */}
        {showTooltip && dept && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-fit text-nowrap px-3 py-2 text-sm text-twhite bg-secondary rounded-lg shadow-lg 
                       left-full bottom-full -translate-x-5 translate-y-2 transform ml-2 z-50"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {dept}
            </div>
            <div className="absolute left-0 bottom-0 w-3 h-3 bg-secondary transform rotate-45 translate-y-1.5 translate-x-4" />
          </motion.div>
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

  const { selector } = useRedux((state: RootState) => state.wrapper);

  return (
    <div className={`relative h-[600px] w-full bg-main rounded-2xl shadow-inner overflow-hidden ${selector.isLoading ? "blur-sm" : ""
      }`}>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <User className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-twhite">Employee Hierarchy</h3>
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
            if (node.data?.is_manager) return "#ef4444";
            if (!node.data?.parentId) return "#10b981";
            return "#3b82f6";
          }}
          maskColor={lightMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"}
        />
      </ReactFlow>
    </div>
  );
};

export default EmployeeHierarchyTree;
