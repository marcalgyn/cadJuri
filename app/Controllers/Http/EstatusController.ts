import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Empresa from "App/Models/Empresa";
import Estatus from "App/Models/Estatuses";


export default class GrupoController {
    public async index({ request, view, auth } : HttpContextContract) {
        const idEmpresa = auth.user?.empresa_id;

        const objEstatus = {
            id: 0,
            descricao : "",
            observacao : "",
        };

        const page = request.input("page", 1);
        const limit = 10;

        const estatus = await Estatus.query()
        .where('empresa_id', '=', Number(idEmpresa))
        .orderBy("descricao", "asc")
        .paginate(page, limit);
        
        estatus.baseUrl("/estatus");

        const empresas = await Empresa.query()
        .select('empresas.fantasia')
        .select('empresas.logo')
        .where('empresas.id', '=', Number(auth.user?.empresa_id));

        
        return view.render("estatus", { objEstatus, estatus, empresas } );
    }

    public async edit({view, params, request, auth} : HttpContextContract) {
        const idEmpresa = auth.user?.empresa_id;

        const objEstatus = await Estatus.findOrFail(params.id);

        const page = request.input("page", 1);
        const limit = 10;
        const estatus = await Estatus.query()
        .where('empresa_id', '=', Number(idEmpresa))
        .orderBy("descricao", "asc")
        .paginate(page, limit);

        estatus.baseUrl("/estatus");
        

        return view.render("estatus", {objEstatus, estatus});
    }

    public async create({request, response, session, auth} : HttpContextContract) {
        const idEmpresa = auth.user?.empresa_id;
        
        try {
            if (request.input("id") === "0") {
                const validationSchema = schema.create({
                    descricao : schema.string(),
                    observacao: schema.string(),
                })
                const validateData = await request.validate({
                    schema: validationSchema,
                    messages: {
                        "descricao.required": "informe a descrição",
                    },
                });

                await Estatus.create({
                    descricao: validateData.descricao,
                    observacao: validateData.observacao,
                    empresa_id: Number(idEmpresa)
                });
                session.flash("notification", "Estatus adicionado com sucesso!")
            } else {
                const estatus = await Estatus.findOrFail(request.input("id"));
                estatus.descricao = request.input("descricao");
                estatus.observacao = request.input("observacao");
                await estatus.save();
                session.flash("notification", "Estatus Alterado com sucesso!")
            }
        } catch (error) {
            console.log("erro Estatus", error);
            let msg: string = "";
            if (error.code === "ER_DUP_ENTRY") {
                msg = `Erro na operação solicitada!`;
              }
              session.flash("notification", msg);
        }
        //return response.redirect("back");
        return response.redirect("/estatus");

    }

    public async delete ({response, session,params} : HttpContextContract ) {
        const estatus = await Estatus.findOrFail(params.id);

        await estatus.delete();
        
        session.flash("notification", "Estatus excluído com sucesso!");

        return response.redirect("back");
    }
    
}
