"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
function Label({
  className,
  ...props
}) {
  return <LabelPrimitive.Root data-slot="label" className={cn("form-label", className)} {...props} />;
}
export { Label };