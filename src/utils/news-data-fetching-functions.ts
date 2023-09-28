import { createUrl, createDataApiUrl } from '@src/utils/create-urls';
import redisClient from '@databases/redis';
import { fetchData, fetchData2 } from '@src/utils/fetch';
import CustomError from '@utils/custom-error';
import logger from './logger';
import { QueryTypes } from '@src/types/url';
import type { NewsQuery, UrlOptions } from '@src/types/url';
import { FOOTBALL_TEAM_PATH } from '@src/configs/url-paths';
import {
  REDIS_KEY_TEAM_HASH_MEN,
  REDIS_KEY_TEAM_HASH_WOMEN,
} from '@configs/constants';

export const getTeam = async (clubId: string): Promise<any> => {
  const isExistInMenTeam = await redisClient.hExists(
    REDIS_KEY_TEAM_HASH_MEN,
    clubId
  );
  const isExistInWomenTeam = await redisClient.hExists(
    REDIS_KEY_TEAM_HASH_WOMEN,
    clubId
  );

  let team: any;

  if (isExistInMenTeam) {
    team = await redisClient.hGet(REDIS_KEY_TEAM_HASH_MEN, clubId);
    team = await JSON.parse(team);
  } else if (isExistInWomenTeam) {
    team = await redisClient.hGet(REDIS_KEY_TEAM_HASH_WOMEN, clubId);
    team = await JSON.parse(team);
  } else {
    // Fetch Team Info
    const urlTeam: string | CustomError = createDataApiUrl(FOOTBALL_TEAM_PATH, {
      uuid: clubId,
    });

    if (!(urlTeam instanceof CustomError)) {
      team = await fetchData(urlTeam);

      if (team instanceof CustomError) {
        return team;
      }
    } else {
      return urlTeam;
    }
  }

  return team;
};

/* Fetch Country Data */
export const fetchNewsData = async (
  qInMeta: string,
  timeframe?: number
): Promise<any[]> => {
  const data: any[] = [];

  const rootEndPoint =
    process.env.NEWS_DATA_API_LATEST_NEWS_ENDPOINT ??
    'https://newsdata.io/api/1/news';

  const query: NewsQuery = {
    type: QueryTypes.NEWS,
    qInMeta,
  };

  if (timeframe !== undefined) query.timeframe = timeframe;

  do {
    const urlOptions: UrlOptions = {
      rootEndPoint,
      query,
    };

    const url = createUrl(urlOptions);

    if (url instanceof CustomError) {
      break;
    }

    const newsData = await fetchData2(url);

    if (newsData?.status === 'error') {
      logger.error(`[NEWSDATA ERROR]: ${newsData?.results?.message as string}`);
      break;
    }

    if (newsData instanceof CustomError || newsData instanceof Error) {
      break;
    }

    if (newsData?.results !== undefined && newsData?.results?.length > 0) {
      for (let i = 0; i < newsData.results.length; i++) {
        const isGood =
          newsData.results[i].title != null &&
          newsData.results[i].title !== undefined &&
          newsData.results[i].description != null &&
          newsData.results[i].description !== undefined &&
          newsData.results[i].link != null &&
          newsData.results[i].link !== undefined &&
          newsData.results[i].pubDate != null &&
          newsData.results[i].pubDate !== undefined;

        if (isGood) {
          data.push({
            id: newsData.results[i].article_id,
            title: newsData.results[i].title,
            image: newsData.results[i].image_url,
            summary: newsData.results[i].description,
            url: newsData.results[i].link,
            pubDate: newsData.results[i].pubDate,
          });
        }
      }
    } else {
      break;
    }

    if (query?.page !== undefined) {
      delete query?.page;
    }

    if (newsData?.nextPage !== undefined && newsData?.nextPage != null) {
      query.page = newsData.nextPage;
    } else {
      break;
    }
  } while (query?.page !== undefined);

  return data;
};
