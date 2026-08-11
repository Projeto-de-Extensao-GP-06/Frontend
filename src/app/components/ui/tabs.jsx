"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./utils";
import "../../../styles/tabs.css";
function Tabs({
  className,
  ...props
}) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("ui-tabs", className)} {...props} />;
}
function TabsList({
  className,
  ...props
}) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("ui-tabs__list", className)} {...props} />;
}
function TabsTrigger({
  className,
  ...props
}) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("ui-tabs__trigger", className)} {...props} />;
}
function TabsContent({
  className,
  ...props
}) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("ui-tabs__content", className)} {...props} />;
}
export { Tabs, TabsList, TabsTrigger, TabsContent };