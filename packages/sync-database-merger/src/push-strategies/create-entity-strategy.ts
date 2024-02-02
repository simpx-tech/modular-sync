import {EntityModification, PushOperation} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {IdIdentity} from "../interfaces/id-identity";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {DatabaseMerger} from "../sync-database-merger";

export class CreateEntityStrategy {
  merger: DatabaseMerger;

  async runSetup(merger: DatabaseMerger) {
    this.merger = merger;
  }

  async handle(identity: IdIdentity, repository: RepositoryBase<any, any, any, any>, createOperation: EntityModification, pushOp: PushOperation) {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      uuid: createOperation.uuid,
    });

    if (modificationInDb) {
      return;
    }

    const entity = await repository.upsert({ __creationUUID: createOperation.creationUUID }, {
      ...createOperation.data,
      repository: identity.repositoryId,
      domain: identity.domainId,
      createdAt: createOperation.changedAt,
      submittedAt: pushOp.submittedAt,
      changedAt: createOperation.changedAt,
      deletedAt: null,
      wasDeleted: false,
    });

    await this.merger.modificationRepository.create({
      entity: createOperation.entity,
      operation: "create",
      data: createOperation.data,
      entityId: entity.id,
      // TODO add this
      // entityUUID: createOperation.uuid,
      repository: identity.repositoryId,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: createOperation.changedAt,
      uuid: createOperation.uuid,
      wasDeleted: false,
    });
  }
}