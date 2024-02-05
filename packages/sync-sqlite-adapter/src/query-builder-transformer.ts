import {QueryBuilder} from "@simpx/sync-core/src/common/query-builder";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {isOperationValue, Query} from "@simpx/sync-core/src/interfaces/query";

export class QueryBuilderTransformer {
  private builder: QueryBuilder;
  private sql = "";
  private query: Query<any> = { entity: "" };
  private params: any[] = [];

  constructor(builder: QueryBuilder) {
    this.builder = builder;
  }

  transform() {
    this.query = this.builder.build();

    this.applySelect();
    this.applyWhere();
    this.applyOrderBy();
    this.applyLimit();
    this.applySkip();
      
    return { sql: this.sql, params: this.params };
  }

  private applySelect() {
    if (!this.query.entity) {
      throw new InternalServerErrorException("Entity name is required to build a query. Use QueryBuilder.attachEntity() to set a entity name.");
    }

    this.sql += `SELECT ${this.getFormattedFields()} FROM ` + this.query.entity;
  }

  private getFormattedFields() {
    if (this.query.fields) {
      return this.query.fields.join(", ");
    } else {
      return "*";
    }
  }

  private applyWhere() {
    if (this.query.match && Object.keys(this.query.match).length > 0) {
      this.sql += " WHERE " + this.getFormattedWhere();
    }
  }

  private getFormattedWhere() {
    return Object.keys(this.query.match).map(key => {

      const value = this.query.match[key];
      if (isOperationValue(value)) {
        const operator = value.operator;

        if (value.isCustomValue) {
          this.params.push(...value.params);
        } else {
          this.params.push(value.value);
        }

        return `${key} ${operator} ${value.isCustomValue ? value.value : "?"}`;
      } else {
        this.params.push(value);
        return `${key} = ?`
      }
    }).join(" AND ");
  }

  private applyOrderBy() {
    if (this.query.orderBy) {
      this.sql += " ORDER BY " + this.getFormattedOrderBy();
    }
  }

  private getFormattedOrderBy() {
    return this.query.orderBy.map(order => {
      const key = Object.keys(order)[0];
      return `${key} ${order[key]}`;
    }).join(", ");
  }

  private applyLimit() {
    if (this.query.limit) {
      this.params.push(this.query.limit);
      this.sql += ` LIMIT ?`;
    }
  }

  private applySkip() {
    if (this.query.skip) {
      this.params.push(this.query.skip);
      this.sql += ` OFFSET ?`;
    }
  }
}