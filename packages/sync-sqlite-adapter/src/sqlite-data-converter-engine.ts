import {DataConverterEngine} from "@simpx/sync-core/src/interfaces/data-converter";

export class SQLiteDataConverterEngine implements DataConverterEngine {
  inbound = {
    toString() {},

    toInt() {},

    toFloat() {},

    toBoolean() {},

    toDate() {},

    toConnection() {}
  }

  outbound = {
    toString() {},

    toInt() {},

    toFloat() {},

    toBoolean() {},

    toDate() {},

    toConnection() {}
  }
}