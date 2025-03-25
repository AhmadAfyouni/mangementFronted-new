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
} from "reactflow";
import "reactflow/dist/style.css";

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
    nodesep: 50,
    marginx: 100,
    marginy: 100,
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.forEach((item) => {
    dagreGraph.setNode(item.id, { label: item.name, width: 150, height: 50 });

    nodes.push({
      id: item.id,
      type: "custom",
      data: {
        label: `${item.name} - ${item.title}`,
        is_manager: item.is_manager,
        department: item.department,
      },
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

// const generateLayout = (data: EmpTree[]) => {
//   const dagreGraph = new dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   dagreGraph.setGraph({ rankdir: "TB", align: "UL", marginx: 50, marginy: 50 });

//   const nodes: Node[] = [];
//   const edges: Edge[] = [];

//   data.forEach((item) => {
//     dagreGraph.setNode(item.id, { label: item.name, width: 150, height: 50 });
//     nodes.push({
//       id: item.id,
//       type: "custom",

//       data: {
//         label: item.name + " - " + item.title,
//         is_manager: item.is_manager,
//         department: item.department,
//       },
//       position: { x: 0, y: 0 },
//     });

//     if (item.parentId) {
//       dagreGraph.setEdge(item.parentId, item.id);
//       edges.push({
//         id: `e-${item.parentId}-${item.id}`,
//         source: item.parentId,
//         target: item.id,
//       });
//     }
//   });

//   dagre.layout(dagreGraph);

//   nodes.forEach((node) => {
//     const { x, y } = dagreGraph.node(node.id);
//     node.position = { x, y };
//   });

//   return { nodes, edges };
// };

const EmployeeHierarchyTree: React.FC<EmployeeHierarchyTreeProps> = ({
  data,
  nodeStyles = (isLightMode, isManager) =>
    ` min-w-[120px] text-center shadow-md  !-z-50 ${
      isLightMode ? "bg-light-droppable-fade" : "bg-droppable-fade"
    } border-2 ${
      isManager ? "border-red-500/50" : "border-yellow-500/50"
    } text-twhite rounded-lg py-3 px-5`,
  nodeColors = { target: "#4A90E2", source: "#4A90E2" },
  width = "70%",
  lightMode = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dept, setDept] = useState<string>("");
  const CustomNode = ({ data }: NodeProps) => {
    return (
      <div className={nodeStyles(lightMode, data.is_manager)}>
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
        {dept && isModalOpen && dept == data.department && (
          <div
            className={`absolute w-fit text-nowrap  px-3 py-2 text-sm text-twhite bg-secondary rounded-r-lg rounded-tl-lg shadow-lg left-full bottom-full -translate-x-5 translate-y-2 transform  ml-2`}
          >
            {dept}
          </div>
        )}
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);
    setDept(node.data.department);
    setIsModalOpen(true);
  }, []);

  const { selector } = useRedux((state: RootState) => state.wrapper);

  return (
    <div
      className={`h-[500px] w-[${width}] border-4 border-slate-600 rounded-3xl shadow-lg   !-z-50 ${
        selector.isLoading ? "blur-sm" : ""
      } `}
    >
      {
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
        </ReactFlow>
      }

      {/* {dept && (
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("Department")}
          content={[dept]}
          language={currentLanguage as "en" | "ar"}
          actionText={t("Close")}
        />
      )} */}
    </div>
  );
};

export default EmployeeHierarchyTree;
