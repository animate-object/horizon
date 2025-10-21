import React from "react";

interface Props extends React.ComponentProps<"div"> {
  hug?: boolean;
}

export default function Paper({ children, hug, style, ...rest }: Props) {
  return (
    <div
      className="card bg-base-100 card-sm overflow-hidden py-3 px-4 shadow-md"
      style={{
        width: hug ? "fit-content" : "100%",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
