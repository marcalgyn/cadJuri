import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";


import Tarefa from "App/Models/Processo";


export default class DashboardController {
  public async index({ view }: HttpContextContract) {

       const tarPrioridade1 = await Tarefa.query()
        .select("tarefas.prioridade")
        .count("tarefas.prioridade", "quantidade")
        .where("prioridade", "1")
        .andWhereNull("tarefas.data_conclusao")


       const tarPrioridade2 = await Tarefa.query()
       .select("tarefas.prioridade")
       .count("tarefas.prioridade", "quantidade")
       .where("prioridade", "2")
       .andWhereNull("tarefas.data_conclusao")
       .groupBy("tarefas.prioridade")



       const tarPrioridade3 = await Tarefa.query()
          .select("tarefas.prioridade")
          .count("tarefas.prioridade", "quantidade")
          .where("prioridade", "3")
          .andWhereNull("tarefas.data_conclusao")
          .groupBy("tarefas.prioridade")




    return view.render("dashboard", { tarPrioridade1, tarPrioridade2, tarPrioridade3 });

  }
}
