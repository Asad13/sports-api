import type { Request, Response, NextFunction } from 'express';
import { saveNews, getAllNews } from '@src/services/v1/news.service';
import redisClient from '@databases/redis';
import CustomError from '@utils/custom-error';
import logger from '@src/utils/logger';
import {
  getTeam,
  fetchNewsData,
} from '@src/utils/news-data-fetching-functions';
import { REDIS_KEY_NEWS_HASH } from '@src/configs/constants';
import type { TGetClubNewsInput } from '@src/schemas/v1/news.schema';

const getData = async (
  clubId: string,
  from: string | undefined,
  to: string | undefined
): Promise<any> => {
  let name;
  let timeframe;

  const isDataAlreadyExists = await redisClient.hExists(
    REDIS_KEY_NEWS_HASH,
    clubId
  );

  if (isDataAlreadyExists) {
    let redisData: any = await redisClient.hGet(REDIS_KEY_NEWS_HASH, clubId);
    redisData = await JSON.parse(redisData as string);

    name = redisData?.name;
    if (
      redisData?.lastFetched !== undefined &&
      typeof redisData?.lastFetched === 'number'
    ) {
      timeframe = Math.ceil(
        (Date.now() - redisData.lastFetched) / (3600 * 1000)
      );
    }
  }

  if (name === undefined) {
    const team: any = await getTeam(clubId);

    if (team instanceof CustomError) {
      return team;
    }

    name = team?.name;
  }

  let fetchedNews: any[];

  if (timeframe !== undefined && timeframe >= 1 && timeframe < 48) {
    fetchedNews = await fetchNewsData(name, timeframe);
  } else {
    fetchedNews = await fetchNewsData(name);
  }

  if (fetchedNews !== undefined && fetchedNews.length > 0) {
    // save in database
    await saveNews(fetchedNews, clubId);
    logger.info('Saved news in database');
  }

  // get news from database
  if (from === undefined) from = '1970-01-01T00:00:00.000Z';
  if (to === undefined) to = new Date().toISOString();
  const data = await getAllNews(clubId, from, to);

  await redisClient.hSet(
    REDIS_KEY_NEWS_HASH,
    clubId,
    JSON.stringify({
      name,
      lastFetched: Date.now(),
    })
  );

  return {
    name,
    data,
  };
};

export const getNewsHandler = async (
  req: Request<Record<string, unknown>, any, any, TGetClubNewsInput['query']>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { clubId, from, to } = req.query;

  try {
    const returnedData: any | CustomError = await getData(clubId, from, to);

    if (returnedData instanceof CustomError) {
      throw returnedData as ICustomError;
    }

    const { name, data } = returnedData;

    res.status(200).json({
      status: true,
      message: `News of ${(name as string) ?? clubId}`,
      total:
        data != null && data !== undefined ? data?.articles?.length ?? 0 : 0,
      data,
    });
  } catch (error: any) {
    logger.error(error?.message);
    res.status(200).json({
      status: true,
      message: `News of ${clubId}`,
      total: 0,
      data: null,
    });
  }
};
