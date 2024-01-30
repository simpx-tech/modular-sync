import {PushOperation} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {MergeOperationIdentity} from "../interfaces/merge-operation-identity";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";

export class CreateStrategy {
  syncEngine: ServerSyncEngine;

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;
  }

  async handle(identity: MergeOperationIdentity, repository: RepositoryBase) {
    // if (!createOperation.fields[0]) {
    //   throw new InternalServerErrorException("fields[0] seems to be empty, at least one field is required for a create operation");
    // }
    //
    // const { __uuid, ...creationFields } = createOperation.fields[0];
    //
    // const hasDeleted = entityOperations.find((op) => op.operation === "delete");
    //
    // const latestUpdatedFields = this.processUpdates(creationFields, entityOperations);
    //
    // await repository.upsert({ __creationUUID: __uuid }, {
    //   ...creationFields,
    //   repository: identity.repositoryId,
    //   domain: identity.domainId,
    //   createdAt: createOperation.createdAt,
    //   submittedAt: createOperation.submittedAt,
    //   updatedAt: createOperation.updatedAt,
    //   deletedAt: createOperation.deletedAt,
    //   wasDeleted: hasDeleted ?? false,
    // });
    //
    // // TODO before processing/saving the latest version, aggregate the create + update + delete operations
    // const createDynamicFields = createOperation.dynamicFields.create;
    // const updateDynamicFields = createOperation.dynamicFields.update;
    // const deleteDynamicFields = createOperation.dynamicFields.delete;



    // const modificationsRepo = this.syncEngine.
  }
}