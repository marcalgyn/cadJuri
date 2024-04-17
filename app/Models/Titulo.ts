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
  public tipodocumento : string;

  @column()
  public valortitulo: number;

  @column.dateTime()
  public dataemissao: DateTime;

  @column.dateTime()
  public datavencimento: DateTime;

  @column()
  public parcela : number;

  @column()
  public totalparcela: number;
  
  @column.dateTime()
  public datapagamento: DateTime;

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

  @column()
  public cliente_id: number;

  @column()
  public empresa_id: number;

  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => Cliente)
  public cliente: BelongsTo<typeof Cliente>

  @column.dateTime({ autoCreate: true })
  public created_at?: DateTime;

  @column.dateTime({ autoCreate: true })
  public updated_at?: DateTime;

}
