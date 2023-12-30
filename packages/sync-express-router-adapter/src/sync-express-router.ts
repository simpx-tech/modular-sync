import {RouterAdapter} from "@simpx/sync-core/src/server/interfaces/router-adapter";
import express, {Express, Request, Response} from "express";
import {ExpressRouterAdapterOptions} from "./interfaces/express-router-adapter-options";
import {RouterCallback, RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import jwt from "jsonwebtoken"
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";

export class ExpressRouterAdapter implements RouterAdapter {
  private readonly app: Express;
  private readonly path: string;
  private readonly authEngine: AuthEngine;

  constructor({ app, basePath, authEngine }: ExpressRouterAdapterOptions) {
    this.app = app;
    this.path = basePath;
    this.authEngine = authEngine;
  }

  async runSetup() {
    this.app.use(express.json());
  }

  registerRoute(method: HttpMethod, route: string, callback: RouterCallback) {
    this.app[method](`/${this.path}/${route}`, async (req, res) => {
      try {
        const value = await callback(this.buildRouterRequest(req));
        res.status(200).send(value);
      } catch (err) {
        console.error(err)

        if (err.isHttpError) {
          return this.returnHttpError(res, err);
        }

        res.status(500).send({ error: "internal-server-error", code: 500 })
      }
    })
  }

  returnHttpError(res: Response, err: any) {
    res.status(err.errorStatus).send({ error: err.errorCode, code: err.errorStatus, message: err.message })
  }

  private buildRouterRequest(req: Request): RouterRequest {
    return {
      path: req.path,
      body: req.body,
      query: req.query,
      rawRequest: req,
      headers: req.headers,
      token: this.extractToken(req),
      decodedToken: this.authEngine.decodeToken(this.extractToken(req)),
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