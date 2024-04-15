import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresa from "./Empresa";



export default class Tribunals extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public empresa_id: number;

  @column()
  public nome: string;

  @column()
  public comarca: string;

  @column()
  public endereco: string;

  @column()
  public telefone: string;

  @column()
  public email: string;

  @column()
  public obs: string;

  @column()
  public vara: string;

  
  @column.dateTime({ autoCreate: true })
  public createdAt?: DateTime;

  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>;

}
