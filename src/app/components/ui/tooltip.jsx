"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";
import "../../../styles/tooltip.css";
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}
function Tooltip({
  ...props
}) {
  return <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>;
}
function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content data-slot="tooltip-content" sideOffset={sideOffset} className={cn("ui-tooltip", className)} {...props}>
        {children}
        <TooltipPrimitive.Arrow className="ui-tooltip__arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>;
}
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };