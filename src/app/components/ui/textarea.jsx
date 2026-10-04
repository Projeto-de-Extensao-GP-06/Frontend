import * as React from "react";
import { cn } from "./utils";
import "../../../styles/form-controls.css";
const Textarea = React.forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn("form-textarea", className)}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };