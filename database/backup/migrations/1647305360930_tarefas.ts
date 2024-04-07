import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Tarefas extends BaseSchema {
  protected tableName = "tarefas";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.integer("emp_origem").unsigned().references("empresas.id");
      table.integer("usu_origem").unsigned().references("pessoas.id");
      table.integer("emp_destino").unsigned().references("empresas.id");
      table.integer("usu_destino").unsigned().references("pessoas.id");
      table.timestamp("data_origem").notNullable();
      table.timestamp("data_previsao").nullable();
      table.timestamp("data_conclusao").nullable();
      table.string("descricao", 500).notNullable();
      table.integer("prioridade", 1).defaultTo(1);
      table.string("status_tarefa", 50).notNullable();
      table.string("url_origem", 120).nullable();
      table.string("url_final", 120).nullable();
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
