/* eslint-disable react/no-unescaped-entities */
"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import HomeGlance from "@/components/common/atoms/HomeGlance";
import PageSpinner from "@/components/common/atoms/ui/PageSpinner";
import HomeTasksReport from "@/components/common/molcules/HomeTasksReport";
import ProfileProjectsReport from "@/components/common/molcules/ProfileProjectsReport";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import { ReceiveTaskType } from "@/types/Task.type";
import { useState } from "react";

const Home = () => {
  const [scope, setScope] = useState<"weekly" | "monthly">("weekly");
  const isSecondary = useRolePermissions("secondary_user");

  const { data: tasksData, isLoading } = useCustomQuery<ReceiveTaskType[]>({
    queryKey: ["tasks", scope == "weekly" ? "weekly-tasks" : "monthly-tasks"],
    url: `/tasks/${scope == "weekly" ? "weekly-tasks" : "monthly-tasks"}`,
    nestedData: true,
  });

  return (
    <GridContainer>
      <div className=" col-span-full">
        <HomeGlance
          scope={scope}
          setScope={setScope}
          completedTasks={
            tasksData?.filter((task) => task.status == "DONE").length || 0
          }
        />
        {isLoading && <PageSpinner />}

        <HomeTasksReport tasksData={tasksData} />
        {!isSecondary && <ProfileProjectsReport isCentered={true} />}
      </div>
    </GridContainer>
  );
};

export default Home;
