import { Plus, X, Loader2, Layers, Edit2, Users, UserCheck } from "lucide-react";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import { SectionType } from "@/types/Section.type";
import React, { ChangeEvent, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddSectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  sectionData?: SectionType;
}> = ({ isOpen, onClose, sectionData }) => {
  const { selector } = useRedux(
    (state: RootState) => state.user.userInfo?.department.id
  );
  const { isLightMode } = useCustomTheme();
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === "ar";
  const [section, setSection] = useState("");
  const [sectionType, setSectionType] = useState<"BY_ME" | "FOR_ME">("FOR_ME");
  const [error, setError] = useState("");

  const { mutate: addSection, isPending: isPendingSection } = useCreateMutation(
    {
      endpoint: sectionData ? `/sections/${sectionData._id}` : "/sections",
      onSuccessMessage: `Section ${sectionData ? "updated" : "added"} successfully!`,
      invalidateQueryKeys: ["sections"],
      onSuccessFn() {
        setSection("");
        setSectionType("FOR_ME");
        setTimeout(onClose, 500);
      },
      requestType: sectionData ? "put" : "post",
    }
  );

  useEffect(() => {
    if (sectionData) {
      setSection(sectionData.name);
      setSectionType(sectionData.type_section || "FOR_ME");
    }
  }, [sectionData]);

  const handleSubmit = () => {
    if (!section.trim()) {
      setError(t("Section name cannot be empty"));
      return;
    }

    setError("");
    const sectionData = {
      name: section.trim(),
      department: selector,
      type_section: sectionType,
    };

    addSection(sectionData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isPendingSection) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className={`w-[90%] max-w-lg ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-secondary rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 bg-dark/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {sectionData ? (
                        <Edit2 className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Layers className="w-5 h-5 text-green-400" />
                      )}
                      <h2 className="text-xl font-bold text-twhite">
                        {sectionData ? t("Update Section") : t("Add New Section")}
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Section Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t("Section Name")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={section}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setSection(e.target.value);
                          setError("");
                        }}
                        onKeyDown={handleKeyPress}
                        placeholder={t("Enter section name...")}
                        className={`w-full px-4 py-3 rounded-lg bg-dark text-twhite border 
                        ${error ? 'border-red-500' : 'border-gray-700'} 
                        focus:border-blue-500 focus:outline-none transition-colors
                        ${isLightMode ? 'bg-darker text-tblackAF' : ''}`}
                        autoFocus
                      />
                    </div>

                    {/* Section Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t("Section Type")} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSectionType("FOR_ME")}
                          className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${sectionType === "FOR_ME"
                            ? "border-blue-500 bg-blue-500/20 text-blue-400"
                            : "border-gray-700 bg-dark text-gray-400 hover:border-gray-600"
                            }`}
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("FOR ME")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSectionType("BY_ME")}
                          className={`p-3 rounded-lg border transition-colors flex items-center gap-2 ${sectionType === "BY_ME"
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-gray-700 bg-dark text-gray-400 hover:border-gray-600"
                            }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("BY ME")}</span>
                        </button>
                      </div>
                    </div>



                    {error && (
                      <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}

                    <div className="text-sm text-gray-400 bg-dark/50 p-3 rounded-lg border border-gray-700">
                      <p>
                        {sectionType === "FOR_ME"
                          ? t("This section will be created for tasks assigned to you.")
                          : t("This section will be created for tasks you create and assign to others.")
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-dark/50 border-t border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-700 text-twhite hover:bg-gray-600 transition-colors"
                    disabled={isPendingSection}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPendingSection || !section.trim()}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                     ${sectionData
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                      }
                     ${(isPendingSection || !section.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPendingSection ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {sectionData ? t("Updating...") : t("Creating...")}
                      </>
                    ) : (
                      <>
                        {sectionData ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {sectionData ? t("Update Section") : t("Create Section")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddSectionModal;
