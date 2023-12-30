import {FieldType, SchemaType} from "../interfaces/database-adapter";

export function getConverterFnBySchemaType(schemaType: FieldType) {
  switch (schemaType) {
    case SchemaType.String:
      return "toString";
    case SchemaType.Integer:
      return "toInt";
    case SchemaType.Float:
      return "toFloat";
    case SchemaType.Boolean:
      return "toBoolean";
    case SchemaType.Date:
      return "toDate";
  }

  if (schemaType?.type === "connection") {
    return "toConnection"
  }

  return "toString"
}