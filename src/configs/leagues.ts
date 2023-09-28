import type { TSelectedCountry } from '@src/types/team';

export const COUNTRIES: TSelectedCountry[] = [
  'England',
  'Scotland',
  'Wales',
  'Northern Ireland',
];

export const LEAGUES = {
  England: {
    men: [
      { name: 'English Premier League', numberOfTeams: 20 },
      { name: 'English Football League Championship', numberOfTeams: 24 },
      { name: 'English Football League One', numberOfTeams: 24 },
      { name: 'English Football League Two', numberOfTeams: 24 },
      { name: 'English National League', numberOfTeams: 24 },
    ],
    women: [
      { name: "English FA Women's Super League", numberOfTeams: 12 },
      { name: "English FA Women's Super League 2", numberOfTeams: 12 },
      { name: "English Women's North Conference", numberOfTeams: 12 },
      { name: "English Women's South Conference", numberOfTeams: 12 },
    ],
  },
  Scotland: {
    men: [
      { name: 'Scottish Premiership', numberOfTeams: 12 },
      { name: 'Scottish Championship', numberOfTeams: 10 },
    ],
    women: [{ name: "Scottish Women's Premier League", numberOfTeams: 12 }],
  },
  Wales: {
    men: [{ name: 'Welsh Premier League', numberOfTeams: 12 }],
    women: [{ name: "Welsh Women's Premier League", numberOfTeams: 8 }],
  },
  'Northern Ireland': {
    men: [{ name: 'Northern Ireland Premier League', numberOfTeams: 12 }],
    women: [
      { name: "Northern Ireland Women's Super League", numberOfTeams: 10 },
    ],
  },
};
