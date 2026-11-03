import * as React from 'react';
export type ProxCategory = 'all' | 'produce' | 'dairy' | 'meat' | 'pantry' | 'essentials' | 'frozen';
export interface CategoryChipProps {
  category?: ProxCategory;
  /** Override label (e.g. "Fruits & Veggies" for produce) */
  label?: string;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function CategoryChip(props: CategoryChipProps): JSX.Element;