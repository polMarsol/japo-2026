import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "./Icon";

const tabs: { to: string; labelKey: string; icon: IconName; end?: boolean }[] = [
  { to: "/", labelKey: "nav.home", icon: "home", end: true },
  { to: "/dies", labelKey: "nav.days", icon: "calendar_month" },
  { to: "/reserves", labelKey: "nav.reservations", icon: "hotel" },
  { to: "/gastos", labelKey: "nav.expenses", icon: "account_balance_wallet" },
  { to: "/mapes", labelKey: "nav.maps", icon: "map" },
];

export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="safe-bottom sticky bottom-0 z-20 border-t border-line bg-surface-2/95 backdrop-blur">
      <ul className="flex">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  isActive ? "text-accent" : "text-muted"
                }`
              }
            >
              <Icon name={tab.icon} className="h-6 w-6" />
              {t(tab.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
