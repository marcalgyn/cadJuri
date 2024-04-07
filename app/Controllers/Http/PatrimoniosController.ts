import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from "@ioc:Adonis/Core/Validator";
import Empresa from "App/Models/Empresa";
import Pessoa from "App/Models/Usuario";
import Departamento from "App/Models/Departamento";
import Patrimonio from "App/Models/Tribunal";
import { DateTime } from "luxon";
import moment from "moment";

export default class PatrimonioController {
  public async index({ view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const patrimonios = {
      id: 0,
      idEmpresa: 0,
      idUsuario: 0,
      idDepartamento: 0,
      dataCompra: DateTime.now(),
      dataGarantia: DateTime.now(),
      dataBaixa: null,
      descricao: "",
      gtin: "0",
      statusPatrimonio: "Novo",

    };
    return view.render("patrimonio", { patrimonios, empresas, pessoas, departamentos });
  }

  public async lista({ request, view } : HttpContextContract) {

    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const page = request.input("page", 1);
    const limit = 10;

    const patrimonios = await Patrimonio.query()

    .select("patrimonios.*")
    .select("empresas.razao_social")
    .select("departamentos.nome")
    .join("empresas", "empresas.id", "=", "patrimonios.id_empresa")
    .join("departamentos", "departamentos.id", "=", "patrimonios.id_departamento")
    .orderBy("data_garantia", "asc")
    .paginate(page, limit);

    patrimonios.baseUrl("lista");

    return view.render("listapatrimonio", { patrimonios, empresas, departamentos });

  }

  public async edit({ view, params } : HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();
    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const patrimonios = await Patrimonio.findOrFail(params.id);

    return view.render("patrimonio", { patrimonios, empresas, pessoas, departamentos });

  }


  public async create({ request, response, session }: HttpContextContract) {
    try {
      const validationSchema = schema.create({
        idEmpresa: schema.number(),
        idUsuario: schema.number(),
        idDepartamento: schema.number(),
        dataCompra: schema.date(),
        descricao: schema.string({trim: true}),
        statusPatrimonio: schema.string({ trim: true }),

      });


      const validateData = await request.validate({ schema: validationSchema });

      let urlDocumento: string = "";
      let urlGarantia: string = "";
      const fileDocumento = request.file("urlDocumento");
      if (fileDocumento) {
        const nomeImagem = this.normalizaNomeImagem(fileDocumento.clientName);
        urlDocumento = `/assets/img_patrimonio/${nomeImagem}`;
        await fileDocumento.move("public/assets/img_patrimonio", {
          name: nomeImagem,
          overwrite: true,
        });
      }

      const fileGarantia = request.file("urlGarantia");
      if (fileGarantia) {
        const nomeImagem = this.normalizaNomeImagem(fileGarantia.clientName);
        urlGarantia = `/assets/img_patrimonio/${nomeImagem}`;
        await fileGarantia.move("public/assets/img_patrimonio", {
          name: nomeImagem,
          overwrite: true,
        });
      }


      if (request.input("id") === "0") {
          await Patrimonio.create({
          idEmpresa: validateData.idEmpresa,
          idUsuario: validateData.idUsuario,
          idDepartamento: validateData.idDepartamento,
          dataCompra: validateData.dataCompra,
          descricao: validateData.descricao.toUpperCase(),
          gtin: request.input("gtin"),
          statusPatrimonio: validateData.statusPatrimonio,

        });
        session.flash("notification", "Patrimonio adicionado com sucesso!");
      } else {

        const patrimonio = await Patrimonio.findOrFail(request.input("id"));
        patrimonio.idEmpresa = request.input("empresa");
        patrimonio.idUsuario = request.input("idUsuario");
        patrimonio.idDepartamento = request.input("idDepartamento");
        patrimonio.dataCompra = request.input("dataCompra");
        patrimonio.dataGarantia = request.input("dataGarantia");
        patrimonio.dataBaixa = request.input("dataBaixa");
        patrimonio.descricao = request.input("descricao").toUpperCase();
        patrimonio.gtin = request.input("gtin");


        if (urlDocumento !== "") {
          patrimonio.urlDocumento = urlDocumento;
        }
        if (urlGarantia !== "") {
          patrimonio.urlGarantia = urlGarantia;
        }

        await patrimonio.save();


        session.flash("notification", "Patrimonio alterado com sucesso!");
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

  public async cancela({ response, session, params }: HttpContextContract) {
    const tarefa = await Patrimonio.findOrFail(params.id);

    tarefa.statusPatrimonio = "1";
    //tarefa.dataConclusao = DateTime.now();
    await tarefa.save();

   // await tarefa.delete();

    session.flash("notification", "Patrimonio Cancelada com sucesso!");

    return response.redirect("back");

  }

  public async filtro({ request, view }: HttpContextContract) {
    const empresas = await Empresa.all();
    const departamentos = await Departamento.all();

    const pessoas = await Pessoa.query()
      .where({ ativo: true, desligado: false })
      .orderBy("name");

    const page = request.input("page", 1);
    const limit = 10;

    const empresa = request.input("idEmpresa");
    const descricao =  request.input("descricao");
    const departamento = request.input("idDepartamento");

    const patrimonios = await Patrimonio.query()
    .join("empresas", "empresas.id", "=", "patrimonios.id_empresa")
    .join("departamentos", "departamentos.id", "=", "patrimonios.id_departamento")
    .where((query) => {
      if (empresa !== null) {
        query.andWhere("id_empresa", empresa);
      }
      if (descricao !== null) {
        query.andWhereILike("descricao ", "%" + descricao + "%");
      }
      if (departamento !== null ) {
        query.andWhere("id_departamento", departamento)
      }
    })
    .select("patrimonios.*")
    .select("empresas.razao_social")
    .select("departamentos.nome")
    .paginate(page, limit);

    patrimonios.baseUrl("lista");

    return view.render("listapatrimonio", {
      patrimonios,
      pessoas,
      empresas,
      departamentos
    });
  }


  /**
   * Retorna um DateTime Luxon
   */
  public convertStrToDateTime(dataInput: string, horaInput: string): any {
    const dataLuxon = DateTime.fromISO(
      dataInput.concat("T").concat(horaInput).concat(":00.000")
    );

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
