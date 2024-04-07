import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grupos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string("nome").notNullable();
      table.string("observacao").nullable();
      table.timestamp("created_at", { useTz: true })
          .notNullable()
          .notNullable()
          .defaultTo( this.now() );
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
