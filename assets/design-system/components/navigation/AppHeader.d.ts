import * as React from 'react';
/** Night screen header: left-aligned heavy title + subtitle, optional leading control, actions right, optional search below. */
export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Leading control, e.g. a back IconButton */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Rendered below the title row (e.g. <SearchField/>) */
  children?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function AppHeader(props: AppHeaderProps): JSX.Element;
