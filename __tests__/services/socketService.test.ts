import { io } from 'socket.io-client';
import socketService from '../../src/services/socketService';
import { appConfig } from '../../src/config/appConfig';

const mockSocket = {
  connected: false,
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  off: jest.fn(),
  removeAllListeners: jest.fn(),
  id: 'socket-1',
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

describe('socketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (io as jest.Mock).mockReturnValue(mockSocket);
    socketService.disconnect();
  });

  it('connects and sets up listeners', async () => {
    socketService.connect('ws://localhost', 'token');

    expect(io).toHaveBeenCalledWith('ws://localhost', expect.objectContaining({
      auth: { token: 'token' },
      reconnection: true,
    }));
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  it('does not reconnect if already connected', () => {
    socketService.connect('ws://localhost', 'token');
    mockSocket.connected = true;

    socketService.connect('ws://localhost', 'token');

    expect(io).toHaveBeenCalledTimes(1);
    mockSocket.connected = false;
  });

  it('emits events when connected', async () => {
    socketService.connect('ws://localhost', 'token');

    const callback = jest.fn();
    socketService.emit('event', { a: 1 }, callback);

    expect(mockSocket.emit).toHaveBeenCalledWith('event', { a: 1 }, callback);
  });

  it('emits events without callback when not provided', () => {
    socketService.connect('ws://localhost', 'token');

    socketService.emit('event', { a: 2 });

    expect(mockSocket.emit).toHaveBeenCalledWith('event', { a: 2 });
  });

  it('warns when emitting without socket', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    socketService.disconnect();
    socketService.emit('event');

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('registers listeners only when socket exists', () => {
    const handler = jest.fn();

    socketService.on('event', handler);
    expect(mockSocket.on).not.toHaveBeenCalled();

    socketService.connect('ws://localhost', 'token');
    socketService.on('event', handler);
    expect(mockSocket.on).toHaveBeenCalledWith('event', handler);
  });

  it('removes listeners correctly', async () => {
    socketService.connect('ws://localhost', 'token');

    const handler = jest.fn();
    socketService.removeListener('event', handler);
    socketService.removeListener('event');

    expect(mockSocket.off).toHaveBeenCalledWith('event', handler);
    expect(mockSocket.removeAllListeners).toHaveBeenCalledWith('event');
  });

  it('ignores removeListener when socket is not initialized', () => {
    socketService.disconnect();
    socketService.removeListener('event');
    expect(mockSocket.removeAllListeners).not.toHaveBeenCalled();
  });

  it('logs connection lifecycle events', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    socketService.connect('ws://localhost', 'token');

    const connectHandler = mockSocket.on.mock.calls.find(([event]) => event === 'connect')?.[1];
    const disconnectHandler = mockSocket.on.mock.calls.find(([event]) => event === 'disconnect')?.[1];
    const errorHandler = mockSocket.on.mock.calls.find(([event]) => event === 'connect_error')?.[1];

    connectHandler?.();
    disconnectHandler?.('server disconnect');
    errorHandler?.({ message: 'boom' });

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('wraps chat helpers', async () => {
    socketService.connect('ws://localhost', 'token');

    socketService.joinChat('req-1');
    socketService.leaveChat('req-1');
    socketService.sendMessage('req-1', 'hello');
    socketService.markAsRead('req-1');
    socketService.typing('req-1');
    socketService.createNewGroup('product');

    expect(mockSocket.emit).toHaveBeenCalledWith('chat:join', { request_id: 'req-1' }, expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:leave', { request_id: 'req-1' });
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:send', { request_id: 'req-1', message: 'hello', type: 'text' }, expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:read', { request_id: 'req-1' });
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:typing', { request_id: 'req-1' });
    expect(mockSocket.emit).toHaveBeenCalledWith('chat:create_group', { title: 'product' });
  });

  it('handles join and send callbacks with error logging', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    socketService.connect('ws://localhost', 'token');

    socketService.joinChat('req-2');
    socketService.sendMessage('req-2', 'hello');

    const joinCallback = mockSocket.emit.mock.calls.find(([event]) => event === 'chat:join')?.[2];
    const sendCallback = mockSocket.emit.mock.calls.find(([event]) => event === 'chat:send')?.[2];

    joinCallback?.({ success: false, message: 'join failed' });
    sendCallback?.({ success: false, message: 'send failed' });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('uses BaseUrl from app config', () => {
    const { BaseUrl } = require('../../src/services/socketService');
    expect(BaseUrl).toBe(appConfig.apiBaseUrl);
  });

  it('returns connection status', async () => {
    socketService.disconnect();
    expect(socketService.isConnected()).toBe(false);

    mockSocket.connected = true;
    socketService.connect('ws://localhost', 'token');
    expect(socketService.isConnected()).toBe(true);
    mockSocket.connected = false;
  });
});
