import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Pessoas extends BaseSchema {
  protected tableName = "pessoas";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("email", 255).notNullable();
      table.string("telefone", 20).nullable();
      table.integer("cargo").nullable();
      table.boolean("ativo").nullable().defaultTo(0);
      table.boolean("desligado").nullable().defaultTo(0);
      table.string("password", 180).notNullable();
      table.string("remember_me_token").nullable();
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
