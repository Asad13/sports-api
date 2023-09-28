import terminator from './terminator';

const setProcessEvents = (): void => {
  process.on('SIGINT', () => {
    terminator('SIGINT');
  });

  process.on('SIGTERM', () => {
    terminator('SIGTERM');
  });

  process.on('uncaughtException', () => {
    terminator('uncaughtException', true);
  });

  process.on('unhandledRejection', () => {
    terminator('unhandledRejection', true);
  });
};

export default setProcessEvents;
