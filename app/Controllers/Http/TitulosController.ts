import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Cliente from "App/Models/Cliente";
import { DateTime } from "luxon";
import Titulo from "App/Models/Titulo";


export default class TitulosController {
  public async index({ view, auth }: HttpContextContract) {
    const Idempresa = auth.user?.empresa_id;

    const objTitulo = {
      id: 0,
      nomeacao: '',
      processo: 0,
      valortitulo: "",
      dataEmissao: DateTime.now(),
      dataVencimento: DateTime.now(),
      dataPagamento: null,
      dataPrevista: null,
      parcela: 1,
      totalparcela: 1,
      valorpago: "",

      estatus: "",
      justificativa: "",
      obs: "",
      empresa_id: Number(Idempresa),
      cliente_id: 0,
      
    };

    const clientes = await Cliente.query()
    .where('empresa_id', '=', Number(Idempresa))
    .orderBy(
      "nome",
      "asc"
    );
    
    return view.render("titulos", { objTitulo, clientes });

  }

  public async loadRates({ view, params }: HttpContextContract) {
    let sacado = await Cliente.findOrFail(params.id);
    const objTitulo = {
      id: 0,
      sacadoId: sacado.id,
      titulo: "",
      tipoDocumento: 0,
      parcela: 1,
      dataEmissao: DateTime.now(),
      dataVencimento: DateTime.now(),
      nContrato: "",
      valorTitulo: 0,
      dataPagamento: DateTime.now(),
      taxaJuros: sacado.taxaJuros,
      taxaFloat: sacado.taxaFloat,
      iof: sacado.iof,
      taxaEmissao: sacado.taxaEmissao,
      multa: sacado.juros,
      descricao: "",
    };

    const sacadores = await ClienteSacador.query().orderBy(
      "nomeFantasia",
      "asc"
    );
    const sacados = await Cliente.query().orderBy("nome", "asc");

    return view.render("titulos", { objTitulo, sacados, sacadores });
  }

