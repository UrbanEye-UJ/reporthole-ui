"use client";

import { useGetRecentIncidents } from "@/lib/hooks/useRecentIncidents";

import { incidentColumns } from "../tables/incidentColumns";
import DataTable from "../tables/DataTable";
import Panel from "../ui/Panel";

const RecentIncidents = () => {
  const { data, isLoading } = useGetRecentIncidents(10);
  const rows = (data?.data ?? []).map((incident) => ({
    id: incident.incidentId,
    ...incident,
  }));

  return (
    <Panel title="Recent Incidents">
      <DataTable rows={rows} columns={incidentColumns} loading={isLoading} height={380} />
    </Panel>
  );
};

export default RecentIncidents;
