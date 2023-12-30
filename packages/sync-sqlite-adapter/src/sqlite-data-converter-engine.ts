import {DataConverterEngine} from "@simpx/sync-core/src/interfaces/data-converter-engine";
import {isBooleanStringNumber} from "../helpers/isBooleanStringNumber";

export class SQLiteDataConverterEngine implements DataConverterEngine {
  inbound = new InboundConverter();
  outbound = new OutboundConverter();
}

class InboundConverter {
  toString(data: unknown) {
    if (data instanceof Date) {
      return data.toISOString();
    }

    return data.toString();
  }

  toInt(data: unknown) {
    return this.toNumber(data, true);
  }

  toFloat(data: unknown) {
    return this.toNumber(data);
  }

  private toNumber(data: unknown, truncate?: boolean) {
    if (data instanceof Date) {
      return data.getTime();
    }

    if (isBooleanStringNumber(data)) {
      let parseFunc = truncate ? parseInt : parseFloat;
      const number = typeof data === "string" ? parseFunc(data) : typeof data === "boolean" ? data ? 1 : 0 : data;

      return truncate ? Math.trunc(number) : number;
    }

    return 0;
  }

  toBoolean(data: unknown) {
    return typeof data === "string" ? data === "true" || (data !== "0" && data !== "false") : !!data;
  }

  toDate(data: unknown) {
    if (typeof data === "string" || typeof data === "number") {
      return new Date(data);
    }

    if (data instanceof Date) {
      return data;
    }

    return undefined;
  }

  toConnection(data: unknown) {
    if (typeof data === "number") {
      return Math.trunc(data);
    }

    if (typeof data === "string") {
      const number = parseInt(data);
      if (!isNaN(number)) {
        return number;
      }
    }

    return undefined;
  }
}

class OutboundConverter {
  toString(field: string) {
    return field;
  }

  toInt(field: number) {
    return Math.trunc(field);
  }

  toFloat(field: number) {
    return field;
  }

  toBoolean(field: number) {
    return !!field;
  }

  toDate(field: number) {
    return new Date(field);
  }

  toConnection(field: number) {
    return field;
  }
}