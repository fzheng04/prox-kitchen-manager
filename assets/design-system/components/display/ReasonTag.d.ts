import * as React from 'react';
export interface ReasonTagProps {
  /** Why a recommendation was made */
  kind?: 'low' | 'depletion' | 'recurrence' | 'preference' | 'category' | 'availability' | 'history';
  /** Specific explanation, e.g. "1 of 12 left" */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function ReasonTag(props: ReasonTagProps): JSX.Element;