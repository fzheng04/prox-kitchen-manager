import * as React from 'react';
export interface BadgeProps {
  children?: React.ReactNode;
  tone?: 'amber' | 'gold' | 'forest' | 'green' | 'red' | 'outline' | 'muted';
  /** Optional leading node (e.g. <Icon size={12}/>) */
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;