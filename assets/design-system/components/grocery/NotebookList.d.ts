import * as React from 'react';
export interface NotebookListProps {
  /** NotebookRow children */
  children?: React.ReactNode;
  /** Optional heading inside the card */
  title?: string;
  /** Right-aligned meta beside the title, e.g. "6 items" */
  count?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function NotebookList(props: NotebookListProps): JSX.Element;
