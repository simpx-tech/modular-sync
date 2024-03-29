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

  convertField(field: string, value: unknown, schema: EntitySchema): any {
    return this[getConverterFnBySchemaType(schema[field] ?? "string")](value);
  }

  asString(data: unknown): string {
    if (data instanceof Date) {
      return data.toISOString();
    }

    if (!data) {
      return "";
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
    if (!data) {
      return null;
    }

    if (typeof data === "string" || typeof data === "number") {
      return new Date(data).getTime();
    }

    if (data instanceof Date) {
      return data.getTime();
    }

    return null;
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

  // TODO if it's a string, verify if string is valid, test it
  asStringified(data: unknown) {
    if (typeof data === "string") {
      JSON.parse(data);
      return;
    }

    try {
      return JSON.stringify(data);
    } catch (err) {
      return "{}";
    }
  }

  // TODO test this
  asJson(data: unknown) {
    return JSON.stringify(data);
  }

  // TODO test this
  asId(data: unknown) {
    if (typeof data === "string" || typeof data === "number") {
      return this.toNumber(data, true)
    }

    throw new Error(`Can't convert ${data} to id`);
  }
}

class OutboundConverter implements DataConverterFlow {
  convert(obj: Record<string, unknown>, schema: EntitySchema): any {
    if (!obj) return undefined;

    return Object.entries(obj).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: this[getConverterFnBySchemaType(schema[key] ?? "string")](value as never)
      }
    }, {});
  }

  convertField(field: string, value: unknown, schema: EntitySchema): any {
    return this[getConverterFnBySchemaType(schema[field] ?? "string")](value as never);
  }

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
    if (!field) {
      return null;
    }

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

  asStringified(data: unknown) {
    try {
      return JSON.parse(data as string);
    } catch (err) {
      return {};
    }
  };
}