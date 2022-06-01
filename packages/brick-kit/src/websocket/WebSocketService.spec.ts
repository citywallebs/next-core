import WS from "jest-websocket-mock";
import { WebsocketMessageRequest } from "./WebsocketMessageRequest";
import { PluginWebSocketMessageEvent } from "./interfaces";
import { WebSocketService } from "./WebSocketService";
import { WebsocketMessageResponse } from "./WebsocketMessageResponse";

jest.useRealTimers();
jest.spyOn(console, "warn").mockImplementation(() => void 0);
jest.spyOn(console, "log").mockImplementation(() => void 0);

const mockOnClose = jest.fn();
describe("WebSocket Service", () => {
  let server: WS;
  let client: WebSocketService;
  const topic = {
    system: "pipeline",
    topic: "pipeline.task.running.001",
  };

  const req = new WebsocketMessageRequest(
    PluginWebSocketMessageEvent.SUB,
    topic
  );
  beforeEach(() => {
    server = new WS("ws://localhost:1234");
    client = new WebSocketService({
      url: "ws://localhost:1234",
      retryLimit: 5,
    });

    client.onClose = mockOnClose;
  });

  afterEach(() => {
    WS.clean();
    client.close();
  });

  it("should send message to server", async () => {
    await server.connected;

    client.send(req.data);

    await expect(server).toReceiveMessage(req.data);
  });

  it("should receive message form websocket server", async () => {
    client.onMessage = jest.fn();
    await server.connected;
    server.send(
      `{"event":"TOPIC.SUB_SUCCESS","sessionID":"9336039e-2ae7-4caa-93ea-f1fae213ee3f","payload":{"source":"","system":"pipeline","topic":"pipeline.task.running.001*"}}`
    );

    const call = (client.onMessage as jest.Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      data: '{"event":"TOPIC.SUB_SUCCESS","sessionID":"9336039e-2ae7-4caa-93ea-f1fae213ee3f","payload":{"source":"","system":"pipeline","topic":"pipeline.task.running.001*"}}',
      event: "TOPIC.SUB_SUCCESS",
      message: {
        event: "TOPIC.SUB_SUCCESS",
        payload: {
          source: "",
          system: "pipeline",
          topic: "pipeline.task.running.001*",
        },
        sessionID: "9336039e-2ae7-4caa-93ea-f1fae213ee3f",
      },
      topic: '{"system":"pipeline","topic":"pipeline.task.running.001*"}',
    });
    expect(call instanceof WebsocketMessageResponse).toBe(true);
  });

  it("should catch `createWebSocket` error and call onError", async () => {
    new WS("ws://localhost:456", { verifyClient: () => false });
    const options = {
      url: "ws://localhost:456",
      retryLimit: 5,
    };
    const handleError = jest.fn();
    let error;

    try {
      await new Promise((resolve, reject) => {
        handleError.mockImplementation(reject);
        const client2 = new WebSocketService(options);
        client2.onOpen = resolve;
        client2.onError = handleError;
      });
    } catch (e) {
      error = e;
    }

    expect(error.type).toBe("error");
    expect(handleError).toBeCalledWith(
      expect.objectContaining({ type: "error" }),
      {
        options: expect.objectContaining(options),
        retryCount: 0,
        state: "connecting",
        readyState: 3,
      }
    );
  });

  describe("WebSocket server get in trouble", () => {
    it("should call onClose function when webSocket server closed", async () => {
      server.on("connection", (socket) => {
        socket.close({ wasClean: false, code: 1003, reason: "NOPE" });
      });
      client.onReconnect = jest.fn();
      jest.useFakeTimers();

      await server.connected;

      jest.advanceTimersByTime(2000);
      expect(client.onReconnect).toHaveBeenCalledTimes(2);

      await server.connected;
      server.close({ wasClean: false, code: 1003, reason: "NOPE" });
      jest.advanceTimersByTime(63000);
      expect(client.onReconnect).toHaveBeenCalledTimes(6);
      expect(client.state).toBe("finished");
      expect(mockOnClose).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should resend message to server when websocket onopen", async () => {
      expect((client as any).messageQueue.size).toBe(0);
      client.send(req.data);

      expect((client as any).messageQueue.size).toBe(1);
      await server.connected;
      await expect(server).toReceiveMessage(req.data);

      server.send(
        `{"event":"TOPIC.SUB_SUCCESS","sessionID":"9336039e-2ae7-4caa-93ea-f1fae213ee3f","payload":{"source":"","system":"pipeline","topic":"pipeline.task.running.001"}}`
      );

      expect((client as any).messageQueue.size).toBe(0);
    });

    it("should reconnect to server when webSocket server get in trouble", async () => {
      server.on("connection", (socket) => {
        socket.close({ wasClean: false, code: 1003, reason: "NOPE" });
      });
      client.onReconnect = jest.fn();

      jest.useFakeTimers();

      await server.connected;

      jest.advanceTimersByTime(2000);
      expect(client.onReconnect).toHaveBeenCalled();
    });
  });
});
