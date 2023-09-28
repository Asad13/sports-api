/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-prototype-builtins */
import redisClient from '@databases/redis';
import { createDataApiUrl } from '@src/utils/create-urls';
import { fetchData } from '@src/utils/fetch';
import CustomError from '@utils/custom-error';
import logger from './logger';
import { FOOTBALL_MATCH_REALTIME_PATH } from '@src/configs/url-paths';
import {
  REDIS_KEY_UPCOMING_MATCHES_MEN,
  REDIS_KEY_UPCOMING_MATCHES_WOMEN,
  FETCH_INTERVAL_REALTIME_MATCHES,
  FIRST_FETCH_TIMEOUT_REALTIME_MATCH_DATA,
  REDIS_KEY_REALTIME_MATCHES,
  REDIS_EXPIRATION_TIME_REALTIME_MATCHES,
} from '@configs/constants';

/* Fetch Realtime Match Data */
const fetchRealtimeMatchData = async (): Promise<any[]> => {
  const result: any[] = [];

  const isUpMatchesMenExists = await redisClient.exists(
    REDIS_KEY_UPCOMING_MATCHES_MEN
  );
  const isUpMatchesWomenExists = await redisClient.exists(
    REDIS_KEY_UPCOMING_MATCHES_WOMEN
  );

  let liveMatchesMen: any;
  if (isUpMatchesMenExists > 0) {
    liveMatchesMen = await redisClient.get(REDIS_KEY_UPCOMING_MATCHES_MEN);
    liveMatchesMen = await JSON.parse(liveMatchesMen);
  } else {
    logger.info(
      "[UPCOMING MATCH DATA:MEN]: No Upcoming Match Data for Men's Team found"
    );
  }

  let liveMatchesWomen: any;
  if (isUpMatchesWomenExists > 0) {
    liveMatchesWomen = await redisClient.get(REDIS_KEY_UPCOMING_MATCHES_WOMEN);
    liveMatchesWomen = await JSON.parse(liveMatchesWomen);
  } else {
    logger.info(
      "[UPCOMING MATCH DATA:WOMEN]: No Upcoming Match Data for Women's Team found"
    );
  }

  if (liveMatchesMen !== undefined || liveMatchesWomen !== undefined) {
    const urlRealtimeMatch: string | CustomError = createDataApiUrl(
      FOOTBALL_MATCH_REALTIME_PATH
    );

    if (!(urlRealtimeMatch instanceof CustomError)) {
      const matches = await fetchData(urlRealtimeMatch);

      if (!(matches instanceof CustomError)) {
        for (let i = 0; i < matches.length; i++) {
          if (liveMatchesMen?.hasOwnProperty(matches[i].id)) {
            result.push({
              country_id: liveMatchesMen[matches[i].id].country_id,
              competition_id: liveMatchesMen[matches[i].id].competition_id,
              home_team_id: liveMatchesMen[matches[i].id].home_team_id,
              away_team_id: liveMatchesMen[matches[i].id].away_team_id,
              ...matches[i],
            });
          } else if (liveMatchesWomen?.hasOwnProperty(matches[i].id)) {
            result.push({
              country_id: liveMatchesWomen[matches[i].id].country_id,
              competition_id: liveMatchesWomen[matches[i].id].competition_id,
              home_team_id: liveMatchesWomen[matches[i].id].home_team_id,
              away_team_id: liveMatchesWomen[matches[i].id].away_team_id,
              ...matches[i],
            });
          }
        }
      } else {
        logger.error(
          "[ERROR LOADING REALTIME MATCH DATA]: thesports.com's API is not working to fetch realtime match data"
        );
      }
    } else {
      logger.error('[ERROR LOADING REALTIME MATCH DATA]: error in url');
    }
  } else {
    logger.info('[REALTIME MATCH DATA]: no live matches');
  }

  if (result.length > 0) {
    await redisClient.setEx(
      REDIS_KEY_REALTIME_MATCHES,
      REDIS_EXPIRATION_TIME_REALTIME_MATCHES,
      JSON.stringify(result)
    );
  }

  return result;
};

const getData = async (): Promise<any[]> => {
  let data: any;
  const isDataAlreadyExists = await redisClient.exists(
    REDIS_KEY_REALTIME_MATCHES
  );

  if (isDataAlreadyExists > 0) {
    data = await redisClient.get(REDIS_KEY_REALTIME_MATCHES);
    data = await JSON.parse(data);
  } else {
    data = await fetchRealtimeMatchData();
  }

  return data;
};

export const getRealtimeMatchDataByClubId = async (
  clubId: string
): Promise<any[]> => {
  const result: any[] = [];
  const data = await getData();

  if (data?.length !== undefined && data?.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].home_team_id === clubId || data[i].away_team_id === clubId) {
        result.push(data[i]);
      }
    }
  }

  return result;
};

export const getRealtimeMatchDataById = async (id: string): Promise<any> => {
  const data = await getData();

  if (data?.length !== undefined && data?.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        return data[i];
      }
    }
  }

  return {};
};

export const loadRealtimeMatchData = (): void => {
  setTimeout(() => {
    setInterval(() => {
      fetchRealtimeMatchData()
        .then(() => {
          logger.info(
            '[LOADED REALTIME MATCH DATA]: loaded realtime match data to redis'
          );
        })
        .catch(() => {
          logger.error(
            '[ERROR LOADING REALTIME MATCH DATA]: unable to load realtime match data to redis'
          );
        });
    }, FETCH_INTERVAL_REALTIME_MATCHES * 1000).unref();
  }, FIRST_FETCH_TIMEOUT_REALTIME_MATCH_DATA).unref();
};
