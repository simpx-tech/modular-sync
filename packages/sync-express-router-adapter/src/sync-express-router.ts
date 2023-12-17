import {RouterAdapter} from "@simpx/sync-core/src/server/interfaces/router-adapter";
import {Express, Request} from "express";
import {ExpressRouterAdapterOptions} from "./interfaces/express-router-adapter-options";
import {RouterCallback, RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import jwt from "jsonwebtoken"

export class ExpressRouterAdapter implements RouterAdapter {
  private readonly app: Express;
  private readonly path: string;

  constructor({ app, basePath }: ExpressRouterAdapterOptions) {
    this.app = app;
    this.path = basePath;
  }

  registerRoute(method: HttpMethod, route: string, callback: RouterCallback) {
    this.app[method](`/${this.path}/${route}`, async (req, res) => {
      try {
        const value = await callback(this.buildRouterRequest(req));
        res.status(200).send(value);
      } catch (err) {
        if () {

        }
        // TODO add custom exceptions with custom messages and code
        console.error(err)
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
      headers: req.headers,
      token: this.extractToken(req),
      decodedToken: this.decodeToken(this.extractToken(req)),
    }
  }

  private decodeToken(token: string) {
    try {
      return jwt.decode(token, { json: true });
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  private extractToken(req: Request) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return null;
    }
    const token = authHeader.split(" ")?.[1];
    return token ?? null;
  }
}