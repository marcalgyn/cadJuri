import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ClienteSacado from "App/Models/ClienteSacado";
import { DateTime } from "luxon";
import Titulo from "App/Models/Titulo";
import Departamento from "App/Models/Departamento";
import ClienteSacador from "App/Models/Cliente";

export default class TitulosController {
  public async index({ view }: HttpContextContract) {
    const objTitulo = {
      id: 0,
      sacadoId: 0,
      sacadorId: 0,
      titulo: "",
      tipoDocumento: 0,
      parcela: 1,
      dataEmissao: DateTime.now(),
      dataVencimento: DateTime.now(),
      nContrato: "",
      valorTitulo: 0,
      dataPagamento: DateTime.now(),
      taxaJuros: 0,
      taxaFloat: 0,
      iof: 0,
      taxaEmissao: 0,
      multa: 0,
      descricao: "",
    };

    const sacadores = await ClienteSacador.query().orderBy(
      "nomeFantasia",
      "asc"
    );
    const sacados = await ClienteSacado.query().orderBy("nome", "asc");

    return view.render("titulos", { objTitulo, sacados, sacadores });
  }

  public async loadRates({ view, params }: HttpContextContract) {
    let sacado = await ClienteSacado.findOrFail(params.id);
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
    const sacados = await ClienteSacado.query().orderBy("nome", "asc");

    return view.render("titulos", { objTitulo, sacados, sacadores });
  }

  public async create({ request, response, session }: HttpContextContract) {
    let qtdParcelas: number = Number(request.input("qtdParcelas"));
    let tipoParcela = request.input("tipoParcela");
    let nParcela: number = Number(request.input("parcela"));
    let dataDeVencimento = request.input("dataVencimento");

    if (qtdParcelas === undefined || qtdParcelas === null) {
      qtdParcelas = 1;
      tipoParcela = 30;
    }

    const validationSchema = schema.create({
      dataEmissao: schema.date(),
      nContrato: schema.string({ trim: true }),
      titulo: schema.string({ trim: true }),
      parcela: schema.number(),
    });

    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "dataEmissao.required": "Informe a data de emissão",
        "nContrato.required": "Informe o número do contrato",
        "titulo.required": "Informe o número do título",
        "parcela.required": "Informe o número de parcelas",
      },
    });


    const clienteSacador = await ClienteSacador.findOrFail(request.input("sacadorId"));
    const vlrTitulo = Number(request.input("valorTitulo"));

    if ((vlrTitulo * qtdParcelas) > clienteSacador.limiteGeralCredito){
      session.flash("notification", "Limite Sacador insuficiente para geração de títulos!");
      return response.redirect("back");
    }

    try {
      clienteSacador.limiteGeralCredito
      if (request.input("id") === "0") {
        for (let index: number = 1; index <= qtdParcelas; index++) {
          await Titulo.create({
            sacadorId: request.input("sacadorId"),
            sacadoId: request.input("sacadoId"),
            titulo: request.input("titulo"),
            tipoDocumento: request.input("tipoDocumento"),
            parcela: nParcela,
            descricao: request.input("descricao"),
            dataEmissao: validateData.dataEmissao,
            dataVencimento: this.addDaysToDate(
              dataDeVencimento,
              tipoParcela * index
            ),
            nContrato: validateData.nContrato,
            valorTitulo: request
              .input("valorTitulo")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
            taxaJuros: request
              .input("taxaJuros")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
            taxaFloat: request
              .input("taxaFloat")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
            iof: request
              .input("iof")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
            multa: request
              .input("multa")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
            taxaEmissao: request
              .input("taxaEmissao")
              .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),
          });
          nParcela++;
          const valorTitulo = request
            .input("valorTitulo")
            .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
          this.atualizarLimiteGeralSacador(clienteSacador, valorTitulo, true);
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
      console.log("Erro ao alterar", error);
      let msg: string = "";
      session.flash("notification", msg);
    }

    return response.redirect("/titulos");
  }

  public async edit({ view, params }: HttpContextContract) {
    let objTitulo = await Titulo.findOrFail(params.id);
    const sacados = await ClienteSacado.query().orderBy("nome", "asc");
    const sacadores = await ClienteSacador.query().orderBy(
      "nomeFantasia",
      "asc"
    );

    return view.render("titulos", { objTitulo, sacados, sacadores });
  }

  public async lista({ request, view }: HttpContextContract) {
    const sacados = await ClienteSacado.query().orderBy("nome", "asc");
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
    const sacados = await ClienteSacado.all();
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
