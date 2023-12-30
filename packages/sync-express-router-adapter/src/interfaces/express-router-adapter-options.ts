import {Express} from "express";
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";

export interface ExpressRouterAdapterOptions {
  app: Express;
  basePath: string;
  authEngine: AuthEngine;
}