"use client";

import { useEffect } from "react";

import {
  Alert,
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

import { useCreateContractor } from "@/lib/hooks/useContractors";
import { getErrorMessage } from "@/lib/getErrorMessage";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

type FormValues = z.infer<typeof schema>;

interface AddContractorModalProps {
  open: boolean;
  onClose: () => void;
}

const AddContractorModal = ({ open, onClose }: AddContractorModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "", password: "" },
  });

  const { mutate, isPending, error, reset: resetMutation } = useCreateContractor();

  useEffect(() => {
    if (!open) {
      reset();
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add Contractor</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 1 }}
          >
            {error && <Alert severity="error">{getErrorMessage(error)}</Alert>}

            <Stack
              direction="row"
              spacing={2}
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Stack>

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
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone number"
                  fullWidth
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Initial password"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message ?? "At least 8 characters, 1 number, 1 special character"}
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
            {isPending ? "Creating..." : "Create Contractor"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddContractorModal;
