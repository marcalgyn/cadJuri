import Hash from "@ioc:Adonis/Core/Hash";
import {
  BaseModel,
  beforeSave,
  column, belongsTo, BelongsTo
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Empresas from "./Empresa";

export default class Usuario extends BaseModel {

  @column({ isPrimary: true })
  public id: number;

  @column()
  public empresa_id: number;

  @column()
  public nome: string;

  @column()
  public email: string;

  @column()
  public telefone: string;

  @column()
  public login: string;
  
  @column({ serializeAs: null })
  public senha: string;

  @column()
  public status: string;

  @column()
  public nivel: string;

  @column()
  public rememberMeToken?: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @beforeSave()
  public static async hashPassword(pessoa: Usuario) {
    if (pessoa.$dirty.password) {
      pessoa.senha = await Hash.make(pessoa.senha);
    }
  }

  @column.dateTime({ autoCreate: true })
  public updated_at: DateTime;

  @belongsTo(() => Empresas)
  public empresa: BelongsTo<typeof Empresas>;

}
