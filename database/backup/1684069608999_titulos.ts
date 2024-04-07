import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "titulos";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.integer("sacado_id").unsigned().references("sacados.id");
      table.integer('sacador_id').unsigned().references('sacadores.id')
      table.string("titulo", 120).notNullable();
      table.integer("tipo_documento").notNullable();
      table.integer("parcela");
      table.timestamp("data_emissao").nullable();
      table.timestamp("data_vencimento").nullable();
      table.timestamp("data_pagamento").nullable();
      table.string("n_contrato", 25).notNullable();
      table.decimal("valor_titulo", 12, 2).defaultTo(0.0);
      table.decimal("valor_pago", 12, 2).defaultTo(0.0);
      table.float("taxa_juros").defaultTo(0.0);
      table.float("taxa_float").defaultTo(0.0);
      table.float("iof").defaultTo(0.0);
      table.decimal("multa", 12, 2).defaultTo(0.0);
      table.decimal("taxa_emissao", 12, 2).defaultTo(0.0);
      table.decimal("acrescimo_pago", 12, 2).defaultTo(0.0);
      table.string("descricao", 250);
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
