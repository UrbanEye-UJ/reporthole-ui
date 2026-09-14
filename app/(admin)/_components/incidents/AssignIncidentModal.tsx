"use client";

import { useEffect, useMemo } from "react";

import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useGetContractors } from "@/app/api/generated/admin-contractors/admin-contractors";
import { useAssignIncident } from "@/lib/hooks/useAssignIncident";
import { getErrorMessage } from "@/lib/getErrorMessage";

export interface IncidentOption {
  incidentId: string;
  label: string;
  issueType?: string;
}

interface AssignIncidentModalProps {
  open: boolean;
  onClose: () => void;
  incidents: IncidentOption[];
}

const schema = z.object({
  incidentId: z.string().min(1, "Select an incident"),
  contractorId: z.string().min(1, "Select a contractor"),
});

type FormValues = z.infer<typeof schema>;

const AssignIncidentModal = ({ open, onClose, incidents }: AssignIncidentModalProps) => {
  const { data: contractorsData, isLoading: contractorsLoading } = useGetContractors();
  const contractors = useMemo(() => contractorsData?.data ?? [], [contractorsData]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { incidentId: "", contractorId: "" },
  });

  const selectedIncidentId = useWatch({ control, name: "incidentId" });
  const selectedIssueType = incidents.find((i) => i.incidentId === selectedIncidentId)?.issueType;

  // A contractor specialised in "OTHER" handles any issue type — mirrors the eligibility
  // check the backend applies in IncidentServiceImpl.assignIncident.
  const eligibleContractors = useMemo(
    () =>
      selectedIssueType
        ? contractors.filter(
            (c) =>
              c.specialisations?.includes("OTHER" as never) ||
              c.specialisations?.includes(selectedIssueType as never)
          )
        : contractors,
    [contractors, selectedIssueType]
  );

  useEffect(() => {
    setValue("contractorId", "");
  }, [selectedIncidentId, setValue]);

  const { mutate, isPending, error, reset: resetMutation } = useAssignIncident();

  useEffect(() => {
    if (!open) {
      reset();
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = (values: FormValues) => {
    mutate(
      { incidentId: values.incidentId, contractorId: values.contractorId },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Assign Incident</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >
            {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

            <Controller
              name="incidentId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={incidents}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.incidentId === value.incidentId}
                  value={incidents.find((incident) => incident.incidentId === field.value) ?? null}
                  onChange={(_, selected) => field.onChange(selected?.incidentId ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Incident"
                      error={!!errors.incidentId}
                      helperText={errors.incidentId?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="contractorId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={eligibleContractors}
                  loading={contractorsLoading}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  value={eligibleContractors.find((contractor) => contractor.userId === field.value) ?? null}
                  onChange={(_, selected) => field.onChange(selected?.userId ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Contractor"
                      error={!!errors.contractorId}
                      helperText={errors.contractorId?.message}
                    />
                  )}
                />
              )}
            />

            {selectedIssueType && eligibleContractors.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No contractors are specialised in this issue type yet.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
          >
            {isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignIncidentModal;
