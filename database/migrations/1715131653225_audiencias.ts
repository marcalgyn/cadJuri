import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'audiencias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('processo').notNullable;
      table.datetime('dataaudiencia').notNullable;
      table.string('observacao').nullable;
      table.string('realizado').nullable;

      table
      .integer('empresa_id')
      .unsigned()
      .references('empresas.id');

      table.integer('cliente_id')
      .unsigned()
      .references('clientes.id')
    
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
