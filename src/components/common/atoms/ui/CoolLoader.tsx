import React from "react";

const CoolLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] w-full">
      {/* Main loader container */}
      <div className="relative w-24 h-24">
        {/* Two rotating rings */}
        <div
          className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
          style={{ animationDuration: "1s" }}
        />
        <div
          className="absolute inset-0 border-4 border-transparent border-l-purple-500 rounded-full animate-spin"
          style={{ animationDuration: "2s" }}
        />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Simple loading text */}
      <div className="mt-4 text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
        Loading...
      </div>
    </div>
  );
};

export default CoolLoader;
