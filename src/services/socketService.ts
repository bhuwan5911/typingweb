import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxReconnectionAttempts = 5;
  private listeners: Map<string, any[]> = new Map();
  private fallbackMode = false;

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
          this.fallbackMode = false;
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
            console.error('Max reconnection attempts reached. Switching to fallback mode.');
            this.fallbackMode = true;
          }
        });

        this.socket.on('reconnect', () => {
          console.log('Reconnected to server');
          this.isConnected = true;
          this.connectionAttempts = 0;
          this.fallbackMode = false;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
          this.isConnected = false;
        });
      }

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      this.fallbackMode = true;
      return null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      try {
        // Remove all listeners before disconnecting
        this.listeners.forEach((listeners, event) => {
          listeners.forEach(listener => {
            this.socket?.off(event, listener);
          });
        });
        this.listeners.clear();
        
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

  isInFallbackMode(): boolean {
    return this.fallbackMode;
  }

  // Safe method to remove event listeners
  removeListener(event: string, listener?: any): void {
    if (this.socket && typeof this.socket.off === 'function') {
      try {
        if (listener) {
          this.socket.off(event, listener);
          // Remove from our tracking
          const listeners = this.listeners.get(event) || [];
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
            if (listeners.length === 0) {
              this.listeners.delete(event);
            }
          }
        } else {
          this.socket.off(event);
          this.listeners.delete(event);
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
        // Track the listener
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(listener);
      } catch (error) {
        console.error(`Error adding listener for event ${event}:`, error);
      }
    }
  }

  // Method to emit events safely
  emit(event: string, data?: any): void {
    if (this.socket && typeof this.socket.emit === 'function' && this.isSocketConnected()) {
      try {
        this.socket.emit(event, data);
      } catch (error) {
        console.error(`Error emitting event ${event}:`, error);
      }
    } else {
      console.warn(`Cannot emit event ${event}: socket not connected`);
    }
  }

  // Method to check server health
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/health');
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}

export default new SocketService();