export enum TeamType {
  MEN = 'men',
  WOMEN = 'women',
}

export type TSelectedCountry =
  | 'England'
  | 'Scotland'
  | 'Wales'
  | 'Northern Ireland';

export interface ICountry {
  id: string;
  category_id: string;
  name: string;
  logo: string;
  updated_at: number;
}
