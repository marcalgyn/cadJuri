import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sacadores'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('cnpj', 20).unique().notNullable()
      table.string('nome_fantasia', 250).notNullable()
      table.string('razao_social', 250).notNullable()
      table.string('email', 180).notNullable()
      table.string('contato', 180).notNullable()
      table.string('telefone', 25).notNullable()
      table.float('taxa_juros')
      table.decimal('limite_geral_credito', 12, 2)
      table.decimal('limite_sacado', 12, 2)
      table.decimal('limite_utilizado', 12, 2)
      table.decimal('saldo_limite', 12, 2)
      table
        .integer('endereco_id')
        .unsigned()
        .references('enderecos.id')
      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
