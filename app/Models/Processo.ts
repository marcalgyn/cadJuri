import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresa from "./Empresa";
import Cliente from "./Cliente";
import Tribunal from "./Tribunal";
import Estatus from "./Estatuses";

export default class Processo extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public numeroprocesso: string;

  @column.dateTime()
  public datacontratacao: DateTime;

  @column()
  public descricaoacao: string;

  @column()
  public nivelprocesso: string;

  @column()
  public primeiraaudiencia: DateTime;

  @column()
  public linkprocesso: string;

  @column()
  public nomejuiz: string;

  @column()
  public senhaprocesso: string;

  @column()
  public vara: string;

  @column()
  public obs: string;

  @column()
  public empresa_id : number;

  @column()
  public cliente_id : number;

  @column()
  public tribunal_id : number;

  @column()
  public estatus_id : number;


  
  @belongsTo(() => Empresa)
  public empresa: BelongsTo<typeof Empresa>;

  @belongsTo(() => Cliente)
  public cliente: BelongsTo<typeof Cliente>;

  @belongsTo(() => Tribunal)
  public tribunal: BelongsTo<typeof Tribunal>;

  @belongsTo(() => Estatus)
  public estatus: BelongsTo<typeof Estatus>;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime;

}
