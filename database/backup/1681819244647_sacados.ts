import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sacados'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('cpf', 20).unique().notNullable()
      table.string('nome', 250).notNullable()
      table.string('email', 180).notNullable()
      table.string('telefone', 25).notNullable()
      table.float('taxa_juros')
      table.float('taxa_float')
      table.float('iof')
      table.decimal('juros', 12, 2)
      table.decimal('taxa_emissao', 12, 2)
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
