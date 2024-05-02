import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Cliente from "App/Models/Cliente";
import { DateTime } from "luxon";
import Titulo from "App/Models/Titulo";
import Empresa from "App/Models/Empresa";


export default class TitulosController {
  public async index({ view, auth }: HttpContextContract) {
    const Idempresa = auth.user?.empresa_id;

    const objTitulo = {
      id: 0,
      nomeacao: '',
      processo: 0,
      valortitulo: 0,
      dataemissao: DateTime.now(),
      datavencimento: DateTime.now(),
      datapagamento: null,
      dataprevista: null,
      parcela: 1,
      totalparcela: 1,
      valorpago: 0,
      saldo: 0,

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

    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(auth.user?.empresa_id));
    
    return view.render("titulos", { objTitulo, clientes, empresas });

  }
/**
  public async loadRates({ view, params }: HttpContextContract) {
    let sacado = await Cliente.findOrFail(params.id);
    const objTitulo = {
      id: 0,
      sacadoId: sacado.id,
      titulo: "",
      tipodocumento: 0,
      parcela: 1,
      dataEmissao: DateTime.now(),
      dataVencimento: DateTime.now(),
      nContrato: "",
      valorTitulo: 0,
      datapagamento: DateTime.now(),
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
*/

  public async create({ request, response, session, auth }: HttpContextContract) {
    let qtdParcelas: number = Number(request.input("qtdParcelas"));
    let tipoParcela = request.input("tipoParcela");
    let nParcela: number = Number(request.input("parcela"));
    let dataDeVencimento = request.input("dataVencimento");
    let parcelado = 0; //Venda multipla varias parcelas
    let valorTitulo = request
    .input("valortitulo")
    .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
    
    let saldo = valorTitulo;

    let valorPago : number = Number(request.input('valorpago'));
    let estatus = "";

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
    
    if (valorPago > 0 ){
      valorTitulo = valorTitulo - valorPago;
      saldo = valorTitulo;
      estatus = 'Pago'
      
      if (valorTitulo = 0 ) {
        saldo = valorTitulo;
        estatus = 'Pago'
      } else {
        if (valorPago < request.input("valortitulo")) {
          saldo = request.input("valortitulo") - valorPago;
          estatus = 'Parcial';
        } else {
          valorTitulo = request
          .input("valortitulo")
          .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }) - valorPago;
          
        }
      } 

