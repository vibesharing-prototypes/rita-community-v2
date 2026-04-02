import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { NavLink } from "react-router";

import PageLayout from "../components/PageLayout.js";
import Placeholder from "../components/Placeholder.js";

export default function IndexPage() {
  return (
    <PageLayout>
      <PageHeader
        pageTitle="Dashboard"
        pageSubtitle="This is the app's dashboard"
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>My App</span>}
            items={[
              {
                id: "dashboard",
                label: "Dashboard",
                url: "/",
              },
            ]}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
          </OverflowBreadcrumbs>
        }
      />
      <Placeholder>Hello, World!</Placeholder>
    </PageLayout>
  );
}
