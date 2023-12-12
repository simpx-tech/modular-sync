import {SyncCredentialsOptions} from "./interfaces/sync-credentials-options";
import * as crypto from "crypto";

export class SyncCredentials {
  email: string;
  password: string;
  remoteSyncUrl: string;
  repository: string;
  token: string;

  constructor({ email, password, remoteSyncUrl, repository }: SyncCredentialsOptions) {
    this.email = email;
    this.password = password;
    this.remoteSyncUrl = remoteSyncUrl;
    this.repository = repository;
  }

  async auth() {
    const encryptPassword = this.encryptPassword(this.password);

    const res = await fetch(this.remoteSyncUrl, {
      body: JSON.stringify({
        email: this.email,
        password: encryptPassword
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    })

    const { token } = await res.json() as { token: string };

    this.token = token;

    return this;
  }

  private encryptPassword(password: string) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
}