"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./utils";
import "../../../styles/switch.css";
function Switch({
  className,
  ...props
}) {
  return <SwitchPrimitive.Root data-slot="switch" className={cn("ui-switch", className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="ui-switch__thumb" />
    </SwitchPrimitive.Root>;
}
export { Switch };