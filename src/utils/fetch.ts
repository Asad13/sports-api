import axios from 'axios';
import CustomError, { ErrorCode, ErrorType } from '@utils/custom-error';
import logger from './logger';

export const fetchData = async (url: string): Promise<any[] | CustomError> => {
  try {
    const response = await axios.get(url);

    if (response?.data === undefined) {
      const error = new CustomError(
        `[ERROR FETCHING DATA]: thesports.com's API is not working for this request`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );

      throw error as ICustomError;
    }

    if (response?.data?.results !== undefined) {
      return response.data.results;
    } else {
      const error = new CustomError(
        `[ERROR FETCHING DATA]: thesports.com's API is not working for this request`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );

      throw error as ICustomError;
    }
  } catch (error: any) {
    // logger.error(error);

    if (!(error instanceof CustomError)) {
      const error = new CustomError(
        `[ERROR FETCHING DATA]: thesports.com's API is not working for this request`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );

      return error;
    }
    return error;
  }
};

// General Fetch Function
export const fetchData2 = async (url: string): Promise<any | CustomError> => {
  try {
    const response = await axios.get(url);

    if (response?.data !== undefined) {
      return response.data;
    } else {
      const error = new CustomError(
        `[ERROR FETCHING DATA]: API is not working for this request`,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorType.SERVER
      );
      throw error as ICustomError;
    }
  } catch (error: any) {
    logger.error(`[NEWSDATA ERROR]: ${error?.message as string}`);
    return error;
  }
};
