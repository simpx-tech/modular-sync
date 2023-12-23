import {RouterAdapter} from "../../src/server/interfaces/router-adapter";
import {HttpMethod} from "../../src/interfaces/http-method";
import {RouterCallback} from "../../src/server/interfaces/router-callback";

export class MockRouterEngine implements RouterAdapter {
  registerRoute(method: HttpMethod, route: string, callback: RouterCallback): void {
  }
}