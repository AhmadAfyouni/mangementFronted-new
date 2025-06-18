// Transactions.tsx
"use client";
import React, { useMemo, useState } from "react";
import { Option, transactionType } from "@/types/new-template.type";
import useLanguage from "@/hooks/useLanguage";
import useCustomQuery from "@/hooks/useCustomQuery";
import { SingleValue } from "react-select";
import CustomReactSelect from "@/components/common/atoms/ui/CustomReactSelect";
import ErrorState from "@/components/common/atoms/ui/ErrorState";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import TransactionCard from "@/components/common/atoms/transactions/TransactionCard";
import TransactionEmptyState from "@/components/common/atoms/transactions/TransactionEmptyState";
import TransactionLoadingSkeleton from "@/components/common/atoms/transactions/TransactionLoadingSkeleton";
import { useRedux } from "@/hooks/useRedux";
import { RootState } from "@/state/store";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type ViewType = "my" | "admin" | "department" | "execution" | "archive";

interface StatusTab {
  value: string;
  label: string;
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  t: (key: string) => string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  t
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
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
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-secondary rounded-lg">
      {/* Results Info */}
      <div className="text-sm text-tmid">
        {t("Showing")} <span className="font-medium text-twhite">{startItem}</span> {t("to")} <span className="font-medium text-twhite">{endItem}</span> {t("of")} <span className="font-medium text-twhite">{totalItems}</span> {t("results")}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-tmid hover:text-twhite disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("Previous")}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <div key={`dots-${index}`} className="px-3 py-2">
                  <MoreHorizontal className="w-4 h-4 text-tmid" />
                </div>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isCurrentPage
                  ? 'bg-tblack text-twhite border border-gray-600'
                  : 'text-tmid hover:text-twhite hover:bg-dark'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-tmid hover:text-twhite disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark rounded-lg transition-colors"
        >
          {t("Next")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Items Per Page Selector
interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  t: (key: string) => string;
}

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  t
}) => {
  const options = [5, 10, 20, 50];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-tmid">{t("Show")}</span>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="bg-secondary border border-gray-600 rounded px-2 py-1 text-twhite focus:border-blue-500 focus:outline-none"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <span className="text-tmid">{t("per page")}</span>
    </div>
  );
};

