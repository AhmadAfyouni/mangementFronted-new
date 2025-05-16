// In TaskDetailsPage component
// Update the TaskComments component usage:

<TaskComments
  comments={comments}
  comment={comment}
  setComment={setComment}
  attachedFile={attachedFile}
  setAttachedFile={setAttachedFile}
  fileInputRef={fileInputRef}
  handleFileChange={handleFileChange}
  handleSendComment={handleSendComment}
  handleViewFile={handleViewFileWithErrorHandling}
  isSubmitting={isSubmitting}
  isLoadingFile={isLoadingFile}
  uploadingComment={uploadingComment} // Add this line
  // Edit/Delete props
  editingComment={editingComment}
  editText={editText}
  setEditText={setEditText}
  startEditComment={startEditComment}
  cancelEditComment={cancelEditComment}
  saveCommentEdit={saveCommentEdit}
  deleteComment={deleteComment}
/>
