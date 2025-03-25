import { PaperClipIcon, PaperPlaneIcon, XIcon } from "@/assets";
import useLanguage from "@/hooks/useLanguage";
import {
  Comment,
  TaskDetailsModalProps,
} from "@/types/components/TaskDetailsModal.type";
import { apiClient } from "@/utils/axios/usage";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  taskData,
}) => {
  const [comment, setComment] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const { getDir } = useLanguage();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await apiClient.get<Comment[]>(
          `/comment/${taskData!.id}`
        );
        setComments(response);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, taskData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSendComment = async () => {
    if (comment.trim() || attachedFile) {
      try {
        // // Create a FormData object to handle file upload
        // const formData = new FormData();
        // formData.append("content", comment);
        // formData.append("taskId", taskData?.id || "");

        // // Check if there is an attached file and append it to the formData
        // if (attachedFile) {
        //   formData.append("files", attachedFile);
        // }

        const response = await apiClient.post<Comment>(`/comment`, {
          content: comment,
          taskId: taskData?.id,
        });

        setComments((prevComments) => [...prevComments, response]);
        setComment("");
        setAttachedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    } else {
      alert("Please write a comment or attach a file before sending.");
    }
  };

  if (!taskData) return null;
  const priorityColor =
    taskData.priority == "HIGH"
      ? "bg-red-100  text-red-600"
      : taskData.priority == "MEDIUM"
      ? "bg-yellow-100  text-yellow-600"
      : "bg-green-100  text-green-600";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Task Details"
      className="fixed inset-0 flex items-center justify-center "
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        dir={getDir()}
        className="bg-secondary text-twhite p-6 rounded-xl shadow-lg max-w-xl max-h-[80%] overflow-auto  w-full relative"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-tblack hover:text-red-500"
        >
          <Image src={XIcon} alt="x icon" width={16} height={16} />
        </button>

        <div className="flex justify-between items-center my-5">
          <div className="flex items-center space-x-2">
            <span className=" text-lg font-bold">{t("Task Details")}</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-300 px-4 py-2 rounded-2xl border-none text-tblack font-medium">
              {taskData.status}
            </div>
            <div
              className={
                "px-4 py-2 rounded-2xl border-none font-medium " + priorityColor
              }
            >
              {taskData.priority == "HIGH"
                ? t("High")
                : taskData.priority == "MEDIUM"
                ? t("Medium")
                : t("Low")}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">{taskData.name}</h2>

        {/* <div className="mb-6">
          <label className="font-bold mb-2 block">{t("Members")}</label>
          <div className="flex items-center space-x-2 mt-2">
            {taskData.emp ? (
              <div className="w-8 h-8 rounded-full bg-[#1b1a40] text-twhite flex items-center justify-center text-sm font-bold">
                {taskData.emp.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <span className="text-tmid">{t("No assigned employee")}</span>
            )}
            <div className="w-8 h-8 rounded-full bg-red-300 text-twhite flex items-center justify-center text-sm font-bold">
              AA
            </div>
            <div className="w-8 h-8 rounded-full bg-green-300 text-twhite flex items-center justify-center text-sm font-bold">
              MK
            </div>
            <button className="w-8 h-8 rounded-full bg-blue-100 text-[#1b1a40] flex items-center justify-center text-sm font-bold">
              +
            </button>
          </div>
        </div> */}

        <div className="mb-4">
          <label className="font-bold mb-2 block">{t("Description")}</label>
          <div className="text-twhite bg-main p-2 rounded-md">
            {taskData.description}
          </div>
        </div>

        <div className="flex justify-between mb-4">
          {/* <div>
            <label className="font-bold">{t("Task Type:")}</label>
            <p className="mt-1 text-twhite bg-main p-2 rounded-md text-center">
              {taskData.task_type.name}
            </p>
          </div> */}
          <div>
            <label className="font-bold">{t("Department:")}</label>
            <p className="text-twhite bg-main p-2 rounded-md text-center">
              {taskData.emp?.department
                ? taskData.emp?.department?.name
                : t("No department assigned")}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="font-bold">{t("Due Date:")}</label>
          <p className="text-twhite bg-main p-2 rounded-md w-fit  ">
            {new Date(taskData.due_date).toLocaleDateString()}
          </p>
        </div>
        <div className="mb-4">
          <div className="mt-4 p-2 bg-main  rounded-md shadow-sm">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-2 p-2 border-none outline-none focus:outline-none bg-main "
              placeholder={t("Add a comment...")}
              rows={2}
            />

            <div className="flex items-center justify-between mt-2">
              <div className=" bg-secondary rounded-md p-1 hover:bg-dark ">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="attach-file"
                />
                <label
                  htmlFor="attach-file"
                  className="cursor-pointer flex gap-1"
                >
                  {/* <FaPaperclip className="inline mr-1" />*/}
                  <Image
                    src={PaperClipIcon}
                    alt="paperclip icon"
                    width={16}
                    height={16}
                  />
                  {t("Attach File")}
                </label>
                {attachedFile && (
                  <span className="ml-2 text-sm text-tdark">
                    {attachedFile.name}
                  </span>
                )}
              </div>

              <button
                onClick={handleSendComment}
                className="bg-dark text-twhite px-3 py-1 rounded-md hover:bg-secondary gap-1 flex items-center"
              >
                {/* <FaPaperPlane className="mr-1" />  */}
                <Image
                  src={PaperPlaneIcon}
                  alt="paper plane icon"
                  width={16}
                  height={16}
                />
                {t("Send")}
              </button>
            </div>
          </div>

          <label className="font-bold my-2 block">{t("Comments")}</label>
          <div className="bg-main border shadow-md p-4 rounded-lg text-tblack space-y-2  ">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                // <div key={comment.id} className="bg-white p-2 rounded-md mb-2">
                //   <p className="text-sm text-tblack">
                //     <strong>{comment.author.name}:</strong> {comment.content}
                //   </p>
                //   {comment.files && comment.files.length > 0 && (
                //     <div className="mt-2">
                //       {comment.files.map((file, index) => (
                //         <div
                //           key={index}
                //           className="bg-gray-200 text-tblack p-1 px-2 rounded-md inline-block mr-2 mb-1"
                //         >
                //           <a
                //             href={file}
                //             target="_blank"
                //             rel="noopener noreferrer"
                //             className="text-[#1b1a40] underline"
                //           >
                //             View attachment
                //           </a>
                //         </div>
                //       ))}
                //     </div>
                //   )}
                // </div>
                <div key={index} className="flex gap-2 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-300 font-bold rounded-full flex items-center justify-center mr-4">
                    {comment.author.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-twhite font-semibold">
                      {comment.author.name}
                    </p>
                    <p className="text-xs text-tmid">
                      {formatDate(comment.createdAt)}
                    </p>
                    {comment.content && (
                      <div
                        className="bg-secondary  text-twhite rounded-md p-2 mt-2 text-sm"
                        dir={getDir()}
                      >
                        {comment.content}
                      </div>
                    )}
                    {comment.files && (
                      <div className="mt-2">
                        {comment.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-200 text-tblack p-1 px-2 rounded-md inline-block mr-2 mb-1"
                          >
                            {file}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>{t("No comments yet.")}</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
