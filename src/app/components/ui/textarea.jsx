import * as React from "react";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
function Textarea({
  className,
  ...props
}) {
  return <textarea data-slot="textarea" className={cn("form-textarea", className)} {...props} />;
}
export { Textarea };