  public async create({ request, response, session, auth }: HttpContextContract) {
    let qtdParcelas: number = Number(request.input("qtdParcelas"));
    let tipoParcela = request.input("tipoParcela");
    let nParcela: number = Number(request.input("parcela"));
    let dataDeVencimento = request.input("dataVencimento");
    let parcelado = 0; //Venda multipla varias parcelas

    if (qtdParcelas === undefined || qtdParcelas === null) {
      qtdParcelas = 1;
      tipoParcela = 0;
    }

    if (Number.isNaN(qtdParcelas)) {
      qtdParcelas = 1;
      tipoParcela = 0;
      parcelado = 1; //parcela unica
    }

    const validationSchema = schema.create({
      dataEmissao: schema.date(),
    });
    
    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "dataEmissao.required": "Informe a data de emissão",
      },
    });
    Verificar aqui p salvar e depois alterar
    try {
      if (request.input("id") === "0") {
        for (let index: number = parcelado; index <= qtdParcelas; index++) {
          await Titulo.create({
            nomeacao: '',
            estatus: 'A',
            cliente_id : request.input('cliente_id'),
            empresa_id: auth.user?.empresa_id,
            tipodocumento: request.input("tipoDocumento"),
            parcela: nParcela,
            totalparcela: request.input("totalparcela"),
            processo : request.input('processo'),
            valorpago: request.input('valorpago'),
            datapagamento: request.input('dataPagamento'),
            dataprevista: request.input('dataPrevista'),
            justificativa: request.input('justificativa'),
            valortitulo: request
            .input("valortitulo")
            .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),

            dataemissao: validateData.dataEmissao,
            datavencimento: this.addDaysToDate(
              dataDeVencimento,
              tipoParcela * index
            ),

            obs: request.input('obs'),
          });
          nParcela++;
        }
        session.flash("notification", "Título criado com sucesso!");
      } else {

        const titulo = await Titulo.findOrFail(request.input("id"));
        titulo.sacadorId = request.input("sacadorId");
        titulo.sacadoId = request.input("sacadoId");
        titulo.titulo = request.input("titulo");
        titulo.tipoDocumento = request.input("tipoDocumento");
        titulo.parcela = request.input("parcela");
        titulo.descricao = request.input("descricao");
        titulo.dataEmissao = validateData.dataEmissao;
        titulo.dataVencimento = request.input("dataVencimento");
        titulo.nContrato = validateData.nContrato;
        titulo.valorTitulo = request
          .input("valorTitulo")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
        titulo.taxaJuros = request
          .input("taxaJuros")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
        titulo.taxaFloat = request
          .input("taxaFloat")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
        titulo.iof = request
          .input("iof")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
        titulo.multa = request
          .input("multa")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
        titulo.taxaEmissao = request
          .input("taxaEmissao")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });

        titulo.save();

        this.atualizarLimiteGeralSacador(
          clienteSacador,
          titulo.valorTitulo,
          true
        );

        session.flash("notification", "Título alterado com sucesso!");
      }
    } catch (error) {
      console.log("Erro na operação", error);
      let msg: string = "";
      session.flash("notification", msg);
    }

    return response.redirect("/titulos");
  }

  public async edit({ view, params }: HttpContextContract) {
    let objTitulo = await Titulo.findOrFail(params.id);
    const sacados = await Cliente.query().orderBy("nome", "asc");
    const sacadores = await ClienteSacador.query().orderBy(
      "nomeFantasia",
      "asc"
    );

    return view.render("titulos", { objTitulo, sacados, sacadores });
  }

  public async lista({ request, view }: HttpContextContract) {
    const sacados = await Cliente.query().orderBy("nome", "asc");
    const sacadores = await ClienteSacador.query().orderBy(
      "nomeFantasia",
      "asc"
    );
    const departamentos = await Departamento.all();

    const page = request.input("page", 1);
    const limit = 10;
    const dataHoje = DateTime.now();

    const titulos = await Titulo.query()
      .select("titulos.*")
      .select("sacados.nome")
      .select("sacados.nome")
      .select("sacadores.nome_fantasia")
      .join("sacados", "sacados.id", "=", "titulos.sacado_id")
      .join("sacadores", "sacadores.id", "=", "titulos.sacador_id")
      .orderBy("titulo", "asc")
      .orderBy("data_vencimento", "asc")
      .paginate(page, limit);

    titulos.forEach(titulo => {
      const diasAtraso: number = Number(titulo.dataVencimento.diffNow('days').days);
      if (diasAtraso < 0) {
        titulo.acrescimoPago += this.calJurosTitulo(titulo, Math.abs(Math.trunc(diasAtraso)));
      }
    });

    titulos.baseUrl("lista");
    return view.render("listartitulos", {
      titulos,
      sacados,
      sacadores,
      departamentos,
      dataHoje,
    });
  }

  public async baixarTitulo({
    request,
    response,
    session,
    params,
  }: HttpContextContract) {
    const titulo = await Titulo.findOrFail(params.id);

    const clienteSacador = await ClienteSacador.findOrFail(titulo.sacadoId);

    titulo.valorPago = request
      .input("valorPago")
      .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
    titulo.dataPagamento = request.input("dataPagamento");

    await titulo.save();

    this.atualizarLimiteGeralSacador(clienteSacador, titulo.valorTitulo, false);

    session.flash("notification", "Título baixado com sucesso!!");

    return response.redirect("/titulos/lista");
  }

  public async estornarTitulo({
    request,
    response,
    session,
    params,
  }: HttpContextContract) {
    const titulo = await Titulo.findOrFail(params.id);

    const clienteSacador = await ClienteSacador.findOrFail(titulo.sacadoId);

    titulo.valorPago = request
      .input("valorPago")
      .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
    titulo.dataPagamento = request.input("dataPagamento");

    await titulo.save();

    this.atualizarLimiteGeralSacador(clienteSacador, titulo.valorTitulo, true);

    session.flash("notification", "Título estornado com sucesso!!");

    return response.redirect("/titulos/lista");
  }

  public async delete({ response, session, params }: HttpContextContract) {
    console.log(`Delete ${params.id}`);
    const titulo = await Titulo.findOrFail(params.id);
    await titulo.delete();
    session.flash("notification", "Título excluído com sucesso!");

    return response.redirect("/titulos/lista");
  }

  public async filtro({ request, view }: HttpContextContract) {
    const sacados = await Cliente.all();
    const sacadores = await ClienteSacador.all();
    const departamentos = await Departamento.all();

    const page = request.input("page", 1);
    const limit = 10;
    const dataHoje = DateTime.now();

    const cpf = request.input("cpf");
    const nomeSacado = request.input("nomeSacado");
    const dataVencimento = request.input("dataVencimento");

    const titulos = await Titulo.query()
      .select("titulos.*")
      .select("sacados.nome")
      .select("sacadores.nome_fantasia")
      .select("sacados.cpf")
      .join("sacados", "sacados.id", "=", "titulos.sacado_id")
      .join("sacadores", "sacadores.id", "=", "titulos.sacador_id")
      .where((query) => {
        if (nomeSacado !== null) {
          query.andWhereILike("nome", "%" + nomeSacado + "%");
        }

        if (dataVencimento !== null) {
          query.andWhereBetween("dataVencimento", [
            dataVencimento + " 00:00:00",
            dataVencimento + " 23:59:59",
          ]);
        }
        if (cpf !== null) {
          query.andWhereILike("cpf", "%" + cpf + "%");
        }
      })
      .orderBy("titulo", "asc")
      .orderBy("data_vencimento", "asc")
      .paginate(page, limit);

    titulos.baseUrl("lista");

    return view.render("listartitulos", {
      titulos,
      sacados,
      sacadores,
      departamentos,
      dataHoje,
    });
  }

  /**
   * Retorna um DateTime Luxon
   */
  public addDaysToDate(dataInput: string, daysInput: number): any {
    const dataLuxon = DateTime.fromISO(dataInput)
      .plus({ days: daysInput })
      .toISODate();
    return dataLuxon;
  }

  /**
   * Retorna o valor da multa de atraso
   */
  public calJurosTitulo(titulo: Titulo, diasAtraso: number): number {
    const txJuros = (titulo.taxaJuros / 100) / 30 * diasAtraso;
    const multa = (titulo.multa / 100) * titulo.valorTitulo;
    const acrescimo = +(txJuros + titulo.taxaFloat + multa).toFixed(2);
    return acrescimo;
  }

  /* Atualiza o Limite Geral do Sacador */
  private async atualizarLimiteGeralSacador(
    sacador: ClienteSacador,
    valor: number,
    baixar: boolean
  ): Promise<void> {
    let limiteGeral: number = 0;
    let limiteUtilizado: number = 0;

    if (baixar) {
      limiteGeral = sacador.limiteGeralCredito - Number(valor);
      limiteUtilizado = sacador.limiteUtilizado + Number(valor);
    } else {
      limiteGeral = sacador.limiteGeralCredito + Number(valor);
      limiteUtilizado = sacador.limiteUtilizado - Number(valor);
    }

    sacador.limiteGeralCredito = limiteGeral;
    sacador.limiteUtilizado = limiteUtilizado;

    await sacador.save();
  }
}
