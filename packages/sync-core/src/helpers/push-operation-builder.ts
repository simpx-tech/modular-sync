import {EntityModification} from "../server/interfaces/merge-engine";

interface InitialSetupParams {
  submittedAt?: Date;
  lastChangedAt?: Date;
  finished?: boolean;
}

// TODO add test variant in __tests__ folder?
export class PushOperationBuilder {
  private readonly modifications: any[];
  private submittedAt: Date;
  private lastChangedAt: Date;
  private finished: boolean;

    constructor({ submittedAt, lastChangedAt, finished }: InitialSetupParams = {}) {
        this.modifications = [];
        this.submittedAt = submittedAt ?? new Date();
        this.lastChangedAt = lastChangedAt ?? new Date();
        this.finished = finished ?? false;
    }

  setFinished(newFinished: boolean) {
      this.finished = newFinished;
      return this;
  }

    addModification(modification: EntityModification) {
        this.modifications.push(modification);
        return this;
    }

    build() {
        return {
            modifications: this.modifications,
            submittedAt: this.submittedAt,
            lastChangedAt: this.lastChangedAt,
            finished: this.finished,
        };
    }
}