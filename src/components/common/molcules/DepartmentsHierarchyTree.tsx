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
import CustomModal from "../atoms/modals/CustomModal";
import useLanguage from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Building2, Users, Briefcase, ChevronRight } from "lucide-react";

type DepartmentHierarchyTreeProps = {
  data: DeptTree[];
  nodeStyles?: (isLightMode: boolean, isManager?: boolean) => string;
  nodeColors?: { target: string; source: string };
  height?: number;
  width?: string;
  lightMode?: boolean;
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
    dagreGraph.setNode(item.id, { label: item.name, width: 220, height: 100 });
    nodes.push({
      id: item.id,
      type: "custom",
      data: { 
        label: item.name, 
        emps: item.emps,
        isMainDept: item.parentId === null,
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
    node.position = { x: x - 110, y: y - 50 };
  });

  return { nodes, edges };
};

const DepartmentHierarchyTree: React.FC<DepartmentHierarchyTreeProps> = ({
  data,
  nodeStyles,
  nodeColors = { target: "#3b82f6", source: "#3b82f6" },
  width = "100%",
  lightMode = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { t, currentLanguage } = useLanguage();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<{ name: string; emps: any[] } | null>(null);

  const CustomNode = ({ data, selected }: NodeProps) => {
    const isHovered = hoveredNode === data.id;
    const employeeCount = data.emps?.length || 0;
    
    const departmentClass = data.isMainDept 
      ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/50"
      : "bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/50";
    
    const defaultNodeStyles = `
      relative min-w-[220px] p-5 cursor-pointer transition-all duration-300
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
        className={nodeStyles ? nodeStyles(lightMode, data.isManager) : defaultNodeStyles}
        onMouseEnter={() => setHoveredNode(data.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => {
          if (data.emps && data.emps.length > 0) {
            setSelectedDept({ name: data.label, emps: data.emps });
            setIsModalOpen(true);
          }
        }}
      >
        {/* Department Icon and Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${data.isMainDept ? "bg-blue-500/20" : "bg-purple-500/20"}`}>
            <Building2 className={`w-5 h-5 ${data.isMainDept ? "text-blue-400" : "text-purple-400"}`} />
          </div>
          <div>
            <h3 className="font-bold text-twhite text-lg leading-tight">{data.label}</h3>
            {data.isMainDept && (
              <span className="text-xs text-gray-400 font-medium">{t("Main Department")}</span>
            )}
          </div>
        </div>

        {/* Employee Count */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {employeeCount} {t("Employees")}
            </span>
          </div>
          {employeeCount > 0 && (
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
          )}
        </div>

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
        <Building2 className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-twhite">{t("Department Structure")}</h3>
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
          nodeColor={node => node.data?.isMainDept ? "#3b82f6" : "#9333ea"}
          maskColor={lightMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"}
        />
      </ReactFlow>

      {/* Enhanced Employee Modal */}
      {selectedDept && (
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDept(null);
          }}
          title={`${selectedDept.name} - ${t("Employees")}`}
          content={
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDept.emps.map((emp, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-dark rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-twhite">{emp.name}</h4>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {emp.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
          language={currentLanguage as "en" | "ar"}
          actionText={t("Close")}
        />
      )}
    </div>
  );
};

export default DepartmentHierarchyTree;
