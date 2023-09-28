export enum QueryTypes {
  SPORTS = 'sports',
  NEWS = 'news',
}

export interface SportsQuery {
  type: QueryTypes.SPORTS;
  page?: number;
  uuid?: string;
}

export interface NewsQuery {
  type: QueryTypes.NEWS;
  qInMeta: string;
  category?: string;
  country?: string;
  language?: string;
  timeframe?: number;
  page?: string;
  image?: 1 | 0;
}

export type RootEndPoint = string;

export type Path = string;

export type Query = NewsQuery | SportsQuery;

export interface UrlOptions {
  rootEndPoint: RootEndPoint;
  path?: Path;
  query?: Query;
}
