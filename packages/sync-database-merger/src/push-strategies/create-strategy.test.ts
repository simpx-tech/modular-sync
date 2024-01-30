import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {Express} from "express";
import {DatabaseAdapter} from "@simpx/sync-core/src/interfaces/database-adapter";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {expect} from "@jest/globals";
import {CreateStrategy} from "./create-strategy";
import {v4} from "uuid";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {OperationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

describe("Sync Database Merger", () => {
  let token: string;
  let syncEngine: ServerSyncEngine;
  let app: Express;
  let commonDb: DatabaseAdapter;
  let createStrategy: CreateStrategy;
  let simpleRepository: RepositoryBase;

  beforeEach(async () => {
    ({ syncEngine, app, commonDb, simpleRepository } = setupTests());
    await syncEngine.runSetup();
    createStrategy = new CreateStrategy();
  })

  describe("handle", () => {
    it('should consider the first fields element as the create operation', () => {
      const operation = {
        fields: [
          {
            __uuid: v4(),
            name: "name",
            name2: "name2"
          }
        ],
        dynamicFields: {
          create: [],
          update: [],
          delete: []
      },
        operation: "create" as OperationType,
        // TODO make it correct
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-01"),
        deletedAt: null,
        submittedAt: new Date("2023-01-01"),
      };

      createStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, operation);
    });

    it('should consider the other fields elements as the update operations', () => {
      expect(true).toBe(false);
    });

    it('should not duplicate creates and updates if resend request', () => {
      expect(true).toBe(false);
    });

    it('should create the dynamic fields too', () => {
      expect(true).toBe(false);
    });

    it('should update the dynamic fields too', () => {
      expect(true).toBe(false);
    });

    it('should delete the dynamic fields too', () => {
      expect(true).toBe(false);
    });

    it('should save all the modifications', () => {
      expect(true).toBe(false);
    });

    it('should only make one write even with many updates', () => {
      expect(true).toBe(false);
    });

    it('should only make one write even with many updates, should also save the item as deleted', () => {
      expect(true).toBe(false);
    });

    it('should save all the modifications including the ones before a deletion', () => {
      expect(true).toBe(false);
    });
  });
})