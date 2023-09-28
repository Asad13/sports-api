import redisClient from '@databases/redis';
import { createDataApiUrl } from '@src/utils/create-urls';
import { fetchData } from '@src/utils/fetch';
import { saveTeams } from '@src/services/v1/team.service';
import CustomError from '@utils/custom-error';
import logger from './logger';
import { COUNTRIES, LEAGUES } from '@src/configs/leagues';
import { COMPETITIONS } from '@src/configs/competitions';
import {
  FOOTBALL_COUNTRY_PATH,
  FOOTBALL_COMPETITION_PATH,
  FOOTBALL_TEAM_PATH,
  FOOTBALL_VENUE_PATH,
  FOOTBALL_MATCH_PATH,
  FOOTBALL_STANDING_PATH,
} from '@src/configs/url-paths';
import {
  REDIS_KEY_COUNTRY_IDS,
  REDIS_KEY_COUNTRY_NAMES,
  REDIS_KEY_LEAGUE_IDS_MEN,
  REDIS_KEY_LEAGUE_INFO_MEN,
  REDIS_KEY_LEAGUE_IDS_WOMEN,
  REDIS_KEY_LEAGUE_INFO_WOMEN,
  REDIS_KEY_COMPETITION_IDS_MEN,
  REDIS_KEY_COMPETITION_INFO_MEN,
  REDIS_KEY_COMPETITION_IDS_WOMEN,
  REDIS_KEY_COMPETITION_INFO_WOMEN,
  REDIS_KEY_TEAM_MEN,
  REDIS_KEY_TEAM_WOMEN,
  REDIS_KEY_TEAM_HASH_MEN,
  REDIS_KEY_TEAM_HASH_WOMEN,
  REDIS_KEY_FIXTURE_MEN,
  REDIS_KEY_FIXTURE_WOMEN,
  REDIS_KEY_UPCOMING_MATCHES_MEN,
  REDIS_KEY_UPCOMING_MATCHES_WOMEN,
  REDIS_KEY_STANDING_MEN,
  REDIS_KEY_STANDING_WOMEN,
  REDIS_EXPIRATION_TIME_TEAM,
  REDIS_EXPIRATION_TIME_FIXTURE,
  REDIS_EXPIRATION_TIME_STANDING,
  FETCH_INTERVAL_TEAM,
  FETCH_INTERVAL_FIXTURE,
  FETCH_INTERVAL_STANDING,
  MATCH_STATUS_IDS_LIVE,
  MATCH_STATUS_ID_END,
  MAXIMUM_ERROR_COUNT,
  FIXTURE_STANDING_TIMEOUT,
  DATA_UPDATING_TIMEOUT,
} from '@configs/constants';
import { TeamType, type TSelectedCountry } from '@src/types/team';

/* Fetch Country Data */
export const fetchCountryData = async (page = 1): Promise<any> => {
  const isCountryIdsExists = await redisClient.exists(REDIS_KEY_COUNTRY_IDS);
  const isCountryInfoExists = await redisClient.exists(REDIS_KEY_COUNTRY_NAMES);

  if (isCountryIdsExists > 0 && isCountryInfoExists > 0) {
    const countryIdsJson = await redisClient.get(REDIS_KEY_COUNTRY_IDS);
    const countryInfoJson = await redisClient.get(REDIS_KEY_COUNTRY_NAMES);

    if (countryIdsJson != null && countryInfoJson != null) {
      const countryIds = await JSON.parse(countryIdsJson);
      const countryInfo = await JSON.parse(countryInfoJson);

      return [countryIds, countryInfo];
    }
  }

  const countryIds = [];
  const countryInfo: any = {};

  let fetchMore = true;
  while (fetchMore) {
    const urlCountry: string | CustomError = createDataApiUrl(
      FOOTBALL_COUNTRY_PATH,
      {
        page,
      }
    );

    if (urlCountry instanceof CustomError) {
      return urlCountry;
    }

    const countries = await fetchData(urlCountry);

    if (countries instanceof CustomError) {
      return countries;
    } else if (countries.length === 0) {
      break;
    }

    let totalCountriesDone = 0;

    for (let i = 0; i < countries.length; i++) {
      const index = COUNTRIES.indexOf(countries[i].name as TSelectedCountry);
      if (index > -1) {
        const country: TSelectedCountry = COUNTRIES[index];
        countryIds.push(countries[i].id);
        countryInfo[countries[i].id] = {
          name: country,
          logo: countries[i].logo,
        };

        totalCountriesDone += 1;
        if (totalCountriesDone === COUNTRIES.length) break;
      }
    }

    if (countryIds.length >= COUNTRIES.length) {
      fetchMore = false;
    } else {
      page += 1;
    }
  }

  await redisClient.setEx(
    REDIS_KEY_COUNTRY_IDS,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(countryIds)
  );

  await redisClient.setEx(
    REDIS_KEY_COUNTRY_NAMES,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(countryInfo)
  );

  return [countryIds, countryInfo];
};

