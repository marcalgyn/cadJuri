import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'estatuses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('descricao');
      table.string('observacao');

      table.integer('empresa_id')
        .unsigned()
        .references('empresas.id');
      
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
