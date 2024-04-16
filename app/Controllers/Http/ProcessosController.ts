import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Usuario from "App/Models/Usuario";
import Processo from "App/Models/Processo";
import Tribunal from "App/Models/Tribunal"
import Estatus from "App/Models/Estatuses";

import { DateTime } from "luxon";
import moment from "moment";
import SibApiV3Sdk  from "sib-api-v3-sdk";
import { Request } from "@adonisjs/core/build/standalone";
import Cliente from "App/Models/Cliente";


export default class ProcessosController {

  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id;
    const nomeEmpresa = await Empresa.query()
    .where('id', '=', Number(idEmpresa))
    .select('fantasia');



    const tribunais = await Tribunal.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("nome", "asc");

    const estatus = await Estatus.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("descricao", "asc");

    const clientes = await Cliente.query()
    .where("empresa_id", "=", Number(idEmpresa))
    .orderBy("nome", "asc");

    const objProcesso = {

      id: 0,
      empresa_id: Number(idEmpresa),
      numeroprocesso: "",
      datacontratacao: DateTime.now(),
      descricaoacao: "",
      nivelprocesso: "",
      nomejuiz: "",
      primeiraaudiencia: DateTime.now(),
      linkprocesso: "",
      senhaprocesso: "",
      vara: "",
      obs: "",
      cliente_id: 0,
      tribunal_id: 0,
      estatus_id: 0,
      
    };