/* Fetch League Data */
export const fetchLeagueData = async (
  countryIds: string[],
  countryInfo: any,
  teamType: TeamType,
  page = 1
): Promise<any> => {
  const keyLeagueIds =
    teamType === TeamType.MEN
      ? REDIS_KEY_LEAGUE_IDS_MEN
      : REDIS_KEY_LEAGUE_IDS_WOMEN;
  const keyLeagueInfo =
    teamType === TeamType.MEN
      ? REDIS_KEY_LEAGUE_INFO_MEN
      : REDIS_KEY_LEAGUE_INFO_WOMEN;

  const isLeagueIdsExists = await redisClient.exists(keyLeagueIds);
  const isLeagueInfoExists = await redisClient.exists(keyLeagueInfo);

  if (isLeagueIdsExists > 0 && isLeagueInfoExists > 0) {
    const leagueIdsJson = await redisClient.get(keyLeagueIds);
    const leagueInfoJson = await redisClient.get(keyLeagueInfo);

    if (leagueIdsJson != null && leagueInfoJson != null) {
      const leagueIds = await JSON.parse(leagueIdsJson);
      const leagueInfo = await JSON.parse(leagueInfoJson);

      return [leagueIds, leagueInfo];
    }
  }

  const leagueIds: any = {};
  const leagueInfo: any = {};
  let TOTAL_NUMBER_OF_LEAGUES = 0;

  for (const country in LEAGUES) {
    TOTAL_NUMBER_OF_LEAGUES +=
      LEAGUES[country as TSelectedCountry][teamType].length;
  }

  for (let i = 0; i < countryIds.length; i++) {
    leagueIds[countryIds[i]] = [];
  }

  let fetchMore = true;
  while (fetchMore) {
    const urlCompetion: string | CustomError = createDataApiUrl(
      FOOTBALL_COMPETITION_PATH,
      {
        page,
      }
    );

    if (urlCompetion instanceof CustomError) {
      return urlCompetion;
    }

    const competitions = await fetchData(urlCompetion);

    if (competitions instanceof CustomError) {
      return competitions;
    } else if (competitions.length === 0) {
      break;
    }

    let totalLeaguesDone = 0;
    for (const countryId in leagueIds) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      totalLeaguesDone += leagueIds[countryId].length;
    }

    for (let j = 0; j < competitions.length; j++) {
      if (countryIds.includes(competitions[j].country_id)) {
        const leagues =
          LEAGUES[
            countryInfo[competitions[j].country_id].name as TSelectedCountry
          ][teamType];

        let isLeaguePresent = false;
        let numberOfTeams = 0;
        for (let a = 0; a < leagues.length; a++) {
          if (
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            competitions[j].name
              .toLowerCase()
              .includes(leagues[a].name.toLowerCase())
          ) {
            isLeaguePresent = true;
            numberOfTeams = leagues[a].numberOfTeams;
            break;
          }
        }

        if (isLeaguePresent) {
          leagueIds[competitions[j].country_id].push(competitions[j].id);
          leagueInfo[competitions[j].id] = {
            country_id: competitions[j].country_id,
            name: competitions[j].name.trim(),
            logo: competitions[j].logo.trim(),
            cur_season_id: competitions[j].cur_season_id,
            numberOfTeams,
          };

          totalLeaguesDone += 1;
          if (totalLeaguesDone === TOTAL_NUMBER_OF_LEAGUES) break;
        }
      }
    }

    if (totalLeaguesDone >= TOTAL_NUMBER_OF_LEAGUES) {
      fetchMore = false;
    } else {
      page += 1;
    }
  }

  await redisClient.setEx(
    keyLeagueIds,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(leagueIds)
  );

  await redisClient.setEx(
    keyLeagueInfo,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(leagueInfo)
  );

  return [leagueIds, leagueInfo];
};

