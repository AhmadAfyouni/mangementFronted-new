"use client";

import { DeptTree } from "@/types/trees/Department.tree.type";
import dagre from "dagre";
import { Layers } from "lucide-react";
import React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState
} from "reactflow";
import "reactflow/dist/style.css";

type ProjectDetailsHierarchyTreeProps = {
  data: DeptTree[];
  lightMode?: boolean;
  onPress: (deptId: string) => void;
};

const generateLayout = (data: DeptTree[]) => {
  console.log("🔍 generateLayout called with data:", data);

  if (!data || data.length === 0) {
    console.log("❌ No data provided to generateLayout");
    return { nodes: [], edges: [] };
  }

  // Create a mapping of original IDs to sanitized IDs
  const idMap = new Map<string, string>();
  const reverseIdMap = new Map<string, string>();

  data.forEach((item, index) => {
    const sanitizedId = `node-${index}`;
    idMap.set(item.id, sanitizedId);
    reverseIdMap.set(sanitizedId, item.id);
  });

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB",
    align: "UC",
    nodesep: 120,
    ranksep: 150,
    marginx: 80,
    marginy: 80
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeIds = new Set<string>();

  // First pass: Create all nodes with sanitized IDs
  data.forEach((item) => {
    const sanitizedId = idMap.get(item.id)!;
    console.log(`📊 Processing item: ${item.name} (Original ID: ${item.id}, Sanitized ID: ${sanitizedId}, Parent: ${item.parentId})`);

    nodeIds.add(sanitizedId);

    dagreGraph.setNode(sanitizedId, { label: item.name, width: 220, height: 90 });

    const nodeData = {
      id: sanitizedId, // Use sanitized ID for ReactFlow
      type: "default",
      data: {
        label: item.name,
        originalId: item.id // Store original ID in data
      },
      position: { x: 0, y: 0 },
      style: {
        background: item.parentId === null
          ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        minWidth: '220px',
        minHeight: '90px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }
    };

    nodes.push(nodeData);
  });

  // Second pass: Create edges with sanitized IDs
  data.forEach((item) => {
    if (item.parentId) {
      const sanitizedChildId = idMap.get(item.id)!;
      const sanitizedParentId = idMap.get(item.parentId);

      if (!sanitizedParentId) {
        console.error(`❌ Parent ID ${item.parentId} not found for item ${item.id}`);
        return;
      }

      dagreGraph.setEdge(sanitizedParentId, sanitizedChildId);
      const edgeData = {
        id: `e-${sanitizedParentId}-${sanitizedChildId}`,
        source: sanitizedParentId,
        target: sanitizedChildId,
        animated: true,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
        },
      };
      edges.push(edgeData);
      console.log(`➡️ Created edge from ${sanitizedParentId} to ${sanitizedChildId}`);
    }
  });

  try {
    dagre.layout(dagreGraph);
    console.log("✅ Dagre layout completed successfully");
  } catch (error) {
    console.error("❌ Dagre layout error:", error);
    nodes.forEach((node, index) => {
      node.position = {
        x: (index % 3) * 300,
        y: Math.floor(index / 3) * 200
      };
    });
    return { nodes, edges, idMap: reverseIdMap };
  }

  nodes.forEach((node) => {
    const nodeData = dagreGraph.node(node.id);
    if (nodeData) {
      const { x, y } = nodeData;
      node.position = {
        x: x - 110,
        y: y - 45
      };
      console.log(`📍 Node ${node.id} positioned at (${node.position.x}, ${node.position.y})`);
    } else {
      console.error(`❌ No position data for node ${node.id}`);
    }
  });

  console.log(`✅ Layout complete - Nodes: ${nodes.length}, Edges: ${edges.length}`);
  return { nodes, edges, idMap: reverseIdMap };
};

const ProjectDetailsHierarchyTree: React.FC<ProjectDetailsHierarchyTreeProps> = ({
  data,
  lightMode = false,
  onPress,
}) => {
  const { t } = useTranslation();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // Store the ID mapping
  const [idMap, setIdMap] = React.useState<Map<string, string>>(new Map());

  useEffect(() => {
    console.log("🔄 useEffect triggered with data:", data);

    if (data && data.length > 0) {
      try {
        const { nodes: generatedNodes, edges: generatedEdges, idMap: generatedIdMap } = generateLayout(data);
        console.log("📊 Generated nodes:", generatedNodes);
        console.log("📊 Generated edges:", generatedEdges);
        setNodes(generatedNodes);
        setEdges(generatedEdges);
        setIdMap(generatedIdMap || new Map());
      } catch (error) {
        console.error("❌ Error generating layout:", error);
        // Fallback: create nodes without dagre layout
        const fallbackNodes = data.map((item, index) => ({
          id: `node-${index}`,
          type: "default",
          data: {
            label: item.name,
            originalId: item.id
          },
          position: {
            x: (index % 3) * 300,
            y: Math.floor(index / 3) * 200
          },
          style: {
            background: item.parentId === null
              ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            minWidth: '220px',
            minHeight: '90px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }
        }));
        setNodes(fallbackNodes);
        setEdges([]);
      }
    } else {
      console.log("❌ No data or empty data array");
      setNodes([]);
      setEdges([]);
    }
  }, [data, setNodes, setEdges]);

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="relative h-[600px] w-full bg-main rounded-2xl shadow-inner overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <Layers className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-twhite mb-2">{t("noProjectStructure")}</h3>
          <p className="text-tdark">{t("noDepartmentsFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full bg-main rounded-2xl shadow-inner overflow-hidden">

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Layers className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-twhite">{t("projectStructure")}</h3>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.2
        }}
        style={{ background: '#1f2937' }}
        proOptions={{ hideAttribution: true }}
        onInit={(reactFlowInstance) => {
          console.log("🚀 ReactFlow initialized");
          setTimeout(() => {
            reactFlowInstance.fitView({
              padding: 0.2,
              duration: 800
            });
            console.log("✅ Fit view executed");
          }, 100);
        }}
        onNodeClick={(event, node) => {
          console.log(`🖱️ Node clicked: ${node.id} (Original ID: ${node.data.originalId})`);
          // Use the original ID for the callback
          const originalId = node.data.originalId || idMap.get(node.id) || node.id;
          onPress(originalId);
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background
          gap={20}
          size={1}
          color={lightMode ? "#e5e7eb" : "#374151"}
        />
        <Controls
          className="bg-secondary border-gray-700 rounded-lg shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

export default ProjectDetailsHierarchyTree;