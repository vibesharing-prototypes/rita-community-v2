import { Card, CardContent, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

type CommitteeSettingsCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  dividerColor: string;
}>;

export default function CommitteeSettingsCard({
  title,
  description,
  dividerColor,
  children,
}: CommitteeSettingsCardProps) {
  return (
    <Card sx={{ border: `1px solid ${dividerColor}`, boxShadow: "none" }}>
      <CardContent>
        <Typography
          variant="subtitle2"
          sx={{ mb: description ? 0.5 : 2, fontWeight: "var(--lens-core-font-weight-semi-bold)" }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body1"
            sx={{ color: "var(--lens-semantic-color-type-muted)", mb: 2 }}
          >
            {description}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
