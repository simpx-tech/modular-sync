import {DataConverterEngine, DataConverterFlow} from "@simpx/sync-core/src/interfaces/data-converter-engine";
import {isBooleanStringNumber} from "../helpers/isBooleanStringNumber";
import {EntitySchema} from "@simpx/sync-core/src/interfaces/database-adapter";
import {getConverterFnBySchemaType} from "@simpx/sync-core/src/helpers/get-converter-fn-by-schema-type";

export class SQLiteDataConverterEngine implements DataConverterEngine {
  inbound = new InboundConverter();
  outbound = new OutboundConverter();
}

class InboundConverter implements DataConverterFlow {
  convert(obj: Record<string, unknown>, schema: EntitySchema): any {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: this[getConverterFnBySchemaType(schema[key] ?? "string")](value)
      }
    }, {});
  }

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
    const finalBoolean = typeof data === "string" ? data === "true" || (data !== "0" && data !== "false") : !!data;
    return finalBoolean ? 1 : 0;
  }

  toDate(data: unknown): number {
    if (typeof data === "string" || typeof data === "number") {
      return new Date(data).getTime();
    }

    if (data instanceof Date) {
      return data.getTime();
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

class OutboundConverter implements DataConverterFlow {
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

  convert(obj: Record<string, unknown>, schema: EntitySchema): any {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: this[getConverterFnBySchemaType(schema[key] ?? "string")](value as never)
      }
    }, {});
  }
}