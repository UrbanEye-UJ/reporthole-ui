import type { SvgIconComponent } from "@mui/icons-material";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";

export interface SecurityNavItem {
  id: string;
  label: string;
  path: string;
  icon: SvgIconComponent;
  /**
   * True for links that aren't Next.js routes — Caddy intercepts these paths
   * (/pgadmin, /logs) before they'd ever reach the Next app, so they must be
   * plain full-page navigations, not client-side `next/link` transitions.
   */
  external?: boolean;
}

/**
 * Sidebar entries for the security-admin surface. Every screen here maps to a
 * capability the backend restricts to `SECURITY_ADMIN`.
 */
export const securityNavigation: SecurityNavItem[] = [
  {
    id: "applications",
    label: "Admin Applications",
    path: "/security/applications",
    icon: HowToRegRoundedIcon,
  },
  {
    id: "municipalities",
    label: "Municipalities",
    path: "/security/municipalities",
    icon: AccountBalanceRoundedIcon,
  },
  {
    id: "incidents",
    label: "Incidents",
    path: "/security/incidents",
    icon: ReportRoundedIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/security/analytics",
    icon: QueryStatsRoundedIcon,
  },
  {
    id: "audit",
    label: "Audit Trail",
    path: "/security/audit",
    icon: FactCheckRoundedIcon,
  },
  {
    id: "account",
    label: "Manage Accounts",
    path: "/security/account",
    icon: ManageAccountsRoundedIcon,
  },
  {
    id: "messages",
    label: "Messages",
    path: "/security/messages",
    icon: MailRoundedIcon,
  },
  {
    id: "db-admin",
    label: "Database Admin",
    path: "/pgadmin",
    icon: StorageRoundedIcon,
    external: true,
  },
  {
    id: "logs",
    label: "Live Logs",
    path: "/logs",
    icon: TerminalRoundedIcon,
    external: true,
  },
];
