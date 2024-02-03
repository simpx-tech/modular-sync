import {DatabaseMerger} from "../sync-database-merger";
import {IdIdentity} from "./id-identity";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {EntityModification, PushOperation} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export interface PushStrategy {
  runSetup: (merger: DatabaseMerger) => void;
  handle(identity: IdIdentity, repository: RepositoryBase<any, any, any, any>, operation: EntityModification, pushOp: PushOperation): Promise<void>;
}