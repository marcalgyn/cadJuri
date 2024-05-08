import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Empresa from './Empresa';
import Cliente from './Cliente';

export default class Audiencia extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  processo: string;

  @column.dateTime()
  dataaudiencia: DateTime;

  @column()
  observacao: string;
  
  @column()
  realizado: string;

  @column()
  public empresa_id : number;

  @column()
  public cliente_id : number;

  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>;

  @belongsTo(() => Cliente)
  public cliente: BelongsTo<typeof Cliente>;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime
}
