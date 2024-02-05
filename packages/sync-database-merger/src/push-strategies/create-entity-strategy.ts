import {
  EntityModification,
  EntityModificationType,
  PushOperation
} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {IdIdentity} from "../interfaces/id-identity";
import {DatabaseMerger} from "../sync-database-merger";
import {PushStrategy} from "../interfaces/push-strategy";

export class CreateEntityStrategy implements PushStrategy {
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

    await repository.upsert({ creationUUID: createOperation.creationUUID }, {
      ...createOperation.data,
      // TODO type to show these fields (at least as optional, as they are common)
      domain: identity.domainId,
      createdAt: createOperation.changedAt,
      submittedAt: pushOp.submittedAt,
      changedAt: createOperation.changedAt,
      creationUUID: createOperation.creationUUID,
      deletedAt: null,
      wasDeleted: false,
    });

    await this.merger.modificationRepository.create({
      entity: createOperation.entity,
      operation: EntityModificationType.CreateEntity,
      data: createOperation.data,
      creationUUID: createOperation.creationUUID,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: createOperation.changedAt,
      uuid: createOperation.uuid,
    });
  }
}