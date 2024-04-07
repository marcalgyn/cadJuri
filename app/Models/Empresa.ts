import { BaseModel, column, BelongsTo, belongsTo, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";


export default class Empresas extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public razaosocial : string;
  
  @column()
  public fantasia: string;

  @column()
  public cpfcnpj: string;

  @column()
  public registro: string;

  @column()
  public telefone: string;

  @column()
  public email: string;

  @column()
  public cep : string;

  @column()
  public logradouro : string;

  @column()
  public bairro : string;
  
  @column()
  public cidade : string;
  
  @column()
  public estado : string;
  
  @column()
  public logo : string;

  @column()
  public cor : string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime;
  
}
