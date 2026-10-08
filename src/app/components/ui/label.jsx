"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
const Label = React.forwardRef(({
  className,
  ...props
}, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn("form-label", className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };