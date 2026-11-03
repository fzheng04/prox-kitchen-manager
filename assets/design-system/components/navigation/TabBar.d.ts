import * as React from 'react';
export interface TabItem { key: string; label: string; /** Lucide icon */ icon: string; /** Shows an amber dot */ badge?: boolean; }
export interface TabBarProps {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
}
export declare function TabBar(props: TabBarProps): JSX.Element;