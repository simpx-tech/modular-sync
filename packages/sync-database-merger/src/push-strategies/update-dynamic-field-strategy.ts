import {PushStrategy} from "../interfaces/push-strategy";
import {DatabaseMerger} from "../sync-database-merger";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export class UpdateDynamicFieldStrategy implements PushStrategy {
  private merger: DatabaseMerger;

  async runSetup(merger: any): Promise<void> {
    this.merger = merger;
  }

  async handle(identity: any, repository: any, updateOperation: any, pushOp: any): Promise<void> {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      creationUUID: updateOperation.creationUUID,
    });

    if (modificationInDb) {
      return;
    }

    const entity = await repository.getByField({ creationUUID: updateOperation.creationUUID });

    if (!entity) {
      throw new InternalServerErrorException("Entity not found");
    }

    const dynamicField = await this.merger.dynamicFieldRepository.getByField({ creationUUID: updateOperation.creationUUID });

    if (!dynamicField) {
      throw new InternalServerErrorException("Dynamic field not found");
    }

    await this.merger.dynamicFieldRepository.updateByField({ creationUUID: updateOperation.creationUUID }, {
      value: updateOperation.data.value,
      entity: updateOperation.entity,
      submittedAt: pushOp.submittedAt,
      createdAt: updateOperation.changedAt,
      changedAt: updateOperation.changedAt,
      creationUUID: updateOperation.creationUUID,
      wasDeleted: false,
    });

    await this.merger.modificationRepository.create({
      entity: updateOperation.entity,
      operation: EntityModificationType.CreateDynamicField,
      data: updateOperation.data,
      creationUUID: updateOperation.creationUUID,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: updateOperation.changedAt,
      uuid: updateOperation.uuid,
    });
  }
}