const Transactions = () => {
  const { t } = useLanguage();
  const [viewType, setViewType] = useState<ViewType>("my");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { selector: myDept } = useRedux(
    (state: RootState) => state.user.userInfo?.department
  );

  // View type options
  const viewOptions = useMemo(
    () => [
      { value: "my", label: t("My Transactions") },
      { value: "department", label: t("Department Transactions") },
      { value: "execution", label: t("Department Executions") },
      { value: "admin", label: t("Admin Approvals") },
      { value: "archive", label: t("Archived Transactions") },
    ],
    [t]
  );

  // Status tabs for each view type
  const statusTabs = useMemo(
    () => ({
      my: [
        { value: "ALL", label: "All" },
        { value: "NOT_APPROVED", label: "Not Approved" },
        { value: "PARTIALLY_APPROVED", label: "Partially Approved" },
        { value: "FULLY_APPROVED", label: "Fully Approved" },
        { value: "NEED_ADMIN_APPROVAL", label: "Need Admin Approval" },
        { value: "ADMIN_APPROVED", label: "Admin Approved" },
        { value: "ARCHIVE", label: "Archive" },
      ],
      department: [
        { value: "ALL", label: "All" },
        { value: "ONGOING", label: "Ongoing" },
        { value: "CHECKING", label: "Checking" },
      ],
      execution: [
        { value: "ALL", label: "All" },
        { value: "NOT_DONE", label: "NOT_DONE" },
        { value: "DONE", label: "DONE" },
      ],
      admin: [
        { value: "ALL", label: "All" },
        { value: "NEED_ADMIN_APPROVAL", label: "Need Admin Approval" },
      ],
      archive: [{ value: "ALL", label: "All" }],
    }),
    []
  );

  // Queries
  const {
    data: deptTransactions,
    isLoading: isDeptLoading,
    isError: isDeptError,
  } = useCustomQuery<{
    checking: transactionType[];
    ongoing: transactionType[];
  }>({
    url: "/transactions/department-transactions",
    queryKey: ["department-transactions"],
    enabled: viewType === "department",
  });

  const {
    data: myTransactions,
    isLoading: isMyTransLoading,
    isError: isMyTransError,
  } = useCustomQuery<transactionType[]>({
    url: "/transactions/my-transactions",
    queryKey: ["my-transactions"],
    enabled: viewType === "my",
  });

  const {
    data: adminTransactions,
    isLoading: isAdminLoading,
    isError: isAdminError,
  } = useCustomQuery<transactionType[]>({
    url: "/transactions/admin-approval",
    queryKey: ["admin-transactions"],
    enabled: viewType === "admin",
  });

  const {
    data: executionTransactions,
    isLoading: isExecutionLoading,
    isError: isExecutionError,
  } = useCustomQuery<transactionType[]>({
    url: "/transactions/execution",
    queryKey: ["execution-transactions"],
    enabled: viewType === "execution",
  });

  const {
    data: archiveTransactions,
    isLoading: isArchiveLoading,
    isError: isArchiveError,
  } = useCustomQuery<transactionType[]>({
    url: "/transactions/archived-transactions",
    queryKey: ["archived-transactions"],
    enabled: viewType === "archive",
  });

  // Get filtered transactions based on selected status
  const filteredTransactions = useMemo(() => {
    if (selectedStatus === "ALL") {
      switch (viewType) {
        case "my":
          return (myTransactions || []).filter((t) => !t.isArchive);
        case "department":
          return [
            ...(deptTransactions?.checking || []),
            ...(deptTransactions?.ongoing || []),
          ];
        case "execution":
          return executionTransactions || [];
        case "admin":
          return adminTransactions || [];
        case "archive":
          return archiveTransactions || [];
        default:
          return [];
      }
    }

    let transactions: transactionType[] = [];

    switch (viewType) {
      case "my":
        transactions = myTransactions || [];
        if (selectedStatus === "ARCHIVE") {
          return transactions.filter((t) => t.isArchive);
        }
        if (selectedStatus === "NEED_ADMIN_APPROVAL") {
          return transactions.filter(
            (t) =>
              t.status === "FULLY_APPROVED" &&
              t.template.needAdminApproval &&
              !t.isArchive
          );
        }
        return transactions.filter(
          (t) => t.status === selectedStatus && !t.isArchive
        );

      case "department":
        if (selectedStatus === "CHECKING") {
          return deptTransactions?.checking || [];
        }
        return deptTransactions?.ongoing || [];

      case "execution":
        transactions = executionTransactions || [];
        return transactions.filter((t) =>
          t.departments_execution.some((d) => d.status === selectedStatus)
        );

      case "admin":
        transactions = adminTransactions || [];
        if (selectedStatus === "NEED_ADMIN_APPROVAL") {
          return transactions.filter(
            (t) => t.status === "FULLY_APPROVED" && t.template.needAdminApproval
          );
        }
        return transactions;
      case "archive":
        transactions = archiveTransactions || [];
        return transactions;

      default:
        return [];
    }
  }, [
    selectedStatus,
    viewType,
    myTransactions,
    deptTransactions?.checking,
    deptTransactions?.ongoing,
    executionTransactions,
    adminTransactions,
    archiveTransactions,
  ]);

  // Calculate pagination
  const { paginatedTransactions, totalPages } = useMemo(() => {
    if (!filteredTransactions) return { paginatedTransactions: [], totalPages: 0 };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return { paginatedTransactions, totalPages };
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset to first page when view type, status, or items per page changes
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset to first page when view or status changes
  useMemo(() => {
    setCurrentPage(1);
  }, [viewType, selectedStatus]);

  // Calculate status counts
  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      ALL: 0,
    };

    switch (viewType) {
      case "my":
        if (!myTransactions) return counts;
        const nonArchivedTransactions = myTransactions.filter(
          (t) => !t.isArchive
        );
        counts.NOT_APPROVED = nonArchivedTransactions.filter(
          (t) => t.status === "NOT_APPROVED"
        ).length;
        counts.PARTIALLY_APPROVED = nonArchivedTransactions.filter(
          (t) => t.status === "PARTIALLY_APPROVED"
        ).length;
        counts.FULLY_APPROVED = nonArchivedTransactions.filter(
          (t) => t.status === "FULLY_APPROVED" && !t.template.needAdminApproval
        ).length;
        counts.NEED_ADMIN_APPROVAL = nonArchivedTransactions.filter(
          (t) => t.status === "FULLY_APPROVED" && t.template.needAdminApproval
        ).length;
        counts.ADMIN_APPROVED = nonArchivedTransactions.filter(
          (t) => t.status === "ADMIN_APPROVED"
        ).length;
        counts.ARCHIVE = myTransactions.filter((t) => t.isArchive).length;

        // Calculate ALL count by summing non-archive counts
        counts.ALL =
          counts.NOT_APPROVED +
          counts.PARTIALLY_APPROVED +
          counts.FULLY_APPROVED +
          counts.NEED_ADMIN_APPROVAL +
          counts.ADMIN_APPROVED;
        break;

      case "department":
        if (!deptTransactions) return counts;
        counts.CHECKING = deptTransactions.checking.length;
        counts.ONGOING = deptTransactions.ongoing.length;
        counts.ALL = counts.CHECKING + counts.ONGOING;
        break;

      case "execution":
        if (!executionTransactions) return counts;
        counts.NOT_DONE = executionTransactions.filter((t) =>
          t.departments_execution.some((d) => d.status === "NOT_DONE")
        ).length;
        counts.DONE = executionTransactions.filter((t) =>
          t.departments_execution.some((d) => d.status === "DONE")
        ).length;
        counts.ALL = counts.NOT_DONE + counts.DONE;
        break;

      case "admin":
        if (!adminTransactions) return counts;
        counts.NEED_ADMIN_APPROVAL = adminTransactions.filter(
          (t) => t.status === "FULLY_APPROVED" && t.template.needAdminApproval
        ).length;
        counts.ALL = counts.NEED_ADMIN_APPROVAL;
        break;
      case "archive":
        if (!archiveTransactions) return counts;
        counts.All = archiveTransactions.length;
        break;
    }

    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleViewTypeChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      setViewType(newValue.value as ViewType);
      setSelectedStatus("ALL");
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const isLoading =
    viewType === "my"
      ? isMyTransLoading
      : viewType === "department"
        ? isDeptLoading
        : viewType === "admin"
          ? isAdminLoading
          : viewType === "archive"
            ? isArchiveLoading
            : isExecutionLoading;

  const isError =
    viewType === "my"
      ? isMyTransError
      : viewType === "department"
        ? isDeptError
        : viewType === "admin"
          ? isAdminError
          : viewType === "archive"
            ? isArchiveError
            : isExecutionError;

  const renderStatusTabs = () => {
    const currentTabs = statusTabs[viewType];
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {currentTabs.map((tab: StatusTab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`
              px-4 py-2 rounded-lg transition-colors duration-200
              ${selectedStatus === tab.value
                ? "bg-secondary text-twhite"
                : "text-tmid hover:bg-secondary/50"
              }
              flex items-center gap-2 text-sm font-medium
            `}
          >
            {t(tab.label)}
            {tab.value !== "ALL" && statusCounts[tab.value] > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-tblack">
                {statusCounts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderTransactions = () => {
    if (isError) return <ErrorState />;

    if (isLoading) {
      return (
        <div className="gap-4">
          {[...Array(3)].map((_, i) => (
            <TransactionLoadingSkeleton key={`loading-${i}`} />
          ))}
        </div>
      );
    }

    if (!filteredTransactions.length) {
      return <TransactionEmptyState t={t} />;
    }

    return (
      <div className="bg-dark rounded-xl p-6">
        {/* Items per page selector and page info */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            t={t}
          />
          <div className="text-sm text-tmid">
            {t("Page")} {currentPage} {t("of")} {totalPages}
          </div>
        </div>

        {/* Transactions List */}
        <div className="gap-4">
          {paginatedTransactions.map((transaction) => {
            const isChecking =
              viewType === "archive" ||
              (viewType === "department" &&
                transaction.departments_approval_track.find(
                  (dept) => dept.department._id === myDept?.id
                )?.status === "CHECKING");

            return (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                viewType={viewType}
                showActions={!isChecking}
              />
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredTransactions.length}
          itemsPerPage={itemsPerPage}
          t={t}
        />
      </div>
    );
  };

  return (
    <GridContainer>
      <div className="col-span-full gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-twhite">
            {t("Transactions")}
          </h1>
          <div className="w-64">
            <CustomReactSelect
              value={viewOptions.find((opt) => opt.value === viewType)}
              options={viewOptions}
              onChange={handleViewTypeChange}
              isSearchable={false}
              menuPlacement="bottom"
              placeholder={t("Select view type")}
            />
          </div>
        </div>

        {/* Status Tabs */}
        {renderStatusTabs()}

        {/* Transactions List */}
        <div className="bg-main rounded-lg overflow-hidden">
          {renderTransactions()}
        </div>
      </div>
    </GridContainer>
  );
};

export default Transactions;