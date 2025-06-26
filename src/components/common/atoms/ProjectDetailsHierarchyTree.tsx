"use client";

import { DeptTree } from "@/types/trees/Department.tree.type";
import dagre from "dagre";
import { Layers } from "lucide-react";
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
  if (!data || data.length === 0) {
    return { nodes: [], edges: [] };
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB",
    align: "UC", // Center alignment
    nodesep: 120, // More space between nodes horizontally
    ranksep: 150, // More space between levels vertically
    marginx: 80,
    marginy: 80
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.forEach((item) => {
    dagreGraph.setNode(item.id, { label: item.name, width: 200, height: 80 });

    const nodeData = {
      id: item.id,
      type: "default",
      data: {
        label: item.name
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
        justifyContent: 'center'
      }
    };

    nodes.push(nodeData);

    if (item.parentId) {
      dagreGraph.setEdge(item.parentId, item.id);
      const edgeData = {
        id: `e-${item.parentId}-${item.id}`,
        source: item.parentId,
        target: item.id,
        animated: true,
        style: {
          stroke: "#6b7280",
          strokeWidth: 2,
        },
      };
      edges.push(edgeData);
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeData = dagreGraph.node(node.id);
    if (nodeData) {
      const { x, y } = nodeData;
      node.position = {
        x: x - 110, // Center the nodes (half of minWidth: 220)
        y: y - 45   // Center vertically (half of minHeight: 90)
      };
    }
  });

  return { nodes, edges };
};

const ProjectDetailsHierarchyTree: React.FC<ProjectDetailsHierarchyTreeProps> = ({
  data,
  lightMode = false,
  onPress,
}) => {
  const { t } = useTranslation();

  // Remove custom node type to avoid errors

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      try {
        const { nodes: generatedNodes, edges: generatedEdges } = generateLayout(data);
        setNodes(generatedNodes);
        setEdges(generatedEdges);
      } catch (error) {
        console.error("Error generating layout:", error);
        setNodes([]);
        setEdges([]);
      }
    } else {
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
      {/* Debug info */}
      <div className="absolute top-4 right-4 z-20 bg-black/50 text-white text-xs p-2 rounded">
        Nodes: {nodes.length} | Edges: {edges.length} | Data: {data?.length || 0}
      </div>

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
          padding: 0.15,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.2
        }}
        style={{ background: '#1f2937' }}
        proOptions={{ hideAttribution: true }}
        onInit={(reactFlowInstance) => {
          setTimeout(() => {
            reactFlowInstance.fitView({
              padding: 0.15,
              duration: 800 // Smooth animation
            });
          }, 300);
        }}
        onNodeClick={(event, node) => onPress(node.id)}
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
