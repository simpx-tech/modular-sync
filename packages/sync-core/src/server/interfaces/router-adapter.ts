import {RouterCallback} from "./router-callback";
import {HttpMethod} from "../../interfaces/http-method";

export interface RouterAdapter {
  registerRoute(method: HttpMethod, route: string, callback: RouterCallback): void;
}