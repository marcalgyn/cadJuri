import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'titulos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('nomeacao').nullable;
      table.string('tipodocumento').nullable;
      table.string('processo').nullable;
      table.decimal('valortitulo').nullable;
      table.dateTime('dataemissao').nullable;
      table.dateTime('datavencimento').nullable;
      table.integer('parcela').nullable;
      table.integer('totalparcela').nullable;
      table.datetime('datapagamento').nullable;
      table.decimal('valorpago').nullable;
      table.decimal('saldo').nullable;
      table.string('estatus').nullable;
      table.string('justificativa').nullable;
      table.datetime('dataprevista').nullable;
      table.string('obs').nullable;
      table
        .integer('empresa_id')
        .unsigned()
        .references('empresas.id');

      table.integer('cliente_id')
        .unsigned()
        .references('clientes.id');
      
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
