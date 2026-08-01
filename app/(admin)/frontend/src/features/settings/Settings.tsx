import { Button, Grid } from "@mui/material";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import MetricCard from "../../components/ui/MetricCard";

const Settings = () => {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure SmartRoad AI platform preferences."
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
                <strong>Application:</strong> SmartRoad AI
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
};

export default Settings;