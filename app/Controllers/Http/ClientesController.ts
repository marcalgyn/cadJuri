import { rules } from '@ioc:Adonis/Core/Validator';
import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Clientes from "App/Models/Cliente";



export default class ClientesController {
  public async index({ view, auth }: HttpContextContract) {
    const idEmpresa = auth.user?.empresa_id;
    
    const objCliente = {
      id: 0,
      cpfcnpj: "",
      nome: "",
      registro: "",
      estadocivil: "",
      naturalidade: "",
      telefone: "",
      email: "sem@email",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      estado: "",
    };
    const clientes = await Clientes.query()
    .where('empresa_id', '=', Number(idEmpresa))
    .orderBy("nome", "asc");
    

    return view.render("cliente", { objCliente, clientes, idEmpresa });
  }

  public async create({ request, response, session, auth }: HttpContextContract) {
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
    
    console.log("Empresa: ", auth.user?.empresa_id);

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
          estado: request.input("estado") === 'null' ? 'GO' : request.input("uf"),
          empresa_id: auth.user?.empresa_id,
        });

        session.flash(
          "notification",
          "Cliente adicionado com sucesso!"
        );

      } else {
  
        const cliente = await Clientes.findOrFail(
          request.input("id")
        );

        cliente.cpfcnpj = request.input("cpfcnpj");
        cliente.nome = request.input("nome"),
        cliente.email = request.input("email") === 'null' ? ' ' : request.input("email") ,
        cliente.telefone = request.input("telefone"),
        cliente.registro = request.input("registro"),
        cliente.estadocivil = request.input("estadocivil"),
        cliente.naturalidade = request.input("naturalidade"),
        cliente.cep = request.input("cep") === 'null' ? '' : request.input("cep");
        cliente.logradouro = request.input("logradouro") === 'null' ? '' : request.input("logradouro") ;
        cliente.bairro = request.input("bairro") === 'null' ? '': request.input("bairro");
        cliente.cidade = request.input("cidade") === 'null' ? '' : request.input("cidade");
        cliente.estado = request.input("estado") === 'null' ? 'GO' : request.input("uf");

        await cliente.save();
        session.flash("notification", "Cliente alterado com sucesso!");
      }
    } catch (error) {
      console.log('Erro ao alterar', error);
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Cliente com o CPF/CNPJ ${validateData.cpfcnpj} já foi cadastrado.`;
      }
      session.flash("notification", msg);
    }
    return response.redirect("/clientes");
    //return response.redirect("back");
  }

  public async edit({ view, params }: HttpContextContract) {
    let objCliente = await Clientes.findOrFail(params.id);
    //const sacados = await Clientes.query().orderBy('nome', 'asc');



    return view.render("cliente", { objCliente });
  }

}
