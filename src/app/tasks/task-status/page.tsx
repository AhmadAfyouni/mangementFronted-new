"use client";

import useCustomQuery from "@/hooks/useCustomQuery";
import {
  handleDeleteStatusClick,
  handleEditStatusClick,
} from "@/services/task.service";
import { ITaskStatus } from "@/types/Task.type";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import React, { useState } from "react";
import CreateTaskStatus from "../../../components/common/molcules/CreateTaskStatus";
import { useTranslation } from "react-i18next";

const TaskStatusesView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<ITaskStatus | null>(null);
  const { t } = useTranslation();

  const {
    data: taskStatuses,
    isLoading,
    error,
    refetch,
  } = useCustomQuery<ITaskStatus[]>({
    queryKey: ["taskStatuses"],
    url: `/task-status/find-all`,
    nestedData: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-tblack">{t("Loading...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">{t("Failed to load task statuses.")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">{t("Task Statuses")}</h1>
      {taskStatuses && taskStatuses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                  {t("Name")}
                </th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                  {t("Description")}
                </th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {taskStatuses.map((taskStatus) => (
                <tr
                  key={taskStatus.id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <td className="py-3 px-4">{taskStatus.name}</td>
                  <td className="py-3 px-4">{taskStatus.description}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <EditIcon
                      className="cursor-pointer text-[#1b1a40]"
                      onClick={() =>
                        handleEditStatusClick({
                          taskStatus,
                          setEditData,
                          setIsModalOpen,
                        })
                      }
                    />
                    <DeleteIcon
                      className="cursor-pointer text-red-500"
                      onClick={() =>
                        handleDeleteStatusClick({
                          id: taskStatus.id,
                          refetch,
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-tdark mt-4">{t("No task statuses found.")}</p>
      )}
      <div className="flex justify-center mt-6">
        <button
          className="bg-[#413d99] text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200"
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
        >
          {t("Add Task Status")}
        </button>
      </div>

      <CreateTaskStatus
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskStatusData={editData}
      />
    </div>
  );
};

export default TaskStatusesView;
