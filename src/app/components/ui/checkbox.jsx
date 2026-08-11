"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "./utils";
import "../../../styles/checkbox.css";
function Checkbox({
  className,
  ...props
}) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn("ui-checkbox", className)} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="ui-checkbox__indicator">
        <CheckIcon className="ui-checkbox__icon" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>;
}
export { Checkbox };