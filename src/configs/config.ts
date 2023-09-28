import type { Server } from 'http';
import type { Server as SocketServer } from 'socket.io';

class Config {
  private _server: Server | undefined;
  private _socketIO: SocketServer | undefined;

  get server(): Server | undefined {
    return this._server;
  }

  set server(s: Server | undefined) {
    this._server = s;
  }

  get socketIO(): SocketServer | undefined {
    return this._socketIO;
  }

  set socketIO(s: SocketServer | undefined) {
    this._socketIO = s;
  }
}

const config = new Config();

export default config;
