import {
  Box,
  Card,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";

import Panel from "../../../components/ui/Panel";

interface IncidentPhoto {
  id: number;
  title: string;
  image: string;
  uploadedBy: string;
  date: string;
}

const photos: IncidentPhoto[] = [
  {
    id: 1,
    title: "Citizen Report",
    image: "https://picsum.photos/600/400?random=1",
    uploadedBy: "Citizen",
    date: "28 Jul 2026",
  },
  {
    id: 2,
    title: "Inspection",
    image: "https://picsum.photos/600/400?random=2",
    uploadedBy: "Inspector",
    date: "29 Jul 2026",
  },
  {
    id: 3,
    title: "Repair Complete",
    image: "https://picsum.photos/600/400?random=3",
    uploadedBy: "Contractor",
    date: "30 Jul 2026",
  },
];

const IncidentPhotoGallery = () => {
  return (
    <Panel title="Photo Gallery">
      <Stack spacing={3}>
        {photos.map((photo) => (
          <Card
            key={photo.id}
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "transparent",
              border: "1px solid",
              borderColor: "divider",
              transition: ".25s",

              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardMedia
              component="img"
              height="220"
              image={photo.image}
              alt={photo.title}
            />

            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                {photo.title}
              </Typography>

              <Chip
                size="small"
                icon={<CameraAltRoundedIcon />}
                label={photo.uploadedBy}
                sx={{
                  mb: 1,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {photo.date}
              </Typography>
            </Box>
          </Card>
        ))}
      </Stack>
    </Panel>
  );
};

export default IncidentPhotoGallery;