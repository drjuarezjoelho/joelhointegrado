import * as React from "react";

type AnyProps = Record<string, unknown> & { children?: React.ReactNode; className?: string; asChild?: boolean };

function make(tag: keyof JSX.IntrinsicElements, name: string) {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children, ...rest } = props;
    return React.createElement(tag, { ref, ...rest }, children);
  });
  Comp.displayName = name;
  return Comp;
}

export const Div = make("div", "Div");
export const Span = make("span", "Span");
export const ButtonEl = make("button", "ButtonEl");
export const ImgEl = make("img", "ImgEl");

export const InputEl = React.forwardRef<HTMLInputElement, AnyProps>((props, ref) => {
  const { children: _children, ...rest } = props;
  return <input ref={ref} {...(rest as any)} />;
});
InputEl.displayName = "InputEl";

export const TextareaEl = React.forwardRef<HTMLTextAreaElement, AnyProps>((props, ref) => {
  const { children: _children, ...rest } = props;
  return <textarea ref={ref} {...(rest as any)} />;
});
TextareaEl.displayName = "TextareaEl";

export const NullEl = () => null;

export const makeDiv = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children, ...rest } = props;
    return <div ref={ref} {...(rest as any)}>{children}</div>;
  });
  Comp.displayName = name;
  return Comp;
};

export const makeButton = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children, ...rest } = props;
    return <button ref={ref} {...(rest as any)}>{children}</button>;
  });
  Comp.displayName = name;
  return Comp;
};

export const makeSpan = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children, ...rest } = props;
    return <span ref={ref} {...(rest as any)}>{children}</span>;
  });
  Comp.displayName = name;
  return Comp;
};

export const makeInput = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children: _children, ...rest } = props;
    return <input ref={ref} {...(rest as any)} />;
  });
  Comp.displayName = name;
  return Comp;
};

export const makeTextarea = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children: _children, ...rest } = props;
    return <textarea ref={ref} {...(rest as any)} />;
  });
  Comp.displayName = name;
  return Comp;
};

export const makeImg = (name: string) => {
  const Comp = React.forwardRef<any, AnyProps>((props, ref) => {
    const { children: _children, ...rest } = props;
    return <img ref={ref} {...(rest as any)} />;
  });
  Comp.displayName = name;
  return Comp;
};
