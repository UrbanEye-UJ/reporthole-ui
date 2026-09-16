import type { SvgIconComponent } from "@mui/icons-material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

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
    id: "analytics",
    label: "Analytics",
    path: "/admin/analytics",
    icon: QueryStatsRoundedIcon,
  },
  {
    id: "contractors",
    label: "Contractors",
    path: "/admin/contractors",
    icon: EngineeringRoundedIcon,
  },
  {
    id: "profile",
    label: "My Profile",
    path: "/admin/profile",
    icon: AccountCircleRoundedIcon,
  },
];
