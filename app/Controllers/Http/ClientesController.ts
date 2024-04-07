import { rules } from '@ioc:Adonis/Core/Validator';
import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Clientes from "App/Models/Cliente";



export default class ClientesController {
  public async index({ view }: HttpContextContract) {
    const objCliente = {
      id: 0,
      cpfcnpj: "",
      nome: "",
      registro: "",
      estadociviel: "",
      naturalidade: "",
      telefone: "",
      email: "sem@email",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      estado: "",
    };
    const clientes = await Clientes.query().orderBy("nome", "asc");

    return view.render("clientes", { objCliente, clientes });
  }

  public async create({ request, response, session }: HttpContextContract) {
    const validationSchema = schema.create({
      cpfcnpj: schema.string({ trim: true }, [rules.maxLength(14)]),
      nome: schema.string({ trim: true }, [rules.maxLength(180)]),
      // email: schema.string({ trim: true }, [rules.maxLength(180)]),
    });

    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "cpfcnpj.required": "Informe o CPF/CNPJ do Cliente",
        "nome.required": "Informe o Nome do Cliente",
      },
    });

    try {
      if (request.input("id") === "0") {

        await Clientes.create({
          cpfcnpj: validateData.cpfcnpj,
          nome: validateData.nome,
          registro: request.input("registro") === 'null' ? '' : request.input("registro"),
          estadocivil: request.input("estadocivil") === 'null' ? '' : request.input("estadocivil"),
          naturalidade: request.input("naturalidade") === 'null' ? '' : request.input("naturalidade") ,
          telefone: request.input("telefone"),
          email: request.input("email") === 'null' ? ' ' : request.input("email"),
          cep: request.input("cep") === 'null' ? '' : request.input("cep"),
          logradouro: request.input("logradouro"),
          bairro: request.input("bairro") === 'null' ? '' : request.input("bairro"),
          cidade: request.input("cidade") === 'null' ? '' : request.input("cidade"),
          estado: request.input("estado") === 'null' ? 'GO' : request.input("estado"),
          empresa_id: pegar a empresa aqui,


          enderecoId: novoEndereco.id
        });

        session.flash(
          "notification",
          "Cliente Sacado adicionado com sucesso!"
        );
      } else {
  
        const clienteSacado = await ClienteSacado.findOrFail(
          request.input("id")
        );

        const endereco = await Endereco.findOrFail(request.input("enderecoId"));
        endereco.logradouro = request.input("logradouro") === 'null' ? '' : request.input("logradouro") ;
        endereco.bairro = request.input("bairro") === 'null' ? '': request.input("bairro");
        endereco.cidade = request.input("cidade") === 'null' ? '' : request.input("cidade");
        endereco.uf = request.input("uf") === 'null' ? 'GO' : request.input("uf");
        endereco.cep = request.input("cep") === 'null' ? '' : request.input("cep");
        endereco.numero = request.input("numero") === 'null' ? '0' : request.input("numero");
        endereco.complemento = request.input("complemento") === 'null' ? '' : request.input("complemento");
        await endereco.save();

        clienteSacado.cpf = request.input("cpf");
        clienteSacado.nome = request.input("nome"),
        clienteSacado.email = request.input("email") === 'null' ? ' ' : request.input("email") ,
        clienteSacado.telefone = request.input("telefone"),
        clienteSacado.taxaJuros = request.input("taxaJuros").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacado.taxaFloat = request.input("taxaFloat").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacado.iof = request.input("iof").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacado.juros = request.input("juros").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),
        clienteSacado.taxaEmissao = request.input("taxaEmissao").toLocaleString('pt-BR', { maximumSignificantDigits: 2 }),

        await clienteSacado.save();
        session.flash("notification", "Cliente Sacado alterado com sucesso!");
      }
    } catch (error) {
      console.log('Erro ao alterar', error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Cliente Sacado com o CPF ${validateData.cpf} já foi cadastrado.`;
      }
      session.flash("notification", msg);
    }

    return response.redirect("back");
  }

  public async edit({ view, params }: HttpContextContract) {
    let objClienteSacado = await ClienteSacado.findOrFail(params.id);
    const sacados = await ClienteSacado.query().orderBy('nome', 'asc');


    const endereco = await Endereco.findOrFail(objClienteSacado.enderecoId);
    objClienteSacado.endereco = endereco;

    return view.render("sacados", { objClienteSacado, sacados });
  }

}
