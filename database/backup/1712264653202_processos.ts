import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'processos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('numeroprocesso').nullable;
      table.dateTime('datacontratacao').nullable;
      table.string('descricaoacao').nullable;
      table.string('nivelprocesso').nullable;
      table.dateTime('primeiraaudiencia').nullable;
      table.string('nomejuiz').nullable;
      table.string('linkprocesso').nullable;
      table.string('senhaprocesso').nullable;
      table.string('vara').nullable;

      table.string('obs').nullable;
      table
        .integer('empresa_id')
        .unsigned()
        .references('empresas.id');

      table.integer('cliente_id')
        .unsigned()
        .references('clientes.id');

      table.integer('tribunal_id')
        .unsigned()
        .references('tribunals.id');
      
      table.integer('estatus_id')
        .unsigned()
        .references('estatus.id');
      
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
