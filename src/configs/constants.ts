import { TeamType } from '@src/types/team';

/* Redis keys */
export const REDIS_KEY_COUNTRY_IDS = `countryIds`;
export const REDIS_KEY_COUNTRY_NAMES = `countryInfo`;
export const REDIS_KEY_LEAGUE_IDS_MEN = `leagueIds:${TeamType.MEN}`;
export const REDIS_KEY_LEAGUE_INFO_MEN = `leagueInfo:${TeamType.MEN}`;
export const REDIS_KEY_LEAGUE_IDS_WOMEN = `leagueIds:${TeamType.WOMEN}`;
export const REDIS_KEY_LEAGUE_INFO_WOMEN = `leagueInfo:${TeamType.WOMEN}`;
export const REDIS_KEY_COMPETITION_IDS_MEN = `competitionIds:${TeamType.MEN}`;
export const REDIS_KEY_COMPETITION_INFO_MEN = `competitionInfo:${TeamType.MEN}`;
export const REDIS_KEY_COMPETITION_IDS_WOMEN = `competitionIds:${TeamType.WOMEN}`;
export const REDIS_KEY_COMPETITION_INFO_WOMEN = `competitionInfo:${TeamType.WOMEN}`;
export const REDIS_KEY_TEAM_MEN = `team:${TeamType.MEN}`;
export const REDIS_KEY_TEAM_WOMEN = `team:${TeamType.WOMEN}`;
export const REDIS_KEY_TEAM_HASH_MEN = `teamHash:${TeamType.MEN}`;
export const REDIS_KEY_TEAM_HASH_WOMEN = `teamHash:${TeamType.WOMEN}`;
export const REDIS_KEY_FIXTURE_MEN = `fixture:${TeamType.MEN}`;
export const REDIS_KEY_FIXTURE_WOMEN = `fixture:${TeamType.WOMEN}`;
export const REDIS_KEY_UPCOMING_MATCHES_MEN = `upcomingMatches:${TeamType.MEN}`;
export const REDIS_KEY_UPCOMING_MATCHES_WOMEN = `upcomingMatches:${TeamType.WOMEN}`;
export const REDIS_KEY_STANDING_MEN = `standing:${TeamType.MEN}`;
export const REDIS_KEY_STANDING_WOMEN = `standing:${TeamType.WOMEN}`;
export const REDIS_KEY_REALTIME_MATCHES = 'realtimeMatches';
export const REDIS_KEY_NEWS_HASH = 'newsData';

/* Redis Expiration Time */
export const REDIS_EXPIRATION_TIME_TEAM = 604800; // 1 week In seconds
export const REDIS_EXPIRATION_TIME_FIXTURE = 1800; // 30 minutes In seconds
export const REDIS_EXPIRATION_TIME_STANDING = 1800; // 30 minutes In seconds
export const REDIS_EXPIRATION_TIME_REALTIME_MATCHES = 60; // 1 minute In seconds

/* Data Fetching Interval */
export const FETCH_INTERVAL_TEAM = REDIS_EXPIRATION_TIME_TEAM - 6089; // In seconds
export const FETCH_INTERVAL_FIXTURE = REDIS_EXPIRATION_TIME_FIXTURE - 1500; // In seconds
export const FETCH_INTERVAL_STANDING = REDIS_EXPIRATION_TIME_STANDING - 1500; // In seconds
export const FETCH_INTERVAL_REALTIME_MATCHES =
  REDIS_EXPIRATION_TIME_REALTIME_MATCHES - 30; // In seconds

/* Data Fetching Interval */
export const FIXTURE_STANDING_TIMEOUT = 900000; // 15 minutes in milliseconds
export const DATA_UPDATING_TIMEOUT = 2400000; // 40 minutes in milliseconds

/* Socket.io */
export const EVENT_REALTIME_MATCH_DATA_BY_CLUB = 'realtime-match-data-by-club';
export const EVENT_REALTIME_MATCH_DATA_BY_ID = 'realtime-match-data-by-id';
export const FIRST_FETCH_TIMEOUT_REALTIME_MATCH_DATA = 2700000; // 45 minutes in milliseconds
export const DATA_SENDING_INTERVAL = FETCH_INTERVAL_REALTIME_MATCHES * 1000; // 30 seconds in milliseconds

/* Match Status */
export const MATCH_STATUS_IDS_LIVE = [2, 3, 4, 5, 7];
export const MATCH_STATUS_ID_END = 8;

/* Log Files */
export const LOG_FILE_MAXIMUM_SIZE = 10485760; // 10 Megabytes in bytes
export const LOG_FILE_DELETE_CHECK_INTERVAL = 604800000; // 7 days in milliseconds

/* Misc */
export const MAXIMUM_ERROR_COUNT = 10;
