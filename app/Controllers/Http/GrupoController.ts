import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Grupo from "App/Models/Estatus";


export default class GrupoController {
    public async index({ request, view } : HttpContextContract) {
        const objGrupo = {
            id: 0,
            nome : "",
            observacao : "",
        };

        const page = request.input("page", 1);
        const limit = 10;
        const grupos = await Grupo.query()
            .orderBy("nome", "asc")
            .paginate(page, limit);
        
        grupos.baseUrl("/grupos");

        
        return view.render("grupo", { objGrupo, grupos } );
    }

    public async edit({view, params, request} : HttpContextContract) {
        const objGrupo = await Grupo.findOrFail(params.id);

        const page = request.input("page", 1);
        const limit = 10;
        const grupos = await Grupo.query()
        .orderBy("nome", "asc")
        .paginate(page, limit);

        grupos.baseUrl("/grupos");
        

        return view.render("grupos", {objGrupo, grupos});
    }

    public async create({request, response, session} : HttpContextContract) {
        try {
            if (request.input("id") === "0") {
                const validationSchema = schema.create({
                    nome : schema.string(),
                    observacao: schema.string(),
                })
                const validateData = await request.validate({
                    schema: validationSchema,
                    messages: {
                        "nome.required": "informe o nome do grupo",
                    },
                });

                await Grupo.create({
                    nome: validateData.nome,
                    observacao: validateData.observacao,

                });
                session.flash("notification", "Grupo adicionado com sucesso!")
            } else {
                const grupo = await Grupo.findOrFail(request.input("id'"));
                grupo.nome = request.input("nome");
                grupo.observacao = request.input("observacao");
                await grupo.save();
                session.flash("notification", "Grupo Alterado com sucesso!")
            }
        } catch (error) {
            console.log("erro Grupo", error);
            let msg: string = "";
            if (error.code === "ER_DUP_ENTRY") {
                msg = `Erro na operação solicitada!`;
              }
              session.flash("notification", msg);
        }
        return response.redirect("back");

    }

    public async delete ({response, session,params} : HttpContextContract ) {
        const grupo = await Grupo.findOrFail(params.id);

        await grupo.delete();
        
        session.flash("notification", "Grupo excluído com sucesso!");

        return response.redirect("back");
    }
    
}
