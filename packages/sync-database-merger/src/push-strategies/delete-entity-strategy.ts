import {PushStrategy} from "../interfaces/push-strategy";
import {DatabaseMerger} from "../sync-database-merger";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export class DeleteEntityStrategy implements PushStrategy {
  private merger: DatabaseMerger;

  async runSetup(merger: DatabaseMerger): Promise<void> {
    this.merger = merger;
  }

  async handle(identity: any, repository: any, deleteOperation: any, pushOp: any): Promise<void> {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      creationUUID: deleteOperation.creationUUID,
    });

    if (modificationInDb) {
      return;
    }

    console.log(deleteOperation)

    const entity = await repository.updateByField({ creationUUID: deleteOperation.creationUUID }, {
      wasDeleted: true,
      deletedAt: deleteOperation.changedAt,
      submittedAt: pushOp.submittedAt,
      changedAt: deleteOperation.changedAt,
    })

    if (!entity) {
      throw new InternalServerErrorException("Trying to delete an entity that does not exist");
    }

    await this.merger.modificationRepository.create({
      entity: deleteOperation.entity,
      operation: EntityModificationType.DeleteEntity,
      creationUUID: deleteOperation.creationUUID,
      repository: identity.repositoryId,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: deleteOperation.changedAt,
      uuid: deleteOperation.uuid,
      data: null,
    });
  }
}