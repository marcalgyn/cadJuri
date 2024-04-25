import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";


export default class EmpresasController {
  public async index({ view, auth }: HttpContextContract) {
    const objEmpresa = {
      id: 0,
      cpfcnpj: "",
      razaosocial: "",
      fantasia: "",
      email: "",
      registro: "",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      estado: "",
      telefone: "",
      cor : "",
      logo: "",
    };
    
    //const empresas = await Empresa.query().orderBy("razaoSocial", "asc");
    const empresas = await Empresa.query()
    .select('empresas.*')
        .where('empresas.id', '=', Number(auth.user?.empresa_id))
        .orderBy("razaoSocial", "asc") ;

    return view.render("empresa", { objEmpresa, empresas });

  }

  public async edit({ view, params, request }: HttpContextContract) {
    const objEmpresa = await Empresa.findOrFail(params.id);
    console.log("Editar");

    const page = request.input("page", 1);
    const limit = 10;
    const empresas = await Empresa.query()
      .orderBy("razaosocial", "asc")
      .paginate(page, limit);

    empresas.baseUrl("/empresas");

    return view.render("empresa", { objEmpresa, empresas});

  }

  public async create({ request, response, session, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      cpfcnpj: schema.string({ trim: true }, [rules.maxLength(18)]),
      razaosocial: schema.string({ trim: true }, [rules.maxLength(255)]),
      email: schema.string({ trim: true }, [rules.maxLength(255)]),
      cep: schema.string({ trim: true }, [rules.maxLength(10)]),
      logradouro: schema.string({ trim: true }, [rules.maxLength(255)]),
      bairro: schema.string({ trim: true }, [rules.maxLength(100)]),
      cidade: schema.string({ trim: true }, [rules.maxLength(100)]),
      estado: schema.string({ trim: true }, [rules.maxLength(2)]),
    });


    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "cpfcnpj.required": "Informe o CPF/CNPJ da Empresa",
        "razaosocial.required": "Informe a Razão Social da Empresa",
        "email.required": "Informe um email da empresa",
        "cep.required": "Informe o Cep",
      },
    });

    try {
      if (request.input("id") === "0" && auth.user?.nivel === "9")  {
        await Empresa.create({
          cpfcnpj: validateData.cpfcnpj,
          razaosocial: validateData.razaosocial === null ? '' : validateData.razaosocial.toUpperCase(),
          fantasia: request.input('fantasia') === null ? '' : request.input('fantasia').toUpperCase(),
          registro: request.input('registro'),
          email: validateData.email === null ? '' : validateData.email.toLowerCase(),
          cep: validateData.cep,
          logradouro: validateData.logradouro === null ? '' : validateData.logradouro.toUpperCase(),
          bairro: validateData.bairro === null ? '' : validateData.bairro.toUpperCase(),
          cidade: validateData.cidade ===null ? '' : validateData.cidade.toUpperCase(),
          estado: validateData.estado === null ? '' : validateData.estado.toUpperCase(),
          telefone: request.input("telefone"),
          cor: request.input('cor'),
          logo: request.input('logo'),

        });
        session.flash("notification", "Empresa Cadastrada com sucesso!");
      } else {
        const empresa = await Empresa.findOrFail(request.input("id"));
        empresa.cpfcnpj = request.input("cpfcnpj");
        empresa.razaosocial = request.input("razaosocial") === null ? '' : request.input("razaosocial").toUpperCase();
        empresa.fantasia = request.input("fantasia") === null ? '' : request.input("fantasia").toUpperCase();
        empresa.email = request.input("email") === null ? '' : request.input("email").toLowerCase();
        empresa.cep = request.input("cep");
        empresa.logradouro = request.input("logradouro") === null ? '' : request.input("logradouro").toUpperCase();
        empresa.bairro = request.input("bairro") === null ? '' : request.input("bairro").toUpperCase();
        empresa.cidade = request.input("cidade") === null ? '' : request.input("cidade").toUpperCase();
        empresa.estado = request.input("estado") === null ? '' : request.input("estado").toUpperCase();
        empresa.telefone = request.input("telefone");
        await empresa.save();
        session.flash("notification", "Empresa alterada com sucesso!");
      }
    } catch (error) {
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Empresa com o CNPJ ${validateData.cpfcnpj} já foi cadastrada.`;
      }
      session.flash("notification-danger", msg);
    }

    return response.redirect("back");
  }

  public async delete({ response, session, params }: HttpContextContract) {
    const empresa = await Empresa.findOrFail(params.id);

    await empresa.delete();

    session.flash("notification", "Empresa excluída com sucesso!");

    return response.redirect("back");
  }
}
