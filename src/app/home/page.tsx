/* eslint-disable react/no-unescaped-entities */
"use client";

import Dashboard from "@/components/common/atoms/dashboard/Dashboard";
import GridContainer from "@/components/common/atoms/ui/GridContainer";

const Home = () => {
  return (
    <GridContainer>
      <div className="col-span-full">
        <Dashboard />
      </div>
    </GridContainer>
  );
};

export default Home;