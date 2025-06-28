import useLanguage from "@/hooks/useLanguage";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import React from "react";

export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (items: number) => void;
    totalItems: number;
    t: (key: string) => string;
}> = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems, t }) => {

    const { getDir } = useLanguage()
    const isRTL = getDir() == "rtl"
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            if (totalPages > 1) rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-dark border-t border-gray-700">
            {/* Items per page selector */}
            <div className={`flex  items-center gap-3`} >
                <span className="text-sm text-gray-400">{t("Show")}</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-secondary border border-gray-600 text-twhite rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-400">{t("per page")}</span>
            </div>

            {/* Page info */}
            <div className={`text-sm text-gray-400 ${isRTL ? 'text-right' : ''}`}>
                {isRTL
                    ? `${t("Showing")} ${startItem} ${t("to")} ${endItem} ${t("of")} ${totalItems} ${t("results")}`
                    : `${t("Showing")} ${startItem} ${t("to")} ${endItem} ${t("of")} ${totalItems} ${t("results")}`
                }
            </div>

            {/* Pagination controls */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("First page")}
                >
                    {isRTL ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("Previous page")}
                >
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-blue-500 text-white border border-blue-500'
                                        : 'border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50'
                                        }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("Next page")}
                >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:text-twhite hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("Last page")}
                >
                    {isRTL ? <ChevronsRight className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};