import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresa from "./Empresa";
import Cliente from "./Cliente";


export default class Titulo extends BaseModel {
  public static table = 'titulos';

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nomeacao: string;

  @column()
  public processo: number;

  @column()
  public valortotal: number;

  @column.dateTime()
  public dataEmissao: DateTime;

  @column.dateTime()
  public dataVencimento: DateTime;

  @column()
  public parcela : number;

  @column()
  public totalparcela: number;
  
  @column.dateTime()
  public dataPagamento: DateTime;

  @column()
  public valorpago: number;

  @column()
  public estatus: string;

  @column()
  public justificativa: string;

  @column.dateTime()
  public dataprevista: DateTime;

  @column()
  public obs: string;

  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => Cliente)
  public cliente: BelongsTo<typeof Cliente>

  @column.dateTime({ autoCreate: true })
  public created_at?: DateTime;

  @column.dateTime({ autoCreate: true })
  public updated_at?: DateTime;

}
