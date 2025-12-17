import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  path: string;
  title?: string;
  size?: number | string;
  className?: string;
  fill?: string;
};

export function Icon({
  path,
  title,
  size = 1,
  className,
  fill = "currentColor",
  ...rest
}: IconProps) {
  const sizeValue = typeof size === 'number' ? `${size}rem` : size;
  
  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      aria-label={title}
      className={className}
      style={{ flexShrink: 0 }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={path} fill={fill} />
    </svg>
  );
}
