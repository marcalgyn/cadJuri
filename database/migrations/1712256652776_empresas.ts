import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'empresas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string("razaosocial").notNullable();
      table.string("fantasia").nullable();
      table.string("cpfcnpj").nullable();
      table.string("registro").nullable();
      table.string("telefone").nullable();
      table.string("email").nullable();
      table.string("cep").nullable();
      table.string("logradouro").nullable();
      table.string("bairro").nullable();
      table.string("cidade").nullable();
      table.string("estado").nullable();
      table.string("logo").nullable();
      table.string("cor").nullable();
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
