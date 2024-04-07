import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";


export default class EmpresasController {
  public async index({ view }: HttpContextContract) {
    

    const objEmpresa = {
      id: 0,
      cnpj: "",
      razaoSocial: "",
      email: "",
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "",
      complemento: "",
      telefone: "",
    };
    const empresas = await Empresa.query().orderBy("razaoSocial", "asc");

    return view.render("empresa", { objEmpresa, empresas, grupos });
  }

  public async edit({ view, params, request }: HttpContextContract) {
    const objEmpresa = await Empresa.findOrFail(params.id);
    const grupos = await Grupo.all();

    console.log("Editar");

    const page = request.input("page", 1);
    const limit = 10;
    const empresas = await Empresa.query()
      .orderBy("razaoSocial", "asc")
      .paginate(page, limit);

    empresas.baseUrl("/empresas");

    return view.render("empresa", { objEmpresa, empresas, grupos });
  }

  public async create({ request, response, session }: HttpContextContract) {
    const validationSchema = schema.create({
      cnpj: schema.string({ trim: true }, [rules.maxLength(18)]),
      razaoSocial: schema.string({ trim: true }, [rules.maxLength(255)]),
      email: schema.string({ trim: true }, [rules.maxLength(255)]),
      cep: schema.string({ trim: true }, [rules.maxLength(10)]),
      logradouro: schema.string({ trim: true }, [rules.maxLength(255)]),
      bairro: schema.string({ trim: true }, [rules.maxLength(100)]),
      cidade: schema.string({ trim: true }, [rules.maxLength(100)]),
      uf: schema.string({ trim: true }, [rules.maxLength(2)]),
    });


    const validateData = await request.validate({
      schema: validationSchema,
      messages: {
        "cnpj.required": "Informe o CNPJ da Empresa",
        "razaoSocial.required": "Informe a Razão Social da Empresa",
        "email.required": "Informe um email da empresa",
        "cep.required": "Informe o Cep",
      },
    });

    try {
      if (request.input("id") === "0") {
        await Empresa.create({
          grupo_id: request.input("grupo"),
          cnpj: validateData.cnpj,
          razaoSocial: validateData.razaoSocial,
          email: validateData.email,
          cep: validateData.cep,
          logradouro: validateData.logradouro,
          bairro: validateData.bairro,
          cidade: validateData.cidade,
          uf: validateData.uf,
          complemento: request.input("complemento"),
          telefone: request.input("telefone"),

        });
        session.flash("notification", "Empresa Cadastrada com sucesso!");
      } else {
        const empresa = await Empresa.findOrFail(request.input("id"));
        empresa.grupo_id = request.input("grupo");
        empresa.cnpj = request.input("cnpj");
        empresa.razaoSocial = request.input("razaoSocial");
        empresa.email = request.input("email");
        empresa.cep = request.input("cep");
        empresa.logradouro = request.input("logradouro");
        empresa.bairro = request.input("bairro");
        empresa.cidade = request.input("cidade");
        empresa.uf = request.input("uf");
        empresa.complemento = request.input("complemento");
        empresa.telefone = request.input("telefone");
        await empresa.save();
        session.flash("notification", "Empresa alterada com sucesso!");
      }
    } catch (error) {
      let msg: string = "";
      if (error.code === "ER_DUP_ENTRY") {
        msg = `Empresa com o CNPJ ${validateData.cnpj} já foi cadastrada.`;
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
