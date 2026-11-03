import * as React from 'react';
/**
 * Rounded-rect button with ink outline and straight-down tile shadow; sinks on press.
 */
export interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'dark' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name shown before the label */
  icon?: string;
  /** Lucide icon name shown after the label (e.g. "circle-arrow-right") */
  iconRight?: string;
  /** Uppercase tracked label (default false — sentence case is the norm). */
  uppercase?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;