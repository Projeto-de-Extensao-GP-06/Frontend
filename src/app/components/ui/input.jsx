import * as React from "react";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
function Input({
  className,
  type,
  ...props
}) {
  return <input type={type} data-slot="input" className={cn("form-input", className)} {...props} />;
}
export { Input };