      if (valorTitulo < 0) {
        saldo = valorTitulo;
        estatus = 'Credito';
        session.flash("notification", "Valor Pago é maior que o valor do Titulo!");
      }
    
    } else {
      valorPago = 0;
      saldo = valorTitulo;
      estatus = "Aberto";
    }

    try {
      if (request.input("id") === "0") {
        for (let index: number = parcelado; index <= qtdParcelas; index++) {
          await Titulo.create({
            nomeacao: '',
            estatus: estatus,
            cliente_id : request.input('cliente_id'),
            empresa_id: auth.user?.empresa_id,
            tipodocumento: request.input("tipoDocumento"),
            parcela: nParcela,
            totalparcela: request.input("totalparcela"),
            processo : request.input('processo'),
            valorpago: valorPago,
            saldo: saldo,
            datapagamento: request.input('dataPagamento'),
            dataprevista: request.input('dataPrevista'),
            justificativa: request.input('justificativa') === null ? '' : request.input('justificativa'),
            valortitulo: request
            .input("valortitulo")
            .toLocaleString("pt-BR", { maximumSignificantDigits: 2 }),

            dataemissao: validateData.dataEmissao,
            datavencimento: this.addDaysToDate(
              dataDeVencimento,
              tipoParcela * index
            ),
            obs: request.input('obs') === null ? '' : request.input('obs'),
          });
          nParcela++;
        }
        session.flash("notification", "Título criado com sucesso!");
      } else {

        const titulo = await Titulo.findOrFail(request.input("id"));

        titulo.cliente_id = request.input("cliente_id");
        titulo.empresa_id = request.input("sacadoId");
        titulo.estatus = estatus;
        titulo.tipodocumento = request.input("tipoDocumento");
        titulo.parcela = request.input("parcela");
        titulo.totalparcela = request.input("totalparcela");
        titulo.processo = request.input("processo");
        titulo.valorpago = valorPago;
        titulo.saldo = saldo;
        titulo.datapagamento = request.input("dataPagamento");
        titulo.dataprevista = request.input("dataPrevista");
        titulo.justificativa = request.input("justificativa") === null ? '' : request.input("justificativa");
        titulo.valortitulo = request
        .input("valortitulo")
        .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });

        titulo.dataemissao = request.input('dataEmissao');
        titulo.datavencimento = request.input('dataVencimento');
        titulo.obs = request.input('obs') === null ? '' : request.input('obs');
        titulo.save();


        session.flash("notification", "Título alterado com sucesso!");
      }
    } catch (error) {
      console.log("Erro na operação", error);
      let msg: string = "";
      session.flash("notification", msg);
    }

    return response.redirect("/titulos");
  }

  public async edit({ view, params, auth }: HttpContextContract) {
    let objTitulo = await Titulo.findOrFail(params.id);
    
    const clientes = await Cliente.query()
    .where('clientes.empresa_id', '=', Number(auth.user?.empresa_id) )
    .orderBy("nome", "asc");

    return view.render("titulos", { objTitulo, clientes });

  }

  public async lista({ request, view, auth }: HttpContextContract) {
    const clientes = await Cliente.query().orderBy("nome", "asc");

    const page = request.input("page", 1);
    const limit = 50;
    const dataHoje = DateTime.now();

    const titulos = await Titulo.query()
      .select("titulos.*")
      .select("clientes.nome")
      .join("clientes", "clientes.id", "=", "titulos.cliente_id")
      .where("titulos.empresa_id", '=', Number(auth.user?.empresa_id))
      .orderBy("datavencimento", "asc")
      .orderBy("valorpago", "asc")
      .paginate(page, limit);

    /** titulos.forEach(titulo => {
      const diasAtraso: number = Number(titulo.datavencimento.diffNow('days').days);
      console.log("Dias de aatraso: ", diasAtraso);
    });
    */
    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(auth.user?.empresa_id));

    titulos.baseUrl("lista");
    return view.render("listartitulos", {
      titulos,
      clientes,
      dataHoje,
      empresas,
    });
  }

  public async baixarTitulo({
    request,
    response,
    session,
    params,
  }: HttpContextContract) {
    const titulo = await Titulo.findOrFail(params.id);

    //const cliente = await Cliente.findOrFail(titulo.cliente_id);

    titulo.saldo = request
      .input("valorPago")
      .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
    titulo.datapagamento = request.input("dataPagamento");

    await titulo.save();

    //this.atualizarLimiteGeralSacador(cliente, titulo.valorTitulo, false);

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

    //const cliente = await Cliente.findOrFail(titulo.cliente_id);

    titulo.saldo = request
      .input("valorPago")
      .toLocaleString("pt-BR", { maximumSignificantDigits: 2 });
    titulo.datapagamento = request.input("dataPagamento");

    await titulo.save();

    
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

  public async filtro({ request, view, auth }: HttpContextContract) {
    const clientes = await Cliente.all();
    const empresas = await Empresa.query()
    .select('empresas.fantasia')
    .select('empresas.razaosocial')
    .select('empresas.logo')
    .where('empresas.id', '=', Number(auth.user?.empresa_id));

    const page = request.input("page", 1);
    const limit = 50;
    const dataHoje = DateTime.now();
 
    const cpf = request.input("cpfcnpj");
    let nomeCliente = request.input("nome");
    let dataInicial = request.input("dataInicial");
    let dataFinal = request.input("dataFinal");
    const status = request.input("status");


    const titulos = await Titulo.query()
      .select("titulos.*")
      .select("clientes.nome")
      .select("clientes.cpfcnpj")
      .join("clientes", "clientes.id", "=", "titulos.cliente_id")
      .where((query) => {
        if (nomeCliente !== null) {
          query.andWhereILike("clientes.nome", "%" + nomeCliente + "%");
        }

        if (dataInicial !== null) {
          query.andWhereBetween("titulos.dataVencimento", [
            dataInicial + " 00:00:00",
            dataFinal + " 23:59:59",
          ]);
        }
        if (cpf !== null) {
          query.andWhereILike("clientes.cpfcnpj", "%" + cpf + "%");
        }

        if (status !== "Todos") {
          query.where("estatus", "=", status);
        }

      })

      .orderBy("titulos.dataemissao", "asc")
      .orderBy("titulos.datavencimento", "asc")
      .paginate(page, limit);

    titulos.baseUrl("lista");

    nomeCliente = nomeCliente == null ? 'Todos Clientes' : nomeCliente;
      
    if (dataInicial !== null) {
        let dtInicial = new Date(dataInicial);
        dataInicial = dtInicial.toLocaleDateString('pt-BR');
        
        let dtFinal = new Date(dataFinal)
        dataFinal = dtFinal.toLocaleDateString('pt-BR');
    } else {
      dataInicial = '';
      dataFinal = '';
    }

    return view.render("listartitulos", {
      titulos,
      clientes,
      nomeCliente,
      dataInicial,
      dataFinal,
      empresas,
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
   
  public calJurosTitulo(titulo: Titulo, diasAtraso: number): number {
    const txJuros = (titulo.taxaJuros / 100) / 30 * diasAtraso;
    const multa = (titulo.multa / 100) * titulo.valorTitulo;
    const acrescimo = +(txJuros + titulo.taxaFloat + multa).toFixed(2);
    return acrescimo;
  }
*/


}
