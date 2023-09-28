/* eslint-disable import/first */
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '@databases/postgres/data-source';
import app from './app';
import redisClient from '@databases/redis';
import setProcessEvents from '@utils/process-events';
import { loadData } from '@utils/data-fetching-functions';
import {
  loadRealtimeMatchData,
  getRealtimeMatchDataByClubId,
  getRealtimeMatchDataById,
} from '@utils/realtime-data-fetching-functions';
import { autoDeleteLogFiles } from '@utils/delete-log-files';
import config from '@configs/config';
import logger from '@utils/logger';
import { Server as SocketServer } from 'socket.io';
import { createServer, type Server } from 'http';
import {
  EVENT_REALTIME_MATCH_DATA_BY_CLUB,
  EVENT_REALTIME_MATCH_DATA_BY_ID,
} from '@configs/constants';

const init = async (): Promise<void> => {
  await redisClient.connect();
  await AppDataSource.initialize();
  logger.info('[POSTGRES CONNECTION]: Connected to Postgres Database...');
};

let server: Server;

init()
  .then(() => {
    logger.info('Connected to all the resources...');

    /* Creating HTTP Server */
    server = createServer(app);

    /* Creating Socket Server */
    const io = new SocketServer(server, {
      cors: {
        origin: '*',
      },
    });
    config.socketIO = io;
    logger.info(`Connected to Socket Server...`);

    io.on('connection', async (socket) => {
      socket.on(EVENT_REALTIME_MATCH_DATA_BY_CLUB, async (clubId, cb) => {
        if (typeof clubId === 'string') {
          const matches = await getRealtimeMatchDataByClubId(clubId);
          // eslint-disable-next-line n/no-callback-literal
          cb(matches);
        } else {
          // eslint-disable-next-line n/no-callback-literal
          cb('Club ID must be string');
        }
      });

      socket.on(EVENT_REALTIME_MATCH_DATA_BY_ID, async (id, cb) => {
        if (typeof id === 'string') {
          const match = await getRealtimeMatchDataById(id);
          // eslint-disable-next-line n/no-callback-literal
          cb(match);
        } else {
          // eslint-disable-next-line n/no-callback-literal
          cb('Match ID must be string');
        }
      });
    });

    const PORT = process.env.PORT ?? 3000;
    server.listen(PORT, (): void => {
      logger.info(`server listening on port ${PORT}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`visit ${process.env.URL ?? 'http://localhost:3000'}/docs`);
      } else {
        console.log(`server url ${process.env.URL ?? 'http://[External IP]'}`);
      }

      if (
        (process.env.NODE_ENV === 'production' ||
          process.env.NODE_ENV === 'staging') &&
        process.send != null
      ) {
        process.send('ready'); // Sending the ready signal to PM2
      }
    });

    server.on('error', (error: Error) => {
      logger.error(error.message);
    });

    config.server = server;
    setProcessEvents(); // set process events
    loadData(); // Loading all API data to Redis at Startup
    loadRealtimeMatchData(); // Loading Realtime Match Data
    autoDeleteLogFiles(); // Deleting Log files if the file sizes crosses 10mb
  })
  .catch(() => {
    if (!AppDataSource.isInitialized) {
      logger.error(
        `[POSTGRES CONNECTION ERROR]: Unable to connect with Postgres Database...`
      );
    }
    logger.error(`[RESOURCE CONNECTION ERROR]: shuting down...`);
    process.exit(1);
  });
