import * as React from 'react';
export interface CardProps {
  children?: React.ReactNode;
  tone?: 'cream' | 'white' | 'deep' | 'lime';
  padding?: number | string;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;