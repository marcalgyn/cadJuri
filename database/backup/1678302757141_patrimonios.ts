import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patrimonios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.integer("id_empresa").references("empresas.id");
      table.integer("id_usuario").references("pessoas.id");
      table.integer("id_departamento").references("departamentos.id");
      table.timestamp("data_compra").nullable();
      table.timestamp("data_garantia").nullable();
      table.timestamp("data_baixa").nullable();
      table.string("descricao", 250).notNullable();
      table.string("status_patrimonio",5).notNullable();
      table.string("url_documento").nullable();
      table.string("url_garantia").nullable();
      table.string("gtin").nullable();
      table.timestamp("created_at", {useTz: true})
        .notNullable()
        .defaultTo(this.now());

    })
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
