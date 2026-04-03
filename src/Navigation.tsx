import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  NavLink,
  NavSection,
  RoutedNavLink,
} from "@diligentcorp/atlas-react-bundle/global-nav";
import HomeIcon from "@diligentcorp/atlas-react-bundle/icons/Home";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import PolicyIcon from "@diligentcorp/atlas-react-bundle/icons/Policy";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import FlagIcon from "@diligentcorp/atlas-react-bundle/icons/Flag";
import TimeAndDateIcon from "@diligentcorp/atlas-react-bundle/icons/TimeAndDate";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import SettingsIcon from "@diligentcorp/atlas-react-bundle/icons/Settings";
import LanguageIcon from "@diligentcorp/atlas-react-bundle/icons/Language";
import { Box, useTheme } from "@mui/material";

export default function Navigation() {
  const location = useLocation();
  const isLibraryRoute = location.pathname.startsWith("/library/");
  const [libraryOpen, setLibraryOpen] = useState(isLibraryRoute);
  const { tokens } = useTheme();
  const mutedBorder =
    tokens.core.color.brand.neutral.gray2?.value ??
    tokens.core.color.brand.neutral.gray3?.value;

  useEffect(() => {
    if (isLibraryRoute) {
      setLibraryOpen(true);
    }
  }, [isLibraryRoute]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "& a, & a:hover, & a:focus, & a:visited": {
          textDecoration: "none",
        },
      }}
    >
      <Box>
        <RoutedNavLink to="/" label="Home">
          <HomeIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/meetings" label="Meetings">
          <CalendarIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/agenda" label="Agenda items">
          <ListIcon slot="icon" />
        </RoutedNavLink>
        <RoutedNavLink to="/policies" label="Policies">
          <PolicyIcon slot="icon" />
        </RoutedNavLink>

        <Box sx={{
          "--lens-component-global-nav-list-gap": "0px",
          ...(libraryOpen && {
            borderRadius: "12px",
            overflow: "hidden",
            ...(!isLibraryRoute && { border: `1px solid ${mutedBorder}` }),
          }),
        }}>
        <NavSection
          label="Library"
          isOpen={libraryOpen}
          isHighlighted={isLibraryRoute}
          onOpen={() => setLibraryOpen(true)}
          onClose={() => setLibraryOpen(false)}
        >
          <FolderIcon slot="icon" />
          <RoutedNavLink to="/library/files" label="Files" />
          <RoutedNavLink to="/library/goals" label="Goals" />
          <RoutedNavLink to="/library/events" label="Events" />
          <RoutedNavLink to="/library/members" label="Board members" />
        </NavSection>
        </Box>
      </Box>

      <Box
        sx={{
          mt: "auto",
          borderTop: "1px solid",
          borderColor: mutedBorder,
          pt: 1,
          width: "100%",
          alignSelf: "stretch",
        }}
      >
        <RoutedNavLink to="/settings" label="Settings">
          <SettingsIcon slot="icon" />
        </RoutedNavLink>
        <NavLink
          label="Public site"
          url="https://www.ecsd.edu"
          target="_blank"
          showExternalIcon
        >
          <LanguageIcon slot="icon" />
        </NavLink>
      </Box>
    </Box>
  );
}
