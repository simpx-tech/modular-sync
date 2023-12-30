import {RouterAdapter} from "../../src/server/interfaces/router-adapter";
import {HttpMethod} from "../../src/interfaces/http-method";
import {RouterCallback} from "../../src/server/interfaces/router-callback";
import express from "express"

export class MockRouterAdapter implements RouterAdapter {
  app: express.Express;

  constructor() {
    this.app = express();
  }

  runSetup(): Promise<void> {
    return Promise.resolve();
  }

  registerRoute(method: HttpMethod, route: string, callback: RouterCallback): void {
    this.app[method](route, (req, res) => callback({
      query: req.query,
      body: req.body,
      path: req.path,
      rawRequest: req,
      headers: req.headers,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.u_6R_yfWovEXM9TcX0OiJEx8txeOxv0S63QFLOE84f4", // abacadabra
      decodedToken: { id: 1 },
    }));
  }
}