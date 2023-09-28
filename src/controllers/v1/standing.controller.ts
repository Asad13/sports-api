import type { Request, Response, NextFunction } from 'express';
import redisClient from '@databases/redis';
import CustomError from '@utils/custom-error';
import logger from '@src/utils/logger';
import {
  fetchCountryData,
  fetchLeagueData,
  fetchStandingData,
} from '@src/utils/data-fetching-functions';
import {
  REDIS_KEY_STANDING_MEN,
  REDIS_KEY_STANDING_WOMEN,
} from '@src/configs/constants';
import { TeamType } from '@src/types/team';

const getData = async (type: TeamType): Promise<any> => {
  let data: any;
  const key =
    type === TeamType.MEN ? REDIS_KEY_STANDING_MEN : REDIS_KEY_STANDING_WOMEN;
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

    const result = await fetchStandingData(
      countryIds,
      countryInfo,
      leagueIds,
      leagueInfo,
      type
    );

    if (result instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING STANDING DATA]: unable to fetch league standing data from thesports api'
      );
      return result;
    }

    data = result;
  }

  return data;
};

export const getMensStandingHandler = async (
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
      message: "All Men's Team Standing",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getWomensStandingHandler = async (
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
      message: "All Women's Team Standing",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};