/* Fetch Competition Data */
export const fetchCompetitionData = async (
  countryIds: string[],
  countryInfo: any,
  teamType: TeamType,
  page = 1
): Promise<any> => {
  const keyCompetitionIds =
    teamType === TeamType.MEN
      ? REDIS_KEY_COMPETITION_IDS_MEN
      : REDIS_KEY_COMPETITION_IDS_WOMEN;
  const keyCompetitionInfo =
    teamType === TeamType.MEN
      ? REDIS_KEY_COMPETITION_INFO_MEN
      : REDIS_KEY_COMPETITION_INFO_WOMEN;

  const isCompetitionIdsExists = await redisClient.exists(keyCompetitionIds);
  const isCompetitionInfoExists = await redisClient.exists(keyCompetitionInfo);

  if (isCompetitionIdsExists > 0 && isCompetitionInfoExists > 0) {
    const competitionIdsJson = await redisClient.get(keyCompetitionIds);
    const competitionInfoJson = await redisClient.get(keyCompetitionInfo);

    if (competitionIdsJson != null && competitionInfoJson != null) {
      const competitionIds = await JSON.parse(competitionIdsJson);
      const competitionInfo = await JSON.parse(competitionInfoJson);

      return [competitionIds, competitionInfo];
    }
  }

  const competitionIds: any = {};
  const competitionInfo: any = {};
  let TOTAL_NUMBER_OF_COMPETITIONS = 0;

  for (const country in COMPETITIONS) {
    TOTAL_NUMBER_OF_COMPETITIONS +=
      COMPETITIONS[country as TSelectedCountry][teamType].length;
  }

  for (let i = 0; i < countryIds.length; i++) {
    competitionIds[countryIds[i]] = [];
  }

  let fetchMore = true;
  while (fetchMore) {
    const urlCompetion: string | CustomError = createDataApiUrl(
      FOOTBALL_COMPETITION_PATH,
      {
        page,
      }
    );

    if (urlCompetion instanceof CustomError) {
      return urlCompetion;
    }

    const competitions = await fetchData(urlCompetion);

    if (competitions instanceof CustomError) {
      return competitions;
    } else if (competitions.length === 0) {
      break;
    }

    let totalCompetitionsDone = 0;
    for (const countryId in competitionIds) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      totalCompetitionsDone += competitionIds[countryId].length;
    }

    for (let j = 0; j < competitions.length; j++) {
      if (countryIds.includes(competitions[j].country_id)) {
        const requiredCompetitions =
          COMPETITIONS[
            countryInfo[competitions[j].country_id].name as TSelectedCountry
          ][teamType];

        let isCompetitionPresent = false;
        for (let a = 0; a < requiredCompetitions.length; a++) {
          if (
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            competitions[j].name
              .toLowerCase()
              .includes(requiredCompetitions[a].name.toLowerCase())
          ) {
            isCompetitionPresent = true;
            break;
          }
        }

        if (isCompetitionPresent) {
          // competitionIds.push(competitions[j].id);
          competitionIds[competitions[j].country_id].push(competitions[j].id);
          competitionInfo[competitions[j].id] = {
            country_id: competitions[j].country_id,
            name: competitions[j].name.trim(),
            logo: competitions[j].logo.trim(),
          };

          totalCompetitionsDone += 1;
          if (totalCompetitionsDone === TOTAL_NUMBER_OF_COMPETITIONS) break;
        }
      }
    }

    if (totalCompetitionsDone >= TOTAL_NUMBER_OF_COMPETITIONS) {
      fetchMore = false;
    } else {
      page += 1;
    }
  }

  await redisClient.setEx(
    keyCompetitionIds,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(competitionIds)
  );

  await redisClient.setEx(
    keyCompetitionInfo,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(competitionInfo)
  );

  return [competitionIds, competitionInfo];
};

