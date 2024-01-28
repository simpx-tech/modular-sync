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

  asString(data: unknown): string {
    if (data instanceof Date) {
      return data.toISOString();
    }

    return data.toString();
  }

  asInteger(data: unknown) {
    return this.toNumber(data, true);
  }

  asFloat(data: unknown) {
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

  asBoolean(data: unknown) {
    const finalBoolean = typeof data === "string" ? data === "true" || (data !== "0" && data !== "false") : !!data;
    return finalBoolean ? 1 : 0;
  }

  asDate(data: unknown): number {
    if (typeof data === "string" || typeof data === "number") {
      return new Date(data).getTime();
    }

    if (data instanceof Date) {
      return data.getTime();
    }

    return undefined;
  }

  asConnection(data: unknown) {
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

  asJson(data: unknown) {
    return JSON.stringify(data);
  }

  asId(data: unknown) {
    if (typeof data === "string" || typeof data === "number") {
      return this.toNumber(data, true)
    }

    throw new Error(`Can't convert ${data} to id`);
  }
}

class OutboundConverter implements DataConverterFlow {
  asString(field: string): string {
    return field;
  }

  asInteger(field: number) {
    return Math.trunc(field);
  }

  asFloat(field: number) {
    return field;
  }

  asBoolean(field: number) {
    return !!field;
  }

  asDate(field: number) {
    return new Date(field);
  }

  asConnection(field: number) {
    return field;
  }

  asJson(field: string) {
    return JSON.parse(field);
  }

  asId(field: number) {
    return field;
  }

  convert(obj: Record<string, unknown>, schema: EntitySchema): any {
    if (!obj) return undefined;

    return Object.entries(obj).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: this[getConverterFnBySchemaType(schema[key] ?? "string")](value as never)
      }
    }, {});
  }
}