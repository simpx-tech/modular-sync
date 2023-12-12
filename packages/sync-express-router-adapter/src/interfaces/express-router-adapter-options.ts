import {Express} from "express";

export interface ExpressRouterAdapterOptions {
  app: Express;
  basePath: string;
}