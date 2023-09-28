import * as fs from 'fs';
import {
  LOG_FILE_DELETE_CHECK_INTERVAL,
  LOG_FILE_MAXIMUM_SIZE,
  MAXIMUM_ERROR_COUNT,
} from '@src/configs/constants';

let numberOfErrors = 0;

const retryDeleteLogFiles = (): void => {
  numberOfErrors++;

  if (numberOfErrors < MAXIMUM_ERROR_COUNT) {
    setTimeout(() => {
      autoDeleteLogFiles();
    }, 600000).unref(); // After 10 minutes
  } else {
    numberOfErrors = 0;
    setTimeout(() => {
      autoDeleteLogFiles();
    }, 604800000).unref(); // After 7 days
  }
};

export const autoDeleteLogFiles = (): void => {
  const logDir = `${process.cwd()}/logs`;

  if (typeof logDir === 'string') {
    fs.readdir(logDir, (err, files: string[]) => {
      if (err != null) {
        console.log('error reading log directory');
        retryDeleteLogFiles();
      } else if (files.length > 0) {
        /* Regularly deleting log files */
        for (let i = 0; i < files.length; i++) {
          setInterval(() => {
            const filePath = `${logDir}/${files[i]}`;
            const isFileExist = fs.existsSync(filePath);

            if (isFileExist) {
              const stats = fs.statSync(filePath);

              if (stats.size > LOG_FILE_MAXIMUM_SIZE) {
                fs.writeFile(filePath, '', (err) => {
                  if (err != null) {
                    console.log(`emptying ${files[i]} file unsuccessful.`);
                  }

                  console.log(`emptied ${files[i]} file successfully.`);
                });
              }
            }
          }, LOG_FILE_DELETE_CHECK_INTERVAL).unref();
        }

        if (files.length !== 2) retryDeleteLogFiles();
      } else {
        console.log('No Log Files');
        retryDeleteLogFiles();
      }
    });
  } else {
    retryDeleteLogFiles();
  }
};
