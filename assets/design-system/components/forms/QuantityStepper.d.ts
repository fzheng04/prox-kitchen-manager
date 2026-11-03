import * as React from 'react';
export interface QuantityStepperProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Current unit label (ct, lb, gal, oz…) */
  unit?: string;
  /** If provided, the unit becomes an inline select */
  units?: string[];
  onUnitChange?: (unit: string) => void;
  size?: 'sm' | 'md';
}
export declare function QuantityStepper(props: QuantityStepperProps): JSX.Element;