/* Fetch Team Data */
export const fetchTeamData = async (
  countryIds: string[],
  countryInfo: any,
  leagueIds: any,
  leagueInfo: any,
  type: TeamType,
  page = 1
): Promise<any> => {
  const result: any[] = [];
  const allTeams: any[] = [];
  const numberOfTeamsFetched: any = {};

  const hashKey =
    type === TeamType.MEN ? REDIS_KEY_TEAM_HASH_MEN : REDIS_KEY_TEAM_HASH_WOMEN;

  for (const countryId in leagueIds) {
    result.push({
      country_id: countryId,
      country_name: countryInfo[countryId].name,
      logo: countryInfo[countryId].logo,
      leagues: [],
    });
    for (let i = 0; i < leagueIds[countryId].length; i++) {
      result[result.length - 1].leagues.push({
        league_id: leagueIds[countryId][i],
        league_name: leagueInfo[leagueIds[countryId][i]].name,
        logo: leagueInfo[leagueIds[countryId][i]].logo,
        teams: [],
      });
    }
  }

  for (const leagueId in leagueInfo) {
    numberOfTeamsFetched[leagueId] = 0;
  }

  let fetchMore = true;
  let urlErrorCount = 0;
  let dataErrorCount = 0;
  while (fetchMore) {
    const urlTeam: string | CustomError = createDataApiUrl(FOOTBALL_TEAM_PATH, {
      page,
    });

    if (!(urlTeam instanceof CustomError)) {
      const teams = await fetchData(urlTeam);

      if (!(teams instanceof CustomError)) {
        if (teams === undefined || teams?.length === 0) {
          fetchMore = false;
          break;
        }

        for (let k = 0; k < teams.length; k++) {
          if (countryIds.includes(teams[k].country_id)) {
            if (
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              leagueIds[teams[k].country_id]?.includes(
                teams[k].competition_id
              ) &&
              numberOfTeamsFetched[teams[k].competition_id] <
                leagueInfo[teams[k].competition_id].numberOfTeams
            ) {
              // Fetch Venue
              let venue;

              if (
                teams[k]?.venue_id !== undefined &&
                teams[k]?.venue_id !== null
              ) {
                const urlVenue: string | CustomError = createDataApiUrl(
                  FOOTBALL_VENUE_PATH,
                  { uuid: teams[k].venue_id }
                );

                if (!(urlVenue instanceof CustomError)) {
                  venue = await fetchData(urlVenue);

                  if (venue instanceof CustomError) {
                    venue = [
                      {
                        id: '',
                        name: '',
                        capacity: 0,
                      },
                    ];
                  }
                } else {
                  venue = [
                    {
                      id: '',
                      name: '',
                      capacity: 0,
                    },
                  ];
                }
              } else {
                venue = [
                  {
                    id: '',
                    name: '',
                    capacity: 0,
                  },
                ];
              }

              const countryIndex = result.findIndex(
                (value: any, index: number, array: any[]) =>
                  value.country_id === teams[k].country_id
              );

              const leagueIndex = result[countryIndex].leagues.findIndex(
                (value: any, index: number, array: any[]) =>
                  value.league_id === teams[k].competition_id
              );

              const value = {
                id: teams[k].id,
                name: teams[k]?.name,
                logo: teams[k]?.logo,
                venue: venue[0]?.name ?? '',
                capacity: venue[0]?.capacity ?? 0,
              };

              result[countryIndex].leagues[leagueIndex].teams.push(value);

              const team = {
                ...value,
                country_id: teams[k].country_id,
                competition_id: teams[k].competition_id,
                venue_id: venue[0]?.id ?? '',
              };

              await redisClient.hSet(
                hashKey,
                teams[k].id,
                JSON.stringify(team)
              );

              allTeams.push(team);

              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              numberOfTeamsFetched[teams[k].competition_id] += 1;
            }
          }
        }
      } else {
        dataErrorCount++;
        if (dataErrorCount >= MAXIMUM_ERROR_COUNT) {
          break;
        }
      }
    } else {
      urlErrorCount++;

      if (urlErrorCount >= MAXIMUM_ERROR_COUNT) {
        break;
      }
    }

    let isAllTeamsFetched = true;
    for (const leagueId in leagueInfo) {
      if (numberOfTeamsFetched[leagueId] < leagueInfo[leagueId].numberOfTeams) {
        isAllTeamsFetched = false;
      }
    }

    if (isAllTeamsFetched) {
      fetchMore = false;
    } else {
      page += 1;
    }
  }

  const key = type === TeamType.MEN ? REDIS_KEY_TEAM_MEN : REDIS_KEY_TEAM_WOMEN;

  // Caching All Teams in Redis
  await redisClient.setEx(
    key,
    REDIS_EXPIRATION_TIME_TEAM,
    JSON.stringify(result)
  );

  // Saving All Teams in Postgres
  await saveTeams(allTeams);

  return result;
};

