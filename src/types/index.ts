export type ToolCategory = 'network' | 'identity' | 'media-docs' | 'scanners';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  speed: 'Instant' | '1-3s' | '5-10s';
  tags: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  category: ToolCategory;
  timestamp: string;
  status: 'Completed' | 'Alert' | 'Pending';
  resultsCount: number;
}

export interface PythonScriptItem {
  id: string;
  name: string;
  filename: string;
  version: string;
  category: string;
  pythonVersion: string;
  size: string;
  checksum: string;
  dependencies: string[];
  description: string;
  downloads: number;
  lastUpdated: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null;
}
