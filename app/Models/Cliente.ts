import { BaseModel, HasMany, column, hasMany, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresa from "./Empresa";


export default class Cliente extends BaseModel {

  @column({ isPrimary: true })
  public id: number;

  @column()
  public empresa_id : number;

  @column()
  public nome: string;

  @column()
  public cpfcnpj: string;

  @column()
  public registro: string;

  @column()
  public estadocivil: string;

  @column()
  public naturalidade: string;

  @column()
  public telefone: string;

  @column()
  public email: string;

  @column()
  public cep: string;

  @column()
  public logradouro: string;

  @column()
  public bairro: string;

  @column()
  public cidade: string;

  @column()
  public estado: string;


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>;

}
