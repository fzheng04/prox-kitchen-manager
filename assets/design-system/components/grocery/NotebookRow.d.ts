import * as React from 'react';
export interface NotebookRowProps {
  /** Item name */
  text?: string;
  /** Small printed line below (resolved product, brand pin, warnings) */
  sub?: React.ReactNode;
  /** Right-side slot, e.g. <QuantityStepper size="sm"/> */
  meta?: React.ReactNode;
  /** Render as the "New Item" input row */
  input?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  /** Colors the sub line red (e.g. "Needs a match") */
  warning?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}
export declare function NotebookRow(props: NotebookRowProps): JSX.Element;