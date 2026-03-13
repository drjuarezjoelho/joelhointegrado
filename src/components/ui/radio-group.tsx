import * as React from "react";
import { makeDiv } from "./stub";

export const RadioGroup = makeDiv("RadioGroup");
export const RadioGroupItem = React.forwardRef<HTMLInputElement, Record<string, any>>((props, ref) => (
  <input ref={ref} type="radio" {...props} />
));
RadioGroupItem.displayName = "RadioGroupItem";
