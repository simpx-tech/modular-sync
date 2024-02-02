import {RouterCallback} from "./router-callback";
import {HttpMethod} from "../../interfaces/http-method";
import Joi from "joi"

export interface RouterAdapter {
  runSetup(): Promise<void>;
  registerRoute(method: HttpMethod, route: string, callback: RouterCallback, options?: RegisterRouteOptions): void;

  /**
   * Route prefix for all routes, example: if `path` is "`sync`" then all
   * routes will be prefixed with `/sync/...`
   */
  path: string;
}

export interface RegisterRouteOptions {
  isPrivate?: boolean;
  /**
   * Apply Joi validation and transforms for the body
   */
  bodyJoiSchema?: Joi.ObjectSchema;

  /**
   * Apply Joi validation and transforms for the query
   */
  queryJoiSchema?: Joi.ObjectSchema;
}