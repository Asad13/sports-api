import CustomError, { ErrorCode, ErrorType } from '@utils/custom-error';
import { QueryTypes } from '@src/types/url';
import type { UrlOptions } from '@src/types/url';

interface SportsQuery {
  page?: number;
  uuid?: string;
}

export const createDataApiUrl = (
  path: string,
  query?: SportsQuery
): string | CustomError => {
  let url =
    process.env.THE_SPORTS_API_ENDPOINT ?? 'https://api.thesports.com/v1';
  url += path;

  if (
    process.env.THE_SPORTS_API_USER !== undefined &&
    process.env.THE_SPORTS_API_SECRET !== undefined
  ) {
    url += `?user=${process.env.THE_SPORTS_API_USER}&secret=${process.env.THE_SPORTS_API_SECRET}`;
  } else {
    const error = new CustomError(
      `[ERROR IN URL]: user as 'THE_SPORTS_API_USER' or secret as 'THE_SPORTS_API_SECRET' of api.thesports.com is not set as environment variables`,
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorType.SERVER
    );
    return error;
  }

  if (query !== undefined) {
    if (query?.page !== undefined) {
      url += `&page=${query.page}`;
    }

    if (query?.uuid !== undefined) {
      url += `&uuid=${query.uuid}`;
    }
  }

  return url;
};

export const createUrl = (urlOptions: UrlOptions): string | CustomError => {
  const { rootEndPoint, path, query } = urlOptions;
  let url = rootEndPoint;

  if (path !== undefined) url += path;

  if (query?.type === QueryTypes.NEWS) {
    if (process.env.NEWS_DATA_API_KEY !== undefined) {
      url += `?apikey=${process.env.NEWS_DATA_API_KEY}`;
    } else {
      const error = new CustomError(
        `[ERROR IN URL]: PUBLIC KEY of newsdata.io is not set as 'NEWS_DATA_API_KEY' as environment variables`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );
      return error;
    }

    if (query?.qInMeta !== undefined) {
      url += `&qInMeta=${encodeURIComponent(
        query.qInMeta.trim().toLowerCase()
      )}`;
    } else {
      const error = new CustomError(
        `[ERROR IN URL]: No specific keywords or phrases are present`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );
      return error;
    }

    if (query !== undefined) {
      if (query?.category !== undefined) {
        url += `&category=${query.category}`;
      } else {
        url += `&category=sports`;
      }

      if (query?.country !== undefined) {
        url += `&country=${query.country}`;
      } else {
        url += `&country=gb`;
      }

      if (query?.language !== undefined) {
        url += `&language=${query.language}`;
      } else {
        url += `&language=en`;
      }

      if (query?.image !== undefined) {
        url += `&image=${query.image}`;
      } else {
        url += `&image=1`;
      }

      if (query?.timeframe !== undefined) {
        url += `&timeframe=${query.timeframe}`;
      } else {
        url += `&timeframe=48`;
      }

      if (query?.page !== undefined) {
        url += `&page=${query.page}`;
      }
    }
  }

  return url;
};
