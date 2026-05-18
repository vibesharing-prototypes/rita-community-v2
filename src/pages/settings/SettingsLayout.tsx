import { Outlet } from "react-router";

import { SettingsDataProvider } from "../../contexts/SettingsDataContext.js";

export default function SettingsLayout() {
  return (
    <SettingsDataProvider>
      <Outlet />
    </SettingsDataProvider>
  );
}