/* Fetch Fixture Data */
export const fetchFixtureData = async (
  countryIds: string[],
  countryInfo: any,
  competitionIds: any,
  competitionInfo: any,
  type: TeamType,
  page = 1
): Promise<any> => {
  const CURRENT_TIME = new Date().getTime() / 1000; // In seconds
  const TIME_LIMIT = CURRENT_TIME + 7 * 24 * 3600; // In seconds
  const result: any[] = [];
  const upcomingMatches: any = {};

  for (const countryId in competitionIds) {
    result.push({
      country_id: countryId,
      country_name: countryInfo[countryId].name,
      logo: countryInfo[countryId].logo,
      competitions: [],
    });
    for (let i = 0; i < competitionIds[countryId].length; i++) {
      result[result.length - 1].competitions.push({
        competition_id: competitionIds[countryId][i],
        competition_name: competitionInfo[competitionIds[countryId][i]].name,
        logo: competitionInfo[competitionIds[countryId][i]].logo,
        matches: [],
      });
    }
  }

  const hashKey =
    type === TeamType.MEN ? REDIS_KEY_TEAM_HASH_MEN : REDIS_KEY_TEAM_HASH_WOMEN;

  let fetchMore = true;
  let urlErrorCount = 0;
  let dataErrorCount = 0;
  while (fetchMore) {
    const urlMatch: string | CustomError = createDataApiUrl(
      FOOTBALL_MATCH_PATH,
      {
        page,
      }
    );

    if (!(urlMatch instanceof CustomError)) {
      const matches = await fetchData(urlMatch);

      if (!(matches instanceof CustomError)) {
        if (matches === undefined || matches?.length === 0) {
          fetchMore = false;
          break;
        }

        for (let k = 0; k < matches.length; k++) {
          const matchKickOffTime = matches[k].match_time;
          if (
            // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/strict-boolean-expressions
            competitionInfo.hasOwnProperty(matches[k].competition_id)
          ) {
            if (matchKickOffTime <= TIME_LIMIT) {
              const matchDateTime = new Date(
                matchKickOffTime * 1000
              ).toUTCString();

              // Get Home Team Info
              let homeTeam: any;

              const isHomeTeamExist = await redisClient.hExists(
                hashKey,
                matches[k].home_team_id
              );

              if (isHomeTeamExist) {
                homeTeam = await redisClient.hGet(
                  hashKey,
                  matches[k].home_team_id
                );
                homeTeam = [await JSON.parse(homeTeam)];
              }

              if (homeTeam === undefined || homeTeam == null) {
                // Fetch Home Team Info
                const urlTeamHome: string | CustomError = createDataApiUrl(
                  FOOTBALL_TEAM_PATH,
                  {
                    uuid: matches[k].home_team_id,
                  }
                );

                if (!(urlTeamHome instanceof CustomError)) {
                  homeTeam = await fetchData(urlTeamHome);

                  if (homeTeam instanceof CustomError) {
                    homeTeam = [
                      {
                        name: '',
                        logo: '',
                        venue_id: '',
                      },
                    ];
                  }
                } else {
                  homeTeam = [
                    {
                      name: '',
                      logo: '',
                      venue_id: '',
                    },
                  ];
                }
              }

              // Get Away Team Info
              let awayTeam: any;

              const isAwayTeamExist = await redisClient.hExists(
                hashKey,
                matches[k].away_team_id
              );

              if (isAwayTeamExist) {
                awayTeam = await redisClient.hGet(
                  hashKey,
                  matches[k].away_team_id
                );
                awayTeam = [await JSON.parse(awayTeam)];
              }

              if (awayTeam === undefined || awayTeam == null) {
                // Fetch Away Team
                const urlTeamAway: string | CustomError = createDataApiUrl(
                  FOOTBALL_TEAM_PATH,
                  {
                    uuid: matches[k].away_team_id,
                  }
                );

                if (!(urlTeamAway instanceof CustomError)) {
                  awayTeam = await fetchData(urlTeamAway);

                  if (awayTeam instanceof CustomError) {
                    awayTeam = [
                      {
                        name: '',
                        logo: '',
                      },
                    ];
                  }
                } else {
                  awayTeam = [
                    {
                      name: '',
                      logo: '',
                    },
                  ];
                }
              }

              let venue;

              if (
                homeTeam !== undefined &&
                homeTeam[0]?.venue_id === matches[k].venue_id &&
                homeTeam[0]?.venue !== undefined
              ) {
                venue = [
                  {
                    id: homeTeam[0].venue_id,
                    name: homeTeam[0].venue,
                    capacity: homeTeam[0].capacity,
                  },
                ];
              } else {
                // Fetch Venue
                const urlVenue: string | CustomError = createDataApiUrl(
                  FOOTBALL_VENUE_PATH,
                  { uuid: matches[k].venue_id }
                );

                if (!(urlVenue instanceof CustomError)) {
                  venue = await fetchData(urlVenue);

                  if (venue instanceof CustomError) {
                    venue = [
                      {
                        id: '',
                        name: '',
                        capacity: 0,
                      },
                    ];
                  }
                } else {
                  venue = [
                    {
                      id: '',
                      name: '',
                      capacity: 0,
                    },
                  ];
                }
              }

              const isLive = MATCH_STATUS_IDS_LIVE.includes(
                matches[k].status_id
              );
              const isCompleted = matches[k].status_id === MATCH_STATUS_ID_END;

              let scoreLine: any = null;
              if (isLive || isCompleted) {
                /* Full Time Score */
                scoreLine = {
                  home_team:
                    matches[k].home_scores[5] > matches[k].home_scores[0]
                      ? matches[k].home_scores[5]
                      : matches[k].home_scores[0],
                  away_team:
                    matches[k].away_scores[5] > matches[k].away_scores[0]
                      ? matches[k].away_scores[5]
                      : matches[k].away_scores[0],
                };

                /* Penalty shootout score，only penalty shootout */
                if (
                  matches[k].home_scores[6] > 0 ||
                  matches[k].away_scores[6] > 0
                ) {
                  scoreLine.penalty_score = {
                    home_team: matches[k].home_scores[6],
                    away_team: matches[k].away_scores[6],
                  };
                }
              }

              const countryId =
                competitionInfo[matches[k].competition_id].country_id;

              const countryIndex = result.findIndex(
                (value: any, index: number, array: any[]) =>
                  value.country_id === countryId
              );

              const competitionIndex = result[
                countryIndex
              ].competitions.findIndex(
                (value: any, index: number, array: any[]) =>
                  value.competition_id === matches[k].competition_id
              );

              if (!isCompleted) {
                upcomingMatches[matches[k].id] = {
                  country_id: countryId,
                  competition_id: matches[k].competition_id,
                  home_team_id: matches[k].home_team_id,
                  away_team_id: matches[k].away_team_id,
                };
              }

              const value = {
                id: matches[k].id,
                date: matchDateTime,
                is_live: isLive,
                is_completed: isCompleted,
                home_team_id: matches[k].home_team_id,
                home_team: homeTeam[0]?.name ?? '',
                home_team_logo: homeTeam[0]?.logo ?? '',
                away_team_id: matches[k].away_team_id,
                away_team: awayTeam[0]?.name ?? '',
                away_team_logo: awayTeam[0]?.logo ?? '',
                venue: venue[0].name,
                result: scoreLine,
              };

              result[countryIndex].competitions[competitionIndex].matches.push(
                value
              );
            }
          }
        }
      } else {
        dataErrorCount++;

        if (dataErrorCount >= MAXIMUM_ERROR_COUNT) {
          break;
        }
      }
    } else {
      urlErrorCount++;

      if (urlErrorCount >= MAXIMUM_ERROR_COUNT) {
        break;
      }
    }

    if (fetchMore) page += 1;
  }

  const upcomingMatchesKey =
    type === TeamType.MEN
      ? REDIS_KEY_UPCOMING_MATCHES_MEN
      : REDIS_KEY_UPCOMING_MATCHES_WOMEN;

  await redisClient.setEx(
    upcomingMatchesKey,
    REDIS_EXPIRATION_TIME_FIXTURE,
    JSON.stringify(upcomingMatches)
  );

  const key =
    type === TeamType.MEN ? REDIS_KEY_FIXTURE_MEN : REDIS_KEY_FIXTURE_WOMEN;

  await redisClient.setEx(
    key,
    REDIS_EXPIRATION_TIME_FIXTURE,
    JSON.stringify(result)
  );

  return result;
};

