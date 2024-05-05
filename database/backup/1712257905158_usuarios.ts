import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string("nome").notNullable();
      table.string("email").notNullable();
      table.string("telefone").nullable();
      table.string("password").notNullable();
      table.boolean("ativo").nullable();
      table.string("nivel").nullable();
      table.string("remember_me_token").nullable();

      table
        .integer('empresa_id')
        .unsigned()
        .references('empresas.id')
      
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
