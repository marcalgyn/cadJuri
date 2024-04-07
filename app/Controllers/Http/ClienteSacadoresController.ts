import { rules } from "@ioc:Adonis/Core/Validator";
import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ClienteSacador from "App/Models/Cliente";
import Endereco from "App/Models/Endereco";

export default class ClienteSacadoresController {
  public async index({ view }: HttpContextContract) {
    const objClienteSacador = {
      id: 0,
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      email: "",
      contato: "",
      telefone: "",
      endereco: {
        logradouro: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        numero: "",
        complemento: "",
      },
      taxaJuros: 0,
      limiteGeralCredito: 0,
      limiteUtilizado: 0,
      saldoLimite: 0,
      limiteSacado: 0,
    };
    const sacadores = await ClienteSacador.query().orderBy(
      "razaoSocial",
      "asc"
    );
  
    let objValorOriginal = 0;
    return view.render("sacadores", { objClienteSacador, sacadores, objValorOriginal });
  }

  public async create({ request, response, session }: HttpContextContract) {
    const validationSchema = schema.create({
      cnpj: schema.string({ trim: true }, [rules.maxLength(18)]),
      razaoSocial: schema.string({ trim: true }, [rules.maxLength(180)]),
    });

    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "cnpj.required": "Informe o CNPJ do Cliente",
        "razaoSocial.required": "Informe a Razão Social do Cliente",
      },
    });

    try {
      if (request.input("id") === "0") {

        const novoEndereco = await Endereco.create({
          logradouro: request.input("logradouro"),
          bairro: request.input("bairro"),
          cidade: request.input("cidade"),
          uf: request.input("uf"),
          cep: request.input("cep"),
          numero: request.input("numero"),
          complemento: request.input("complemento"),
        });

        await ClienteSacador.create({
          cnpj: validateData.cnpj,
          razaoSocial: validateData.razaoSocial,
          nomeFantasia: request.input("nomeFantasia"),
          email: request.input("email"),
          contato: request.input("contato"),
          telefone: request.input("telefone"),
          taxaJuros: request.input("taxaJuros").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
          limiteGeralCredito: request.input("limiteGeralCredito").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
          saldoLimite: request.input("limiteGeralCredito").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
          limiteSacado: request.input("limiteSacado").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
          enderecoId: novoEndereco.id
        });
        session.flash(
          "notification",
          "Cliente Sacador adicionado com sucesso!"
        );
      } else {
        const clienteSacador = await ClienteSacador.findOrFail(
          request.input("id")
        );
        const endereco = await Endereco.findOrFail(request.input("enderecoId"));
        endereco.logradouro = request.input("logradouro");
        endereco.bairro = request.input("bairro");
        endereco.cidade = request.input("cidade");
        endereco.uf = request.input("uf");
        endereco.cep = request.input("cep");
        endereco.numero = request.input("numero");
        endereco.complemento = request.input("complemento");
        await endereco.save();

        clienteSacador.cnpj = request.input("cnpj");
        clienteSacador.razaoSocial = request.input("razaoSocial");
        clienteSacador.nomeFantasia = request.input("nomeFantasia"),
        clienteSacador.email = request.input("email"),
        clienteSacador.contato = request.input("contato"),
        clienteSacador.telefone = request.input("telefone"),
        clienteSacador.taxaJuros = request.input("taxaJuros").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacador.limiteGeralCredito = request.input("limiteGeralCredito").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacador.limiteSacado = request.input("limiteSacado").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),

        await clienteSacador.save();
        session.flash("notification", "Cliente Sacador alterado com sucesso!");
      }
    } catch (error) {
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Cliente Sacador com o CNPJ ${validateData.cnpj} já foi cadastrado.`;
      }
      session.flash("notification", msg);
    }

    return response.redirect("back");
  }

  public async edit({ view, params }: HttpContextContract) {
    let objClienteSacador = await ClienteSacador.findOrFail(params.id);
    const sacadores = await ClienteSacador.query().orderBy('razaoSocial', 'asc');
    const endereco = await Endereco.findOrFail(objClienteSacador.enderecoId);
    objClienteSacador.endereco = endereco;
    let objValorOriginal = objClienteSacador.limiteGeralCredito + objClienteSacador.limiteUtilizado;

    return view.render("sacadores", { objClienteSacador, sacadores, objValorOriginal });
  }
}
