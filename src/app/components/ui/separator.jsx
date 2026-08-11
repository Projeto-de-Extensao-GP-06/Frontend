"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "./utils";
import "../../../styles/separator.css";
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return <SeparatorPrimitive.Root data-slot="separator-root" decorative={decorative} orientation={orientation} className={cn("ui-separator", className)} {...props} />;
}
export { Separator };