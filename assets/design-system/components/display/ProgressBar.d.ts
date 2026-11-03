import * as React from 'react';
export interface ProgressBarProps {
  /** 0–1 */
  value?: number;
  tone?: 'green' | 'amber' | 'red';
  height?: number;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;