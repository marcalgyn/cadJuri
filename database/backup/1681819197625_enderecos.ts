import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "enderecos";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("logradouro", 250).notNullable();
      table.string("bairro", 250).notNullable();
      table.string("cidade", 180).notNullable();
      table.string("uf", 2).notNullable().defaultTo("GO");
      table.string("cep", 10).nullable();
      table.string("numero", 10).nullable();
      table.string("complemento", 180).nullable();
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
