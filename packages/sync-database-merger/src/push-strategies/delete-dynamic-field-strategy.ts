import {PushStrategy} from "../interfaces/push-strategy";
import {DatabaseMerger} from "../sync-database-merger";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export class DeleteDynamicFieldStrategy implements PushStrategy {
  private merger: DatabaseMerger;

  async runSetup(merger: DatabaseMerger): Promise<void> {
    this.merger = merger;
  }

  async handle(identity: any, repository: any, deleteOperation: any, pushOp: any): Promise<void> {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      creationUUID: deleteOperation.creationUUID,
    });

    console.log(modificationInDb)

    if (modificationInDb) {
      return;
    }

    const dynamicField= await this.merger.dynamicFieldRepository.updateByField({ creationUUID: deleteOperation.creationUUID, key: deleteOperation.data.key }, { wasDeleted: true, deletedAt: deleteOperation.changedAt, submittedAt: pushOp.submittedAt, changedAt: deleteOperation.changedAt });

    console.log(dynamicField)

    if (!dynamicField) {
      throw new InternalServerErrorException("Trying to delete an dynamic field that does not exist");
    }

    await this.merger.modificationRepository.create({
      entity: deleteOperation.entity,
      operation: EntityModificationType.DeleteDynamicField,
      data: deleteOperation.data,
      creationUUID: deleteOperation.creationUUID,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: deleteOperation.changedAt,
      uuid: deleteOperation.uuid,
    });
  }
}