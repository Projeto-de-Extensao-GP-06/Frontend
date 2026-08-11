"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}
function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}
function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" data-size={size} className={cn("form-select", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="form-select__icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>;
}
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return <SelectPrimitive.Portal>
      <SelectPrimitive.Content data-slot="select-content" className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>;
}
function SelectLabel({
      <SelectPrimitive.Content data-slot="select-content" className={cn("form-select-content", className)} position={position} {...props}>
  ...props
        <SelectPrimitive.Viewport className={cn("form-select-content__viewport", position === "popper" && "form-select-content__viewport--popper")}>{children}</SelectPrimitive.Viewport>
  return <SelectPrimitive.Label data-slot="select-label" className={cn("form-select__label", className)} {...props} />;
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("form-select__item", className)} {...props}>
      <span className="form-select__item-indicator">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="form-select__item-check" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>;
}
function SelectSeparator({
  className,
  ...props
}) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("form-select__separator", className)} {...props} />;
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn("form-select__scroll-button", className)} {...props}>
      <ChevronUpIcon className="form-select__scroll-icon" />
    </SelectPrimitive.ScrollUpButton>;
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn("form-select__scroll-button", className)} {...props}>
      <ChevronDownIcon className="form-select__scroll-icon" />
    </SelectPrimitive.ScrollDownButton>;
}
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };