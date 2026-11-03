import * as React from 'react';
export interface SavingsCardProps {
  label?: string;
  /** Pre-formatted currency, e.g. "$4.12" */
  amount?: string;
  caption?: string;
  /** e.g. "12% less" */
  badge?: string;
  /** 0–1 fill of the bar */
  progress?: number;
  onInfo?: () => void;
  style?: React.CSSProperties;
}
export declare function SavingsCard(props: SavingsCardProps): JSX.Element;