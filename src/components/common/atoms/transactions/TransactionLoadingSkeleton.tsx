import React from "react";

const TransactionLoadingSkeleton = () => (
  <div className=" bg-secondary rounded-xl p-6 animate-pulse border border-slate-600">
    <div className="h-6 bg-main rounded w-1/3 mb-4"></div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-main rounded w-full"></div>
      <div className="h-4 bg-main rounded w-2/3"></div>
    </div>
    <div className="space-y-4">
      <div className="h-8 bg-main rounded"></div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-main rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export default TransactionLoadingSkeleton;
