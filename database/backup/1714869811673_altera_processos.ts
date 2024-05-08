import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'processos'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.dateTime('audiencia').nullable;
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}