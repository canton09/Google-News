export interface Source {
  title: string;
  url: string;
}

export interface NewsData {
  id: string;
  headline: string;
  summary: string;
  svgCode: string;
  sources: Source[];
  timestamp: Date;
}

export interface LoadingState {
  status: 'idle' | 'searching' | 'generating_art' | 'complete' | 'error';
  message: string;
}