/* Fetch Standing Data */
export const fetchStandingData = async (
  countryIds: string[],
  countryInfo: any,
  leagueIds: any,
  leagueInfo: any,
  type: TeamType,
  page = 1
): Promise<any> => {
  const result: any[] = [];

  const hashKey =
    type === TeamType.MEN ? REDIS_KEY_TEAM_HASH_MEN : REDIS_KEY_TEAM_HASH_WOMEN;

  for (const countryId in leagueIds) {
    result.push({
      country_id: countryId,
      country_name: countryInfo[countryId].name,
      logo: countryInfo[countryId].logo,
      leagues: [],
    });
    for (let i = 0; i < leagueIds[countryId].length; i++) {
      result[result.length - 1].leagues.push({
        league_id: leagueIds[countryId][i],
        league_name: leagueInfo[leagueIds[countryId][i]].name,
        logo: leagueInfo[leagueIds[countryId][i]].logo,
        table: [],
      });
    }
  }

  for (const key in leagueInfo) {
    if (leagueInfo[key].cur_season_id !== '') {
      const urlStanding: string | CustomError = createDataApiUrl(
        FOOTBALL_STANDING_PATH,
        {
          page,
          uuid: leagueInfo[key].cur_season_id,
        }
      );

      if (!(urlStanding instanceof CustomError)) {
        const data: any = await fetchData(urlStanding);

        if (!(data instanceof CustomError)) {
          const rows: any[] = data.tables[0].rows;

          if (rows == null || rows === undefined || rows.length === 0) continue;

          const countryId = leagueInfo[key].country_id;

          const countryIndex = result.findIndex(
            (value: any, index: number, array: any[]) =>
              value.country_id === countryId
          );

          const leagueIndex = result[countryIndex].leagues.findIndex(
            (value: any, index: number, array: any[]) => value.league_id === key
          );

          for (let i = 0; i < rows.length; i++) {
            // Get Team Info
            let team: any;

            const isTeamExist = await redisClient.hExists(
              hashKey,
              rows[i]?.team_id
            );

            if (isTeamExist) {
              team = await redisClient.hGet(hashKey, rows[i]?.team_id);
              team = [await JSON.parse(team)];
            }

            if (team === undefined || team == null) {
              // Fetch Team Info
              const urlTeam: string | CustomError = createDataApiUrl(
                FOOTBALL_TEAM_PATH,
                {
                  uuid: rows[i].team_id,
                }
              );

              if (!(urlTeam instanceof CustomError)) {
                team = await fetchData(urlTeam);
                if (team instanceof CustomError) {
                  team = [
                    {
                      id: '',
                      name: '',
                      logo: '',
                    },
                  ];
                }
              } else {
                team = [
                  {
                    id: '',
                    name: '',
                    logo: '',
                  },
                ];
              }
            }

            const value = {
              id: rows[i].team_id,
              name: team[0]?.name ?? '',
              logo: team[0]?.logo ?? '',
              points: rows[i].points,
              position: rows[i].position,
              home_stats: {
                played: rows[i].home_total,
                won: rows[i].home_won,
                drawn: rows[i].home_draw,
                lost: rows[i].home_loss,
                goals_scored: rows[i].home_goals,
                goals_against: rows[i].home_goals_against,
              },
              away_stats: {
                played: rows[i].away_total,
                won: rows[i].away_won,
                drawn: rows[i].away_draw,
                lost: rows[i].away_loss,
                goals_scored: rows[i].away_goals,
                goals_against: rows[i].away_goals_against,
              },
            };

            result[countryIndex].leagues[leagueIndex].table.push(value);
          }
        }
      }
    }
  }

  const key =
    type === TeamType.MEN ? REDIS_KEY_STANDING_MEN : REDIS_KEY_STANDING_WOMEN;

  await redisClient.setEx(
    key,
    REDIS_EXPIRATION_TIME_STANDING,
    JSON.stringify(result)
  );

  return result;
};

