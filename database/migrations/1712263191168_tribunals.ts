import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tribunals'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('nome').notNullable;
      table.string('comarca').nullable;
      table.string('endereco').nullable;
      table.string('telefone').nullable;
      table.string('email').nullable;
      table.string('vara').nullable;
      table.string('obs').nullable;
      table
      .integer('empresa_id')
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
