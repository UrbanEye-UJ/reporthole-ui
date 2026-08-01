import type { SvgIconComponent } from "@mui/icons-material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: SvgIconComponent;
  badge?: number;
}

export const navigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Operations Center",
    path: "/admin/dashboard",
    icon: DashboardRoundedIcon,
  },
  {
    id: "incidents",
    label: "Incidents",
    path: "/admin/incidents",
    icon: ReportRoundedIcon,
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    path: "/admin/infrastructure",
    icon: MapRoundedIcon,
  },
  {
    id: "contractors",
    label: "Contractors",
    path: "/admin/contractors",
    icon: EngineeringRoundedIcon,
  },
  {
    id: "citizens",
    label: "Citizens",
    path: "/admin/citizens",
    icon: PeopleRoundedIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/admin/analytics",
    icon: AnalyticsRoundedIcon,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: DescriptionRoundedIcon,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: SettingsRoundedIcon,
  },
];
