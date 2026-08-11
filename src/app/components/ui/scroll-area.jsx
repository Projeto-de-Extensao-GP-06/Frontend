"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "./utils";
import "../../../styles/scroll-area.css";
function ScrollArea({
  className,
  children,
  ...props
}) {
  return <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("scroll-area", className)} {...props}>
      <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" className="scroll-area__viewport">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>;
}
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return <ScrollAreaPrimitive.ScrollAreaScrollbar data-slot="scroll-area-scrollbar" orientation={orientation} className={cn("scroll-area__bar", orientation === "vertical" && "scroll-area__bar--vertical", orientation === "horizontal" && "scroll-area__bar--horizontal", className)} {...props}>
      <ScrollAreaPrimitive.ScrollAreaThumb data-slot="scroll-area-thumb" className="scroll-area__thumb" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>;
}
export { ScrollArea, ScrollBar };