import {FieldType, SchemaType} from "../interfaces/database-adapter";

export function getConverterFnBySchemaType(schemaType: FieldType) {
  switch (schemaType) {
    case SchemaType.String:
      return "asString";
    case SchemaType.Integer:
      return "asInteger";
    case SchemaType.Float:
      return "asFloat";
    case SchemaType.Boolean:
      return "asBoolean";
    case SchemaType.Date:
      return "asDate";
    case SchemaType.Json:
      return "asJson";
    case SchemaType.Id:
      return "asId";
    case SchemaType.Stringified:
      return "asStringified";
  }

  if (schemaType?.type === "connection") {
    return "asConnection"
  }

  return "asString"
}