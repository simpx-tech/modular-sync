import {Express} from "express";

export interface ExpressRouterAdapterOptions {
  app: Express;
  path: string;
}