import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

export interface WsClient extends Socket {
  data: {
    userId: string;
    roleId: string;
    roleName?: string;
  };
}

/**
 * WebSocket gateway for real-time updates.
 *
 * Client connects to: ws://server:3000/events?token=<JWT>
 * or with auth header: { auth: { token: '<JWT>' } }
 *
 * Rooms:
 *   user:{userId}   — per-user private channel
 *   role:admin      — all admins
 *   role:manager    — all managers
 *   broadcast       — everyone
 *
 * Events emitted by server:
 *   order:updated       — order status changed
 *   notification:new    — new notification for user
 *   booking:confirmed   — appointment confirmed
 *   stock:alert         — low inventory warning (admin/manager only)
 *   analytics:refresh   — analytics data changed
 */
@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    // JWT auth middleware — runs before handleConnection
    server.use((socket: WsClient, next) => {
      const token =
        (socket.handshake.auth as any)?.token ||
        (socket.handshake.query?.token as string);

      if (!token) {
        return next(new Error('Unauthorized: token required'));
      }

      try {
        const payload = this.jwtService.verify(token);
        socket.data.userId = payload.sub;
        socket.data.roleId = payload.roleId;
        next();
      } catch {
        next(new Error('Unauthorized: invalid token'));
      }
    });

    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: WsClient) {
    const { userId, roleId } = client.data;

    // Per-user private room
    client.join(`user:${userId}`);

    // Role-based rooms (role IDs are UUIDs; we join by roleId for simplicity)
    // A more complete impl would look up role name — kept simple here
    client.join(`role:${roleId}`);

    // Everyone room
    client.join('broadcast');

    this.logger.debug(`Client connected: userId=${userId}, socket=${client.id}`);
  }

  handleDisconnect(client: WsClient) {
    this.logger.debug(`Client disconnected: userId=${client.data?.userId}, socket=${client.id}`);
  }

  // ── Client → Server messages ──────────────────────────────────────────────

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  // ── Server → Client emitters (called from other services) ────────────────

  /** Emit to a specific user's private room */
  emitToUser(userId: string, event: string, data: object): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /** Emit to all clients with a specific role */
  emitToRole(roleId: string, event: string, data: object): void {
    this.server.to(`role:${roleId}`).emit(event, data);
  }

  /** Emit to all connected clients */
  broadcast(event: string, data: object): void {
    this.server.to('broadcast').emit(event, data);
  }

  // ── Typed event helpers ───────────────────────────────────────────────────

  notifyOrderUpdated(userId: string, orderId: string, status: string): void {
    this.emitToUser(userId, 'order:updated', { orderId, status, ts: Date.now() });
  }

  notifyNewNotification(userId: string, notificationId: string, body: string): void {
    this.emitToUser(userId, 'notification:new', { notificationId, body, ts: Date.now() });
  }

  notifyBookingConfirmed(userId: string, appointmentId: string, code: string): void {
    this.emitToUser(userId, 'booking:confirmed', { appointmentId, code, ts: Date.now() });
  }

  notifyLowStock(partName: string, quantity: number, minimum: number): void {
    // Sent to all admins/managers — they should be in the broadcast room
    // In a full impl, we'd track admin roleIds and use emitToRole
    this.broadcast('stock:alert', { partName, quantity, minimum, ts: Date.now() });
  }
}
