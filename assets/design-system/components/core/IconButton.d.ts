import * as React from 'react';
export interface IconButtonProps {
  /** Lucide icon name */
  icon: string;
  /** Accessible label (required for icon-only buttons) */
  label: string;
  variant?: 'light' | 'glass' | 'primary' | 'plain';
  size?: number;
  shape?: 'circle' | 'square';
  /** Count bubble (amber) in the top-right corner */
  badge?: number | string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;