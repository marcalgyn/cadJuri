import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Empresa from './Empresa';

export default class Estatuses extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public descricao: string;

  @column()
  public observacao : string;

  @column()
  public empresa_id : number;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime
  
  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>;

}
