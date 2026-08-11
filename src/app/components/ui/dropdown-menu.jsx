"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "./utils";
import "../../../styles/dropdown-menu.css";
function DropdownMenu({
  ...props
}) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}
function DropdownMenuPortal({
  ...props
}) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}
function DropdownMenuTrigger({
  ...props
}) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content data-slot="dropdown-menu-content" sideOffset={sideOffset} className={cn("dropdown-content", className)} {...props} />
    </DropdownMenuPrimitive.Portal>;
}
function DropdownMenuGroup({
  ...props
}) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" data-inset={inset} data-variant={variant} className={cn("dropdown-item", className)} {...props} />;
}
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn("dropdown-item dropdown-checkbox-item", className)} checked={checked} {...props}>
      <span className="dropdown-item__indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="dropdown-item__indicator-icon" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>;
}
function DropdownMenuRadioGroup({
  ...props
}) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn("dropdown-item dropdown-radio-item", className)} {...props}>
      <span className="dropdown-item__indicator">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="dropdown-item__radio-icon" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>;
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" data-inset={inset} className={cn("dropdown-label", className)} {...props} />;
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("dropdown-separator", className)} {...props} />;
}
function DropdownMenuShortcut({
  className,
  ...props
}) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("dropdown-shortcut", className)} {...props} />;
}
function DropdownMenuSub({
  ...props
}) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={cn("dropdown-item dropdown-sub-trigger", className)} {...props}>
      {children}
      <ChevronRightIcon className="dropdown-sub-trigger__icon" />
    </DropdownMenuPrimitive.SubTrigger>;
}
function DropdownMenuSubContent({
  className,
  ...props
}) {
  return <DropdownMenuPrimitive.SubContent data-slot="dropdown-menu-sub-content" className={cn("dropdown-content", className)} {...props} />;
}
export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent };