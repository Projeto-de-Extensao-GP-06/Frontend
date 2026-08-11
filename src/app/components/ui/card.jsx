import * as React from "react";
import { cn } from "./utils";
import "../../../styles/card.css";
function Card({
  className,
  ...props
}) {
  return <div data-slot="card" className={cn("card", className)} {...props} />;
}
function CardHeader({
  className,
  ...props
}) {
  return <div data-slot="card-header" className={cn("card__header", className)} {...props} />;
}
function CardTitle({
  className,
  ...props
}) {
  return <h4 data-slot="card-title" className={cn("card__title", className)} {...props} />;
}
function CardDescription({
  className,
  ...props
}) {
  return <p data-slot="card-description" className={cn("card__description", className)} {...props} />;
}
function CardAction({
  className,
  ...props
}) {
  return <div data-slot="card-action" className={cn("card__action", className)} {...props} />;
}
function CardContent({
  className,
  ...props
}) {
  return <div data-slot="card-content" className={cn("card__content", className)} {...props} />;
}
function CardFooter({
  className,
  ...props
}) {
  return <div data-slot="card-footer" className={cn("card__footer", className)} {...props} />;
}
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };