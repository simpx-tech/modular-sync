import {RegisterRouteOptions, RouterAdapter} from "@simpx/sync-core/src/server/interfaces/router-adapter";
import express, {Express, Request, Response} from "express";
import {ExpressRouterAdapterOptions} from "./interfaces/express-router-adapter-options";
import {RouterCallback, RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";
import {UnauthorizedException} from "@simpx/sync-core/src/server/exceptions/unauthorized-exception";
import {ForbiddenException} from "@simpx/sync-core/src/server/exceptions/forbidden-exception";
import {UnprocessableEntityException} from "@simpx/sync-core/src/server/exceptions/unprocessable-entity-exception";

export class ExpressRouterAdapter implements RouterAdapter {
  private readonly app: Express;
  private readonly authEngine: AuthEngine;

  readonly path: string;

  constructor({ app, basePath, authEngine }: ExpressRouterAdapterOptions) {
    this.app = app;
    this.path = basePath;
    this.authEngine = authEngine;
  }

  async runSetup() {
    this.app.use(express.json());
  }

  registerRoute(method: HttpMethod, route: string, callback: RouterCallback, options: RegisterRouteOptions = {}) {
    this.app[method](`/${this.path}/${route}`, async (req, res) => {
      try {
        if (options.isPrivate) {
          const token = this.extractToken(req);
          if (!token) {
            throw new UnauthorizedException("No token provided");
          }

          if(!await this.authEngine.isAuthenticated(token)) {
            throw new ForbiddenException("Invalid token or user has no sync activated");
          };
        }

        const routerRequest: RouterRequest = this.buildRouterRequest(req);

        if (options.bodyJoiSchema) {
          const { error, value } = options.bodyJoiSchema.validate(routerRequest.body);
          if (error) {
            throw new UnprocessableEntityException(error.message);
          }

          routerRequest.body = value;
        }

        if (options.queryJoiSchema) {
          const { error, value } = options.queryJoiSchema.validate(routerRequest.query);
          if (error) {
            throw new UnprocessableEntityException(error.message);
          }

          routerRequest.query = value;
        }

        const value = await callback(routerRequest);
        res.status(200).send(value);
      } catch (err) {
        console.error(err?.stack ?? err)

        if (err.isHttpError) {
          return this.returnHttpError(res, err);
        }

        res.status(500).send({ error: "internal-server-error", code: 500 })
      }
    })
  }

  returnHttpError(res: Response, err: any) {
    res.status(err.errorStatus).send({ error: err.errorCode, code: err.errorStatus, message: err.errorCode === 500 ? "Internal Server Error" : err.message })
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