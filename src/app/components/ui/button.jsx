import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";
import "../../../styles/button.css";
const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button--default",
      destructive: "button--destructive",
      outline: "button--outline",
      secondary: "button--secondary",
      ghost: "button--ghost",
      link: "button--link"
    },
    size: {
      default: "button--default-size",
      sm: "button--sm",
      lg: "button--lg",
      icon: "button--icon"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({
        variant,
        size,
        className
      }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };