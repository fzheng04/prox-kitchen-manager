import * as React from 'react';
export interface EmptyStateProps {
  /** Lucide icon in the sage disc */
  icon?: string;
  title: string;
  body?: string;
  /** Usually a <Button> */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;