    return view.render("processos", {
      tribunais,
      estatus,
      clientes,
      objProcesso,
      nomeEmpresa
    });
  }

  public async edit({ view, params, auth }: HttpContextContract) {
    const objProcesso = await Processo.findOrFail(params.id)
  
   

    return view.render("processos", {
      objProcesso,
      
    });
  }



  public async create({ request, response, session, auth }: HttpContextContract) {
    try {
      const validationSchema = schema.create({
        numeroprocesso: schema.string(),
      });

      const validateData = await request.validate({ schema: validationSchema });

      if (request.input("id") === "0") {
        await Processo.create({
          numeroprocesso: validateData.numeroprocesso,
          datacontratacao: request.input('datacontratacao') !== undefined && request.input('datacontratacao') !== null
          ? request.input('datacontratacao') : null,

          descricaoacao: request.input('descricaoacao'),
          nivelprocesso: request.input('nivelprocesso'),
          primeiraaudiencia: request.input('primeiraaudiencia') !== undefined && request.input('primeiraaudiencia') !== null
          ? request.input('primeiraaudiencia') : null,

          linkprocesso: request.input('linkprocesso'),
          nomejuiz: request.input('nomejuiz'),
          senhaprocesso: request.input('senhaprocesso'),
          vara: request.input('vara'),
          obs: request.input('obs'),
          empresa_id: auth.user?.empresa_id,
          cliente_id: request.input('cliente_id'),
          tribunal_id: request.input('tribunal_id'),
          estatus_id: request.input('estatus_id'),

        });

        session.flash("notification", "Processo criado com sucesso!");
      
      } else {
        const processo = await Processo.findOrFail(request.input("id"));
        
          processo.numeroprocesso = validateData.numeroprocesso,
          processo.datacontratacao= request.input('datacontratacao') !== undefined && request.input('datacontratacao') !== null
          ? this.convertStrToDateTime(request.input('datacontratacao')) : null,
          processo.descricaoacao= request.input('descricaoacao'),
          processo.nivelprocesso= request.input('nivelprocesso'),
          processo.primeiraaudiencia= request.input('primeiraaudiencia') !== undefined && request.input('primeiraaudiencia') !== null
          ? this.convertStrToDateTime(request.input('primeiraaudiencia')) : null,
          processo.linkprocesso= request.input('linkprocesso'),
          processo.nomejuiz= request.input('nomejuiz'),
          processo.senhaprocesso= request.input('senhaprocesso'),
          processo.vara= request.input('vara'),
          processo.obs= request.input('obs'),
          processo.cliente_id= request.input('cliente_id'),
          processo.tribunal_id= request.input('tribunal_id'),
          processo.estatus_id= request.input('estatus_id'),

        await processo.save();

        session.flash("notification", "Processo alterado com sucesso!");
      }
    } catch (error) {
      console.log("Error:", error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Erro na operação solicitada!`;
      }
      session.flash("notification", msg);
    }
    return response.redirect("back");
  }

  public async finalize({ view, params }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Usuario.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const objOrdemServico = await OrdemServico.findOrFail(params.id);

    objOrdemServico.statusOrdemServico = "Concluido";
    objOrdemServico.dataConclusao = DateTime.now();

    return view.render("ordemServico", {
      objOrdemServico,
      empresas,
      pessoas,
      departamentos,
    });
  }

  public async cancela({ response, session, params }: HttpContextContract) {
    const ordemServico = await OrdemServico.findOrFail(params.id);

    ordemServico.statusOrdemServico = "Reprovado";
    ordemServico.dataConclusao = DateTime.now();
    await ordemServico.save();

    // await ordemServico.delete();

    session.flash("notification", "Orçamento Cancelado com sucesso!");

    return response.redirect("back");
  }

  public async lista({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Usuario.all();
    const page = request.input("page", 1);
    const limit = 50;

    const ordemServicos = await OrdemServico.query()

      .select("ordens_servicos.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .join("empresas", "empresas.id", "=", "ordens_servicos.emp_destino")
      .join("pessoas", "pessoas.id", "=", "ordens_servicos.usu_destino")
      .join(
        "departamentos",
        "departamentos.id",
        "=",
        "ordens_servicos.dep_destino"
      )
      .andWhere("ordens_servicos.status_ordem_servico", "Completo")
      .orderBy("data_conclusao", "desc")
      .paginate(page, limit);

    ordemServicos.baseUrl("lista");

    return view.render("listaordemServico", {
      ordemServicos,
      empresas,
      departamentos,
      pessoas,
    });
  }

  public async filtro({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Usuario.all();
    const page = request.input("page", 1);
    const limit = 50;

    const empDestino = request.input("empDestino");
    const usuDestino = request.input("usuDestino");
    const dataInicial = request.input("dataInicial");
    const dataFinal = request.input("dataFinal");
    const depDestino = request.input("depOrdemServico");

    const ordemServicos = await OrdemServico.query()
      .join("empresas", "empresas.id", "=", "ordens_servicos.emp_destino")
      .join("pessoas", "pessoas.id", "=", "ordens_servicos.usu_destino")
      .join(
        "departamentos",
        "departamentos.id",
        "=",
        "ordens_servicos.dep_destino"
      )
      .where((query) => {
        if (empDestino !== null) {
          query.andWhere("empDestino", empDestino);
        }

        if (usuDestino !== null) {
          query.andWhere("usuDestino", usuDestino);
        }

        if (dataInicial !== null && dataFinal !== null) {
          query.andWhereBetween("dataConclusao", [
            dataInicial + " 00:00:00",
            dataFinal + " 23:59:59",
          ]);
        }

        if (depDestino !== null) {
          query.andWhere("depDestino", depDestino);
        }
      })
      .andWhere("ordens_servicos.status_ordem_servico", "Completo")
      .select("ordens_servicos.*")
      .select("empresas.razao_social")
      .select("departamentos.nome")
      .select("pessoas.name")
      .orderBy("data_conclusao")
      .paginate(page, limit);

    ordemServicos.baseUrl("lista");

    return view.render("listaordemServico", {
      ordemServicos,
      pessoas,
      empresas,
      departamentos,
    });
  }

  public async listaOrcamento({request, view} : HttpContextContract){
 

  }

  /**
   * Retorna um DateTime Luxon
   */
  public convertStrToDateTime(dataInput: string): any {
    const dataLuxon = DateTime.fromISO(dataInput);
    return dataLuxon;
  }

  public normalizaNomeImagem(value: string): string {
    return (
      moment().format("DDMMYYYYHHmmss") +
      "_" +
      value.normalize("NFD").split(" ").join("")
    );
  }
}
