import {ConnectionField, EntitySchema, SchemaType } from "./database-adapter";

type TypeBySchemaType = {
  [SchemaType.String]: string;
  [SchemaType.Integer]: number;
  [SchemaType.Float]: number;
  [SchemaType.Boolean]: boolean;
  [SchemaType.Date]: Date;
}

export type MapSchemaToType<TSchema extends EntitySchema> = {
  [K in keyof TSchema]: TSchema[K] extends ConnectionField ? string | number : TSchema[K] extends "string" | "integer" | "float" | "boolean" | "date" ? TypeBySchemaType[TSchema[K]] : number
}