"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "./utils";
import "../../../styles/dialog.css";
function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
function DialogOverlay({
  className,
  ...props
}) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("dialog-overlay", className)} {...props} />;
}
function DialogContent({
  className,
  children,
  ...props
}) {
  return <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content data-slot="dialog-content" className={cn("dialog-content", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="dialog-close">
          <XIcon />
          <span className="dialog-close__sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>;
}
function DialogHeader({
  className,
  ...props
}) {
  return <div data-slot="dialog-header" className={cn("dialog-header", className)} {...props} />;
}
function DialogFooter({
  className,
  ...props
}) {
  return <div data-slot="dialog-footer" className={cn("dialog-footer", className)} {...props} />;
}
function DialogTitle({
  className,
  ...props
}) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("dialog-title", className)} {...props} />;
}
function DialogDescription({
  className,
  ...props
}) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("dialog-description", className)} {...props} />;
}
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };