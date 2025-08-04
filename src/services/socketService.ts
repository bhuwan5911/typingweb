import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxReconnectionAttempts = 5;

  connect(): Socket | null {
    try {
      if (!this.socket) {
        this.socket = io('http://localhost:3001', {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectionAttempts,
          reconnectionDelay: 1000,
          forceNew: true,
          autoConnect: true,
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.isConnected = true;
          this.connectionAttempts = 0;
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.connectionAttempts++;
          
          if (this.connectionAttempts >= this.maxReconnectionAttempts) {
            console.error('Max reconnection attempts reached. Please check if the server is running.');
          }
        });

        this.socket.on('reconnect', () => {
          console.log('Reconnected to server');
          this.isConnected = true;
          this.connectionAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
          this.isConnected = false;
        });
      }

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (error) {
        console.error('Error disconnecting socket:', error);
      }
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Safe method to remove event listeners
  removeListener(event: string, listener?: any): void {
    if (this.socket && typeof this.socket.off === 'function') {
      try {
        if (listener) {
          this.socket.off(event, listener);
        } else {
          this.socket.off(event);
        }
      } catch (error) {
        console.error(`Error removing listener for event ${event}:`, error);
      }
    }
  }

  // Safe method to add event listeners
  addListener(event: string, listener: any): void {
    if (this.socket && typeof this.socket.on === 'function') {
      try {
        this.socket.on(event, listener);
      } catch (error) {
        console.error(`Error adding listener for event ${event}:`, error);
      }
    }
  }
}

export default new SocketService();