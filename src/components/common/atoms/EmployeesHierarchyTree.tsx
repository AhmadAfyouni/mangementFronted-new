"use client";

import useLanguage from "@/hooks/useLanguage";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import dagre from "dagre";
import { Briefcase, Building2, Crown, Shield, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  NodeChange,
  Position,
  applyNodeChanges
} from "reactflow";
import "reactflow/dist/style.css";

interface NodeData {
  label: string;
  is_manager: boolean;
  parentId: string | null;
  department: string;
  title: string;
}

interface CustomNodeProps {
  data: NodeData;
}

// Custom node component styled to match department tree
const CustomNode = ({ data }: CustomNodeProps) => {
  const isManager = data.is_manager;
  const isTopLevel = !data.parentId;

  // Define colors based on role
  const borderColor = isManager ? "#ef4444" : isTopLevel ? "#10b981" : "#3b82f6";
  const bgGradient = isManager
    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.3))"
    : isTopLevel
      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))"
      : "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3))";

  const iconBgColor = isManager
    ? "rgba(239, 68, 68, 0.2)"
    : isTopLevel
      ? "rgba(16, 185, 129, 0.2)"
      : "rgba(59, 130, 246, 0.2)";

  const iconColor = isManager ? "#ef4444" : isTopLevel ? "#10b981" : "#3b82f6";
  const handleColor = isManager ? "#ef4444" : isTopLevel ? "#10b981" : "#3b82f6";
  const badgeColor = isManager ? "#ef4444" : "#10b981";

  return (
    <div
      style={{
        background: "#1f2937",
        backgroundImage: bgGradient,
        color: "white",
        border: `2px solid ${borderColor}`,
        padding: "16px",
        borderRadius: "12px",
        width: "240px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      }}
    >
      {/* Employee Info - Icon and Name/Title */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <div
          style={{
            background: iconBgColor,
            padding: "10px",
            borderRadius: "8px",
            marginRight: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isManager ? (
            <Crown size={20} color={iconColor} />
          ) : isTopLevel ? (
            <Shield size={20} color={iconColor} />
          ) : (
            <User size={20} color={iconColor} />
          )}
        </div>
        <div>
          <div style={{
            fontWeight: "bold",
            fontSize: "16px",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "170px"
          }}>{data.label}</div>
          <div style={{
            fontSize: "12px",
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            <Briefcase size={12} />
            {data.title || "No Title"}
          </div>
        </div>
      </div>

      {/* Department */}
      <div style={{
        display: "flex",
        alignItems: "center",
        fontSize: "12px",
        color: "#d1d5db",
        marginTop: "8px",
        gap: "4px"
      }}>
        <Building2 size={14} />
        <span style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>{data.department || "No Department"}</span>
      </div>

      {/* Role Badge */}
      {(isManager || isTopLevel) && (
        <div style={{
          position: "absolute",
          top: "-10px",
          right: "-10px",
          backgroundColor: badgeColor,
          color: "white",
          padding: "2px 8px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: "bold",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
        }}>
          {isManager ? "Manager" : "Head"}
        </div>
      )}

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: handleColor,
          width: "12px",
          height: "12px",
          border: "2px solid #1e293b",
          top: "-6px",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: handleColor,
          width: "12px",
          height: "12px",
          border: "2px solid #1e293b",
          bottom: "-6px",
        }}
      />
    </div>
  );
};

interface EmployeesHierarchyTreeProps {
  data: EmpTree[];
  width?: string;
  lightMode?: boolean;
}

const EmployeesHierarchyTree = ({ data, width = "100%" }: EmployeesHierarchyTreeProps) => {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Generate the layout using dagre
  useEffect(() => {
    if (!data || data.length === 0) return;

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: "TB",
      nodesep: 80,
      ranksep: 120,
      marginx: 50,
      marginy: 50
    });

    // Create nodes
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    data.forEach((emp: EmpTree) => {
      // Add node to dagre graph for layout calculation
      dagreGraph.setNode(emp.id, { width: 240, height: 110 });

      // Add node to our React Flow nodes array
      newNodes.push({
        id: emp.id,
        type: "custom", // Use our custom node
        position: { x: 0, y: 0 }, // Initial position, will be updated by dagre
        data: {
          label: emp.name,
          is_manager: emp.is_manager,
          parentId: emp.parentId,
          department: emp.department,
          title: emp.title,
        },
      });

      // If the employee has a parent, create an edge
      if (emp.parentId) {
        dagreGraph.setEdge(emp.parentId, emp.id);

        newEdges.push({
          id: `e-${emp.parentId}-${emp.id}`,
          source: emp.parentId,
          target: emp.id,
          animated: true,
          style: {
            stroke: "#6b7280",
            strokeWidth: 2
          },
        });
      }
    });

    // Calculate layout with dagre
    dagre.layout(dagreGraph);

    // Apply the layout to the nodes
    const nodesWithPositions = newNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 120,
          y: nodeWithPosition.y - 55,
        },
      };
    });

    setNodes(nodesWithPositions);
    setEdges(newEdges);
  }, [data]);

  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <div style={{
      width,
      height: "700px",
      background: "#0f172a",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <User style={{ width: "20px", height: "20px", color: "#60a5fa" }} />
        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}>
          {t("Employee Hierarchy")}
        </h3>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: "#0f172a" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls
          style={{
            border: "1px solid #374151",
            borderRadius: "8px",
            backgroundColor: "#1f2937",
          }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

export default EmployeesHierarchyTree;