"use client";

import { Button, Grid } from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";
import MetricCard from "../../_components/ui/MetricCard";

// TODO(api): system status values from GET /admin/settings/status (if endpoint created)
// Save Changes button should call PUT /admin/settings once the form is built out
export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure Reporthole platform preferences."
        actions={
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
          >
            Save Changes
          </Button>
        }
      />

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="System Status"
            value="Online"
            icon={<SettingsRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Connected Users"
            value="26"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="API Version"
            value="v1.0"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Database"
            value="Connected"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Panel title="Application Settings">
            Settings form will be added here.
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Panel title="User Preferences">
            User preferences will be added here.
          </Panel>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="System Information">
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, md: 4 }}>
                <strong>Application:</strong> Reporthole
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <strong>Version:</strong> 1.0.0
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <strong>Environment:</strong> Production
              </Grid>
            </Grid>
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
