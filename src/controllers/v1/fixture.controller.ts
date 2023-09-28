import type { Request, Response, NextFunction } from 'express';
import redisClient from '@databases/redis';
import CustomError, { ErrorCode, ErrorType } from '@utils/custom-error';
import logger from '@src/utils/logger';
import {
  fetchCountryData,
  fetchCompetitionData,
  fetchFixtureData,
} from '@src/utils/data-fetching-functions';
import {
  REDIS_KEY_FIXTURE_MEN,
  REDIS_KEY_FIXTURE_WOMEN,
} from '@src/configs/constants';
import { TeamType } from '@src/types/team';

const getData = async (type: TeamType): Promise<any> => {
  let data: any;
  const key =
    type === TeamType.MEN ? REDIS_KEY_FIXTURE_MEN : REDIS_KEY_FIXTURE_WOMEN;
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

    const competitionData = await fetchCompetitionData(
      countryIds,
      countryInfo,
      type
    );
    if (competitionData instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING COMPETITION DATA]: unable to fetch competition data from thesports api'
      );
      return competitionData;
    }
    const [competitionIds, competitionInfo] = competitionData;

    const result = await fetchFixtureData(
      countryIds,
      countryInfo,
      competitionIds,
      competitionInfo,
      type
    );

    if (result instanceof CustomError) {
      logger.error(
        '[ERROR FETCHING FIXTURE DATA]: unable to fetch fixture data from thesports api'
      );
      return result;
    }

    data = result;
  }

  return data;
};

export const getMensFixtureHandler = async (
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
      message: "All Men's Match Data",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getWomensFixtureHandler = async (
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
      message: "All Women's Match Data",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

const filterMatchesByClub = (
  dataMen: any,
  dataWomen: any,
  clubId: string
): any[] => {
  const result: any[] = [];

  dataMen.forEach((country: any) => {
    const countryId = country.country_id;
    const countryName = country.country_name;

    country.competitions.forEach((competition: any) => {
      const competitionId = competition.competition_id;
      const competitionName = competition.competition_name;

      competition.matches.forEach((match: any) => {
        if (match.home_team_id === clubId || match.away_team_id === clubId) {
          result.push({
            country_id: countryId,
            country_name: countryName,
            competition_id: competitionId,
            competition_name: competitionName,
            ...match,
          });
        }
      });
    });
  });

  if (result.length === 0) {
    dataWomen.forEach((country: any) => {
      const countryId = country.country_id;
      const countryName = country.country_name;

      country.competitions.forEach((competition: any) => {
        const competitionId = competition.competition_id;
        const competitionName = competition.competition_name;

        competition.matches.forEach((match: any) => {
          if (match.home_team_id === clubId || match.away_team_id === clubId) {
            result.push({
              country_id: countryId,
              country_name: countryName,
              competition_id: competitionId,
              competition_name: competitionName,
              ...match,
            });
          }
        });
      });
    });
  }

  return result;
};

export const getFixtureByClubHandler = async (
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

    const data = filterMatchesByClub(dataMen, dataWomen, clubId);

    res.status(200).json({
      status: true,
      message: `Matches Data of the club with id ${clubId}`,
      data,
    });
  } catch (error: any) {
    next(error);
  }
};
