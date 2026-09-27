import WebSocket from "ws";

export const ROOMS = new Map<number, Set<WebSocket>>();
