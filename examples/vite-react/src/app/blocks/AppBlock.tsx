import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FC, PropsWithChildren, ReactNode } from "react";

export const AppBlock: FC<
  PropsWithChildren<{ title?: ReactNode; description?: ReactNode }>
> = ({ title, description, children }) => (
  <Card className="w-full">
    {!!(title || description) && (
      <CardHeader>
        {!!title && <CardTitle>{title}</CardTitle>}
        {!!description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </Card>
);
