import http from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "./utils/jwt";
import User from "./models/user.model";
import Notification, { NotificationType } from "./models/notification.model";

export type ActivityType = "ORDER_NEW" | "REVIEW_NEW" | "REVIEW_COMMENT_NEW" | "PRODUCT_NEW" | "COUPON_NEW";

export interface ActivityPayload {
  eventId: string;
  type: ActivityType;
  title: string;
  message: string;
  createdAt: string; // ISO
  meta?: Record<string, any>;
}

let io: Server | null = null;

type SocketAuthData = {
  userId?: number;
  role?: "USER" | "ADMIN";
};

const readTokenFromHandshake = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) return authToken.trim();

  const authHeader = socket.handshake.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.trim()) return null;
  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7).trim();
  return token || null;
};

export const initSocket = (httpServer: http.Server): void => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: Socket, next) => {
    try {
      const token = readTokenFromHandshake(socket);
      if (!token) return next(new Error("Unauthorized"));

      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.userId);
      if (!user) return next(new Error("Unauthorized"));

      (socket.data as SocketAuthData).userId = decoded.userId;
      (socket.data as SocketAuthData).role = user.role;
      next();
    } catch (_err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const { userId, role } = socket.data as SocketAuthData;
    if (!userId || !role) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
    socket.join("allAuth");
    socket.join(`role:${role}`);
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(httpServer) first.");
  }
  return io;
};

export const emitActivityToUser = (userId: number, payload: ActivityPayload): void => {
  void (async () => {
    try {
      await Notification.findOrCreate({
        where: { userId, eventId: payload.eventId },
        defaults: {
          userId,
          eventId: payload.eventId,
          type: payload.type as NotificationType,
          title: payload.title,
          message: payload.message,
          meta: payload.meta ? JSON.stringify(payload.meta) : null,
        },
      });
    } catch (err) {
      // Persist failing should not break real-time delivery
      console.error("[socket] persist notification (user) error:", err);
    } finally {
      getIo().to(`user:${userId}`).emit("activity", payload);
    }
  })();
};

export const emitActivityToRole = (role: "USER" | "ADMIN", payload: ActivityPayload): void => {
  void (async () => {
    try {
      const users = await User.findAll({ where: { role } });
      await Promise.all(
        users.map((u) =>
          Notification.findOrCreate({
            where: { userId: u.id, eventId: payload.eventId },
            defaults: {
              userId: u.id,
              eventId: payload.eventId,
              type: payload.type as NotificationType,
              title: payload.title,
              message: payload.message,
              meta: payload.meta ? JSON.stringify(payload.meta) : null,
            },
          }),
        ),
      );
    } catch (err) {
      console.error("[socket] persist notification (role) error:", err);
    } finally {
      getIo().to(`role:${role}`).emit("activity", payload);
    }
  })();
};

export const emitActivityToAllAuth = (payload: ActivityPayload): void => {
  void (async () => {
    try {
      const users = await User.findAll();
      await Promise.all(
        users.map((u) =>
          Notification.findOrCreate({
            where: { userId: u.id, eventId: payload.eventId },
            defaults: {
              userId: u.id,
              eventId: payload.eventId,
              type: payload.type as NotificationType,
              title: payload.title,
              message: payload.message,
              meta: payload.meta ? JSON.stringify(payload.meta) : null,
            },
          }),
        ),
      );
    } catch (err) {
      console.error("[socket] persist notification (allAuth) error:", err);
    } finally {
      getIo().to("allAuth").emit("activity", payload);
    }
  })();
};
