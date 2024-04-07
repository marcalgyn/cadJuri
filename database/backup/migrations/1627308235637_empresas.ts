import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Empresas extends BaseSchema {
  protected tableName = "empresas";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("cnpj").unique().notNullable();
      table.string("razao_social").notNullable();
      table.string("email").notNullable();
      table
        .timestamp("created_at", { useTz: true })
        .notNullable()
        .defaultTo(this.now());
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
