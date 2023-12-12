import {RouterAdapter} from "@simpx/sync-core/src/interfaces/router-adapter";
import {Express, Request} from "express";
import {ExpressRouterAdapterOptions} from "./interfaces/express-router-adapter-options";
import {RouterCallback, RouterRequest} from "@simpx/sync-core/src/interfaces/router-callback";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";

export class ExpressRouterAdapter implements RouterAdapter {
  private readonly app: Express;
  private readonly path: string;

  constructor({ app, path }: ExpressRouterAdapterOptions) {
    this.app = app;
    this.path = path;
  }

  registerRoute(method: HttpMethod, route: string, callback: RouterCallback) {
    this.app[method](`${this.path}/${route}`, async (req, res) => {
      try {
        const value = await callback(this.buildRouterRequest(req));
        res.status(200).send(value);
      } catch (e) {
        // TODO add custom errors with custom messages and code
        res.status(500).send({ error: "internal-server-error", code: 500 })
      }
    })
  }

  private buildRouterRequest(req: Request): RouterRequest {
    return {
      path: req.path,
      body: req.body,
      query: req.query,
      rawRequest: req,
    }
  }
}