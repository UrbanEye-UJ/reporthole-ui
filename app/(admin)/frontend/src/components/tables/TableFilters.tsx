import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

interface TableFiltersProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  width?: number;
}

const TableFilters = ({
  label,
  value,
  options,
  onChange,
  width = 180,
}: TableFiltersProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: width,
      }}
    >
      <InputLabel>{label}</InputLabel>

      <Select
        value={value}
        label={label}
        onChange={handleChange}
        sx={{
          borderRadius: 3,
          background: "rgba(255,255,255,.05)",
          backdropFilter: "blur(12px)",

          "& fieldset": {
            borderColor: "rgba(255,255,255,.08)",
          },

          "&:hover fieldset": {
            borderColor: "primary.main",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TableFilters;