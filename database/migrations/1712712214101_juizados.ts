import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'juizados'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      
      table.integer('empresa_id')
      .unsigned()
      .references('empresas.id');
      table.string('nomejuizado');
      table.string('comarca');
      table.string('endereco');
      table.string('telefone');
      table.string('email');
      table.string('observacao');
      table.timestamp("created_at", { useTz: true })
      .notNullable()
      .notNullable()
      .defaultTo( this.now() );

      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
