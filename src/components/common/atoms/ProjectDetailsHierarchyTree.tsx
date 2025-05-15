"use client";

import { DeptTree } from "@/types/trees/Department.tree.type";
import dagre from "dagre";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { FolderOpen, Building2, ExternalLink, Users } from "lucide-react";

type ProjectDetailsHierarchyTreeProps = {
  data: DeptTree[];
  nodeStyles?: (isLightMode: boolean, isManager?: boolean) => string;
  nodeColors?: { target: string; source: string };
  height?: number;
  width?: string;
  lightMode?: boolean;
  onPress: (deptId: string) => void;
};

const generateLayout = (data: DeptTree[]) => {
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
        isRootDept: item.parentId === null,
        employeeCount: item.emps?.length || 0,
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

const ProjectDetailsHierarchyTree: React.FC<ProjectDetailsHierarchyTreeProps> = ({
  data,
  nodeStyles,
  nodeColors = { target: "#3b82f6", source: "#3b82f6" },
  width = "100%",
  lightMode = false,
  onPress,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const CustomNode = ({ data, selected }: NodeProps) => {
    const isHovered = hoveredNode === data.id;
    
    const departmentClass = data.isRootDept 
      ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/50"
      : "bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/50";
    
    const defaultNodeStyles = `
      relative min-w-[200px] p-4 cursor-pointer transition-all duration-300
      ${lightMode ? "bg-white" : "bg-secondary"}
      ${departmentClass}
      ${isHovered ? "scale-105 shadow-xl" : "shadow-md"}
      border-2 rounded-xl
      ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
    `;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={nodeStyles ? nodeStyles(lightMode, false) : defaultNodeStyles}
        onMouseEnter={() => setHoveredNode(data.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => onPress(data.id)}
      >
        {/* Department Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              data.isRootDept ? "bg-purple-500/20" : "bg-blue-500/20"
            }`}>
              <Building2 className={`w-5 h-5 ${
                data.isRootDept ? "text-purple-400" : "text-blue-400"
              }`} />
            </div>
            <h3 className="font-bold text-twhite text-base leading-tight">
              {data.label}
            </h3>
          </div>
          <ExternalLink className={`w-4 h-4 text-gray-400 transition-transform ${
            isHovered ? "translate-x-1 -translate-y-1" : ""
          }`} />
        </div>

        {/* Employee Count */}
        {data.employeeCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>{data.employeeCount} Employees</span>
          </div>
        )}

        {/* Root Badge */}
        {data.isRootDept && (
          <div className="absolute -top-2 -right-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-500 text-white">
              Root
            </span>
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

  return (
    <div className={`relative h-[600px] w-full bg-main rounded-2xl shadow-inner overflow-hidden`}>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-twhite">Project Structure</h3>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
          nodeColor={node => node.data?.isRootDept ? "#9333ea" : "#3b82f6"}
          maskColor={lightMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"}
        />
      </ReactFlow>
    </div>
  );
};

export default ProjectDetailsHierarchyTree;