const fetchAndCacheTeamData = async (): Promise<void> => {
  const countryData = await fetchCountryData();
  if (countryData instanceof CustomError) {
    logger.error(
      '[ERROR FETCHING COUNTRY DATA:AUTO]: unable to fetch country data from thesports api'
    );
    return;
  }

  const [countryIds, countryInfo] = countryData;

  const types = Object.values(TeamType);

  types.forEach((type, index) => {
    fetchLeagueData(countryIds, countryInfo, type as TeamType)
      .then((leagueData) => {
        if (leagueData instanceof CustomError) {
          throw leagueData as ICustomError;
        }

        const [leagueIds, leagueInfo] = leagueData;

        fetchTeamData(
          countryIds,
          countryInfo,
          leagueIds,
          leagueInfo,
          type as TeamType
        )
          .then((result) => {
            if (result instanceof CustomError) {
              throw result as ICustomError;
            }
          })
          .catch(() => {
            logger.error(
              '[ERROR FETCHING TEAM DATA:AUTO]: unable to fetch team data from thesports api'
            );
          });
      })
      .catch(() => {
        logger.error(
          '[ERROR FETCHING LEAGUE DATA:AUTO]: unable to fetch leage data from thesports api'
        );
      });
  });
};

const fetchAndCacheFixtureData = async (): Promise<any> => {
  const countryData = await fetchCountryData();
  if (countryData instanceof CustomError) {
    logger.error(
      '[ERROR FETCHING COUNTRY DATA:AUTO]: unable to fetch country data from thesports api'
    );
    return;
  }
  const [countryIds, countryInfo] = countryData;

  const types = Object.values(TeamType);

  types.forEach((type, index) => {
    fetchCompetitionData(countryIds, countryInfo, type as TeamType)
      .then((competitionData) => {
        if (competitionData instanceof CustomError) {
          throw competitionData as ICustomError;
        }
        const [competitionIds, competitionInfo] = competitionData;

        fetchFixtureData(
          countryIds,
          countryInfo,
          competitionIds,
          competitionInfo,
          type as TeamType
        )
          .then((result) => {
            if (result instanceof CustomError) {
              throw result as ICustomError;
            }
          })
          .catch(() => {
            logger.error(
              '[ERROR FETCHING FIXTURE DATA:AUTO]: unable to fetch fixture data from thesports api'
            );
          });
      })
      .catch(() => {
        logger.error(
          '[ERROR FETCHING COMPETITION DATA:AUTO]: unable to fetch competition data from thesports api'
        );
      });
  });
};

