import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const Topbar = () => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        gridColumn: 2,
        background: "rgba(17, 25, 40, 0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          height: 70,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Road Infrastructure Operations Platform
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 0.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Gauteng Province
            </Typography>

            <Chip
              size="small"
              label="● AI Online"
              color="success"
              sx={{
                fontWeight: 600,
                borderRadius: 10,
              }}
            />
          </Box>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search incidents..."
            slotProps={{
              input: {
                startAdornment: (
                  <SearchRoundedIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              },
            }}
            sx={{
              width: 320,

              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",

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
          />

          {/* Notifications */}
          <IconButton
            sx={{
              bgcolor: "rgba(255,255,255,.05)",

              "&:hover": {
                bgcolor: "rgba(59,130,246,.18)",
                transform: "scale(1.05)",
              },

              transition: ".25s",
            }}
          >
            <NotificationsRoundedIcon />
          </IconButton>

          {/* User */}
          <Avatar
            sx={{
              bgcolor: "primary.main",
              fontWeight: 700,
              boxShadow:
                "0 0 20px rgba(59,130,246,.35)",
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;