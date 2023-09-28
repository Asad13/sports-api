import type { Request, Response, NextFunction } from 'express';
import redisClient from '@databases/redis';
import CustomError from '@utils/custom-error';
import logger from '@src/utils/logger';
import {
  fetchCountryData,
  fetchLeagueData,
  fetchTeamData,
} from '@src/utils/data-fetching-functions';
import {
  REDIS_KEY_TEAM_MEN,
  REDIS_KEY_TEAM_WOMEN,
} from '@src/configs/constants';
import { TeamType } from '@src/types/team';

const getData = async (type: TeamType): Promise<any> => {
  let data: any;
  const key = type === TeamType.MEN ? REDIS_KEY_TEAM_MEN : REDIS_KEY_TEAM_WOMEN;
  const isDataAlreadyExists = await redisClient.exists(key);

  if (isDataAlreadyExists > 0) {
    data = await redisClient.get(key);
    data = await JSON.parse(data);
  } else {
    const countryData = await fetchCountryData();
    if (countryData instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING COUNTRY DATA]: unable to fetch country data from thesports api'
      );
      return countryData;
    }
    const [countryIds, countryInfo] = countryData;

    const leagueData = await fetchLeagueData(countryIds, countryInfo, type);
    if (leagueData instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING LEAGUE DATA]: unable to fetch leage data from thesports api'
      );
      return leagueData;
    }
    const [leagueIds, leagueInfo] = leagueData;

    const result = await fetchTeamData(
      countryIds,
      countryInfo,
      leagueIds,
      leagueInfo,
      type
    );

    if (result instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING TEAM DATA]: unable to fetch team data from thesports api'
      );
      return result;
    }

    data = result;
  }

  return data;
};

export const getMensTeamHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getData(TeamType.MEN);

    if (data instanceof CustomError) {
      throw data as ICustomError;
    }

    res.status(200).json({
      status: true,
      message: "All Men's Team",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getWomensTeamHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getData(TeamType.WOMEN);

    if (data instanceof CustomError) {
      throw data as ICustomError;
    }

    res.status(200).json({
      status: true,
      message: "All Women's Team",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

const filterTeamByClubId = (
  dataMen: any,
  dataWomen: any,
  clubId: string
): any => {
  let data = null;

  for (let i = 0; i < dataMen.length; i++) {
    const country = dataMen[i];

    const countryId = country.country_id;
    const countryName = country.country_name;

    for (let j = 0; j < country.leagues.length; j++) {
      const league = country.leagues[j];

      const leagueId = league.league_id;
      const leagueName = league.league_name;

      for (let k = 0; k < league.teams.length; k++) {
        const team = league.teams[k];

        if (team.id === clubId) {
          data = {
            country_id: countryId,
            country_name: countryName,
            league_id: leagueId,
            league_name: leagueName,
            ...team,
          };

          break;
        }
      }

      if (data != null) break;
    }

    if (data != null) break;
  }

  if (data == null) {
    for (let i = 0; i < dataWomen.length; i++) {
      const country = dataWomen[i];

      const countryId = country.country_id;
      const countryName = country.country_name;

      for (let j = 0; j < country.leagues.length; j++) {
        const league = country.leagues[j];

        const leagueId = league.league_id;
        const leagueName = league.league_name;

        for (let k = 0; k < league.teams.length; k++) {
          const team = league.teams[k];

          if (team.id === clubId) {
            data = {
              country_id: countryId,
              country_name: countryName,
              league_id: leagueId,
              league_name: leagueName,
              ...team,
            };

            break;
          }
        }

        if (data != null) break;
      }

      if (data != null) break;
    }
  }

  return data;
};

export const getTeamInfoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { clubId } = req.params;

    if (clubId === undefined) {
      const error = new CustomError(
        `[ERROR IN PARAMS]: no club id is provided as parameters in the url`,
        ErrorCode.BAD_REQUEST,
        ErrorType.CLIENT
      );

      throw error as ICustomError;
    }

    const dataMen = await getData(TeamType.MEN);

    if (dataMen instanceof CustomError) {
      throw dataMen as ICustomError;
    }

    const dataWomen = await getData(TeamType.WOMEN);

    if (dataWomen instanceof CustomError) {
      throw dataWomen as ICustomError;
    }

    const data = filterTeamByClubId(dataMen, dataWomen, clubId);

    if (data == null) {
      res.status(200).json({
        status: false,
        message: `No club found with id ${clubId}`,
        data: {},
      });
    } else {
      res.status(200).json({
        status: true,
        message: `Info of club with id ${clubId}`,
        data,
      });
    }
  } catch (error: any) {
    next(error);
  }
};
