import * as React from 'react';
export interface SegmentOption { value: string; label: string; sublabel?: string; icon?: string; }
export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
  /** forest: compact track (My items / Household). green: roomy card track with sublabels (Cart total / from $28.74). */
  tone?: 'forest' | 'green';
  style?: React.CSSProperties;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;