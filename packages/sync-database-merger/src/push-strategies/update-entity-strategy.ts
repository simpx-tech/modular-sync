import {PushStrategy} from "../interfaces/push-strategy";
import {DatabaseMerger} from "../sync-database-merger";
import {IdIdentity} from "../interfaces/id-identity";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {
  EntityModification,
  EntityModificationType,
  PushOperation
} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";

// Seems identical to CreateEntityStrategy
export class UpdateEntityStrategy implements PushStrategy {
  private merger: DatabaseMerger;

  async runSetup(merger: DatabaseMerger) {
    this.merger = merger;
  }

  async handle(identity: IdIdentity, repository: RepositoryBase<any, any, any, any>, updateOperation: EntityModification, pushOp: PushOperation): Promise<void> {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      uuid: updateOperation.uuid,
    });

    if (modificationInDb) {
      return;
    }

    const entity = await repository.updateByField({ creationUUID: updateOperation.creationUUID }, {
      ...updateOperation.data,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: updateOperation.changedAt,
    });

    if (!entity) {
      throw new InternalServerErrorException("Entity not found");
    }

    await this.merger.modificationRepository.create({
      entity: updateOperation.entity,
      operation: EntityModificationType.UpdateEntity,
      data: updateOperation.data,
      creationUUID: updateOperation.creationUUID,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: updateOperation.changedAt,
      uuid: updateOperation.uuid,
    });
  }
}