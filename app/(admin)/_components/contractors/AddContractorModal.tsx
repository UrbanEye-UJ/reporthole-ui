"use client";

import { useEffect } from "react";

import {
  Alert,
  Autocomplete,
  Button,
  Chip,
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

import { useQueryClient } from "@tanstack/react-query";

import {
  useInviteContractor,
  getGetContractorsQueryKey,
} from "@/app/api/generated/admin-contractors/admin-contractors";
import { InviteContractorRequestSpecialisationsItem } from "@/app/api/generated/openAPIDefinition.schemas";
import { formatSpecialisation } from "../tables/incidentColumns";
import { getErrorMessage } from "@/lib/getErrorMessage";

const SPECIALISATION_OPTIONS = Object.values(InviteContractorRequestSpecialisationsItem);

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  specialisations: z
    .array(z.nativeEnum(InviteContractorRequestSpecialisationsItem))
    .min(1, "Select at least one specialisation"),
});

type FormValues = z.infer<typeof schema>;

interface AddContractorModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Invites a contractor by email. The backend emails them a one-time link to
 * `/contractors/register?token=`, where they set their own name, phone and
 * password — so this form only captures the email and the issue types they are
 * qualified for.
 */
const AddContractorModal = ({ open, onClose }: AddContractorModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", specialisations: [] },
  });

  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset: resetMutation } = useInviteContractor();

  useEffect(() => {
    if (!open) {
      reset();
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = (values: FormValues) => {
    mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetContractorsQueryKey() });
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Invite Contractor</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={
                    errors.email?.message ?? "We'll email them a registration link"
                  }
                />
              )}
            />

            <Controller
              name="specialisations"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={SPECIALISATION_OPTIONS}
                  getOptionLabel={(option) => formatSpecialisation(option)}
                  value={field.value}
                  onChange={(_, selected) => field.onChange(selected)}
                  renderValue={(value, getItemProps) =>
                    value.map((option, index) => {
                      const { key, ...itemProps } = getItemProps({ index });
                      return (
                        <Chip
                          label={formatSpecialisation(option)}
                          size="small"
                          key={key}
                          {...itemProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Specialisations"
                      error={!!errors.specialisations}
                      helperText={
                        errors.specialisations?.message ??
                        "Issue types this contractor is qualified to handle"
                      }
                    />
                  )}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Sending..." : "Send Invite"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddContractorModal;
