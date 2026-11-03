import * as React from 'react';
export interface PillProps {
  children?: React.ReactNode;
  /** Active = night fill, white text */
  active?: boolean;
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Pill(props: PillProps): JSX.Element;