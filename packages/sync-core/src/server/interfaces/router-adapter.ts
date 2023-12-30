import {RouterCallback} from "./router-callback";
import {HttpMethod} from "../../interfaces/http-method";

export interface RouterAdapter {
  runSetup(): Promise<void>;
  // TODO: Add if is private route
  registerRoute(method: HttpMethod, route: string, callback: RouterCallback): void;
}