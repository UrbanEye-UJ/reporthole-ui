"use client";

import { useEffect } from "react";

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
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useGetContractors } from "@/lib/hooks/useContractors";
import { useAssignIncident } from "@/lib/hooks/useAssignIncident";
import { getErrorMessage } from "@/lib/getErrorMessage";

export interface IncidentOption {
  incidentId: string;
  label: string;
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
  const contractors = contractorsData?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { incidentId: "", contractorId: "" },
  });

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
                  options={contractors}
                  loading={contractorsLoading}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  value={contractors.find((contractor) => contractor.userId === field.value) ?? null}
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
