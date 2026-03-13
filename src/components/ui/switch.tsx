import * as React from "react";

export const Switch = React.forwardRef<HTMLInputElement, Record<string, any>>((props, ref) => {
  const { checked, onCheckedChange, onChange, ...rest } = props;
  return (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      checked={!!checked}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked);
        onChange?.(e);
      }}
      {...rest}
    />
  );
});
Switch.displayName = "Switch";
