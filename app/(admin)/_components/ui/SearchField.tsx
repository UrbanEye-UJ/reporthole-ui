"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
}

const SearchField = ({
  value,
  onChange,
  placeholder = "Search...",
  width = 320,
}: SearchFieldProps) => {
  return (
    <TextField
      size="small"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        width,

        "& .MuiOutlinedInput-root": {
          borderRadius: 999,

          background: "rgba(255,255,255,.05)",

          backdropFilter: "blur(12px)",

          transition: ".25s",

          "& fieldset": {
            borderColor: "rgba(255,255,255,.08)",
          },

          "&:hover fieldset": {
            borderColor: "primary.main",
          },

          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchField;
