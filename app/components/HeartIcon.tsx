import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function HeartIcon({ title = "heart", ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden={props["aria-label"] ? undefined : true}
      role="img"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
        fill="currentColor"
      />
    </svg>
  );
}
