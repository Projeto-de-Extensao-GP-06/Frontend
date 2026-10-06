import * as React from "react";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
const Input = React.forwardRef(({
  className,
  type,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn("form-input", className)}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };