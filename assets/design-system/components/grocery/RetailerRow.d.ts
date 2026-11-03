import * as React from 'react';
export interface RetailerRowProps {
  /** Small amber rank bubble (1, 2, 3) */
  rank?: number;
  name: string;
  /** Short text in the logo tile (no retailer logos are shipped) */
  logoText?: string;
  /** e.g. "4 of 5 items" */
  itemsLabel?: string;
  /** Pre-formatted price */
  price: string;
  /** e.g. "Best deal" (gold) */
  badge?: string;
  /** Extra badges after the items label (stale/missing) */
  flags?: React.ReactNode;
  /** Deep forest fill */
  selected?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  /** Expanded content: line items, alternatives */
  children?: React.ReactNode;
}
export declare function RetailerRow(props: RetailerRowProps): JSX.Element;