import { ArrowLeft, ArrowRight, FileText, Loader2, Plus } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";

interface TaskPageHeaderProps {
    t: (key: string) => string;
    onCancel: () => void;
    onSubmit: () => void;
    isPending: boolean;
}

const TaskPageHeader: React.FC<TaskPageHeaderProps> = ({
    t,
    onCancel,
    onSubmit,
    isPending,
}) => {
    const { getDir } = useLanguage()
    const isRTL = getDir() == "rtl"

    return (
        <div className="">
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-dark/50 rounded-lg transition-colors text-gray-400 hover:text-twhite"
                        >
                            {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-600/20">
                                <FileText className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-twhite">{t("Create New Task")}</h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    {t("Fill in the details to create a new task")}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSubmit}
                            disabled={isPending}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white ${isPending ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("Creating...")}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    {t("Create Task")}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskPageHeader; 