const fetchAndCacheStandingData = async (): Promise<void> => {
  const countryData = await fetchCountryData();
  if (countryData instanceof CustomError) {
    logger.error(
      '[ERROR FETCHING COUNTRY DATA:AUTO]: unable to fetch country data from thesports api'
    );
    return;
  }
  const [countryIds, countryInfo] = countryData;

  const types = Object.values(TeamType);

  types.forEach((type, index) => {
    fetchLeagueData(countryIds, countryInfo, type as TeamType)
      .then((leagueData) => {
        if (leagueData instanceof CustomError) {
          throw leagueData as ICustomError;
        }
        const [leagueIds, leagueInfo] = leagueData;

        fetchStandingData(
          countryIds,
          countryInfo,
          leagueIds,
          leagueInfo,
          type as TeamType
        )
          .then((result) => {
            if (result instanceof CustomError) {
              throw result as ICustomError;
            }
          })
          .catch(() => {
            logger.error(
              '[ERROR FETCHING STANDING DATA:AUTO]: unable to fetch league standing data from thesports api'
            );
          });
      })
      .catch(() => {
        logger.error(
          '[ERROR FETCHING LEAGUE DATA:AUTO]: unable to fetch leage data from thesports api'
        );
      });
  });
};

export const loadData = (): void => {
  /* Initially Loading Teams API Data */
  fetchAndCacheTeamData()
    .then(() => {
      logger.info(
        '[LOADED TEAM DATA AT STARTUP]: loaded api data for teams to redis'
      );
    })
    .catch(() => {
      logger.error(
        '[ERROR LOADING TEAM DATA AT STARTUP]: unable to load api data for teams to redis'
      );
    });

  /* Starting To Fetch Fixture and Standing Data After Fetching Team Data */
  setTimeout(() => {
    /* Initially Loading Fixtures API Data */
    fetchAndCacheFixtureData()
      .then(() => {
        logger.info(
          '[LOADED FIXTURE DATA AT STARTUP]: loaded api data for fixtures to redis'
        );
      })
      .catch(() => {
        logger.error(
          '[ERROR LOADING FIXTURE DATA AT STARTUP]: unable to load api data for fixtures to redis'
        );
      });

    /* Initially Loading Standings API Data */
    fetchAndCacheStandingData()
      .then(() => {
        logger.info(
          '[LOADED STANDING DATA AT STARTUP]: loaded api data for standings to redis'
        );
      })
      .catch(() => {
        logger.error(
          '[ERROR LOADING STANDING DATA AT STARTUP]: unable to load api data for standings to redis'
        );
      });
  }, FIXTURE_STANDING_TIMEOUT).unref();

  /* Regularly updating Data After Certain Time */
  setTimeout(() => {
    /* Regularly updating Teams API Data */
    setInterval(() => {
      fetchAndCacheTeamData()
        .then(() => {
          logger.info(
            '[UPDATED TEAM DATA]: updated api data for teams to redis'
          );
        })
        .catch(() => {
          logger.error(
            '[ERROR UPDATING TEAM DATA]: unable to update api data for teams to redis'
          );
        });
    }, FETCH_INTERVAL_TEAM * 1000).unref();

    /* Regularly updating Fixtures API Data */
    setInterval(() => {
      fetchAndCacheFixtureData()
        .then(() => {
          logger.info(
            '[UPDATED FIXTURE DATA]: updated api data for fixtures to redis'
          );
        })
        .catch(() => {
          logger.error(
            '[ERROR UPDATING FIXTURE DATA]: unable to update api data for fixtures to redis'
          );
        });
    }, FETCH_INTERVAL_FIXTURE * 1000).unref();

    /* Regularly updating Standings API Data */
    setInterval(() => {
      fetchAndCacheStandingData()
        .then(() => {
          logger.info(
            '[UPDATED STANDING DATA]: updated api data for standings to redis'
          );
        })
        .catch(() => {
          logger.error(
            '[ERROR UPDATING STANDING DATA]: unable to update api data for standings to redis'
          );
        });
    }, FETCH_INTERVAL_STANDING * 1000).unref();
  }, DATA_UPDATING_TIMEOUT).unref();
};
