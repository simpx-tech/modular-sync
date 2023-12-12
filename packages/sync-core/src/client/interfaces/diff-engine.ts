import {ClientDomain} from "../client-domain";

export interface DiffEngine {
  runSetup(domain: ClientDomain): Promise<void>;
  migrateSendAll(): Promise<void>;
  migrateFetchAll(): Promise<void>;
  sync(): Promise<void>;
}