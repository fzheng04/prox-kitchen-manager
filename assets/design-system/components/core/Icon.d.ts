import * as React from 'react';
export interface IconProps {
  /** Lucide icon name in kebab-case, e.g. "shopping-cart", "chef-hat", "package". */
  name: string;
  size?: number;
  /** Any CSS color; defaults to currentColor. */
  color?: string;
  /** Override lucide's default 2px stroke */
  strokeWidth?: number;
  title?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;