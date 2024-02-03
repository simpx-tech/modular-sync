import {PushStrategy} from "../interfaces/push-strategy";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {DatabaseMerger} from "../sync-database-merger";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export class CreateDynamicFieldStrategy implements PushStrategy {
  private merger: DatabaseMerger;

  async runSetup(merger: any): Promise<void> {
    this.merger = merger;
  }

  async handle(identity: any, repository: any, createOperation: any, pushOp: any): Promise<void> {
    const modificationInDb = await this.merger.modificationRepository.getByField({
      creationUUID: createOperation.creationUUID,
    });

    if (modificationInDb) {
      return;
    }

    const entity = await repository.getByField({ creationUUID: createOperation.creationUUID });

    if (!entity) {
      throw new InternalServerErrorException("Entity not found");
    }

    await this.merger.dynamicFieldRepository.upsert({ creationUUID: createOperation.creationUUID }, {
      key: createOperation.data.key,
      value: createOperation.data.value,
      entity: createOperation.entity,
      submittedAt: pushOp.submittedAt,
      createdAt: createOperation.changedAt,
      changedAt: createOperation.changedAt,
      deletedAt: null,
      creationUUID: createOperation.creationUUID,
      wasDeleted: false,
    });

    await this.merger.modificationRepository.create({
      entity: createOperation.entity,
      operation: EntityModificationType.CreateDynamicField,
      data: createOperation.data,
      creationUUID: createOperation.creationUUID,
      domain: identity.domainId,
      submittedAt: pushOp.submittedAt,
      changedAt: createOperation.changedAt,
      uuid: createOperation.uuid,
    });
  }
}