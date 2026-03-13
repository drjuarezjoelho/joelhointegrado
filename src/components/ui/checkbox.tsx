import * as React from "react";

export const Checkbox = React.forwardRef<HTMLInputElement, Record<string, any>>((props, ref) => {
  const { checked, onCheckedChange, onChange, ...rest } = props;
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked);
        onChange?.(e);
      }}
      {...rest}
    />
  );
});
Checkbox.displayName = "Checkbox";
