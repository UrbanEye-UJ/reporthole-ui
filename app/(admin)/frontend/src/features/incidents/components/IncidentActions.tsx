import {
  Button,
  Stack,
} from "@mui/material";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import Panel from "../../../components/ui/Panel";

const IncidentActions = () => {
  return (
    <Panel title="Actions">
      <Stack spacing={2}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AssignmentIndRoundedIcon />}
        >
          Assign Contractor
        </Button>

        <Button
          variant="contained"
          color="warning"
          fullWidth
          startIcon={<BuildRoundedIcon />}
        >
          Mark In Progress
        </Button>

        <Button
          variant="contained"
          color="success"
          fullWidth
          startIcon={<CheckCircleRoundedIcon />}
        >
          Mark Resolved
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<RestartAltRoundedIcon />}
        >
          Reopen Incident
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<DownloadRoundedIcon />}
        >
          Export Report
        </Button>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<DeleteRoundedIcon />}
        >
          Delete Incident
        </Button>
      </Stack>
    </Panel>
  );
};

export default IncidentActions;