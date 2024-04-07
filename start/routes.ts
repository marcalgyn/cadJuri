import Route from "@ioc:Adonis/Core/Route";

Route.get("/", "HomeController.index").middleware("auth");
Route.get("/home", "HomeController.index").middleware("auth");
Route.post("/home/filter", "HomeController.filter").middleware("auth");
Route.post("/home/filterOS", "HomeController.filterOS").middleware("auth");
Route.get("/welcome", "HomeController.welcome").middleware("guest");

Route.group(() => {
  Route.get("/", "EmpresasController.index");
  Route.get("/:id", "EmpresasController.edit");
  Route.post("/", "EmpresasController.create");
  Route.post("/:id", "EmpresasController.create");
  Route.delete("/:id", "EmpresasController.delete");
})
  .prefix("/empresas")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "PessoasController.index");
  Route.get("/:id", "PessoasController.edit");
  Route.post("/", "PessoasController.create");
  Route.patch("/:id", "PessoasController.activate");
  Route.delete("/:id", "PessoasController.delete");
})
  .prefix("/pessoas")
  .middleware("auth");

  /*
Route.group(() => {
  Route.get("/", "TarefaController.index");
  Route.post("/filtro", "TarefaController.filtro");
  Route.get("/lista", "TarefaController.lista");
  Route.get("/:id", "TarefaController.edit");
  Route.post("/", "TarefaController.create");
  Route.patch("/:id", "TarefaController.finalize");
  Route.post("/:id", "TarefaController.cancela");
  
})
  .prefix("/tarefas")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "OrdemServicoController.index");
  Route.post("/filtro", "OrdemServicoController.filtro");
  Route.get("/lista", "OrdemServicoController.lista");
  Route.get("/:id", "OrdemServicoController.edit");
  Route.post("/", "OrdemServicoController.create");
  Route.patch("/:id", "OrdemServicoController.finalize");
  Route.post("/:id", "OrdemServicoController.cancela");
  Route.post("/listaOrcamento", "OrdemServicoController.filtro");
})
  .prefix("/ordensServicos")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "DepartamentosController.index");
  Route.get("/:id", "DepartamentosController.edit");
  Route.post("/", "DepartamentosController.create");
  Route.patch("/:id", "DepartamentosController.finalize");
  Route.delete("/:id", "DepartamentosController.delete");
})
  .prefix("/departamentos")
  .middleware("auth");

Route.group(() =>{
  Route.get("/", "GrupoController.index");
  Route.get("/:id", "GrupoController.edit");
  Route.post("/", "GrupoController.create");
  Route.patch("/:id", "GrupoController.finalize");
  Route.delete("/:id", "GrupoController.delete");
})
.prefix("/grupos")
.middleware("auth");

Route.group(() => {
  Route.get("/", "PatrimoniosController.index");
  Route.post("/filtro", "PatrimoniosController.filtro");
  Route.get("/lista", "PatrimoniosController.lista");
  Route.get("/:id", "PatrimoniosController.edit");
  Route.post("/", "PatrimoniosController.create");
  Route.patch("/:id", "PatrimoniosController.finalize");
  Route.delete("/:id", "PatrimoniosController.delete");
})
  .prefix("/patrimonios")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "ClienteSacadosController.index");
  Route.get("/:id", "ClienteSacadosController.edit");
  Route.post("/", "ClienteSacadosController.create");
})
  .prefix("/sacados")
  .middleware("auth");

Route.group(() => {
  Route.get("/", "ClienteSacadoresController.index");
  Route.get("/:id", "ClienteSacadoresController.edit");
  Route.post("/", "ClienteSacadoresController.create");
})
  .prefix("/sacadores")
  .middleware("auth");


Route.group(() => {
  Route.get("/lista", "TitulosController.lista");
  Route.post("/filtro", "TitulosController.filtro");
  Route.get("/", "TitulosController.index");
  Route.get("/:id", "TitulosController.edit");
  Route.get("/:id/load-rates", "TitulosController.loadRates");
  Route.post("/", "TitulosController.create");
  Route.patch("/:id/baixar", "TitulosController.baixarTitulo");
  Route.patch("/:id/estornar", "TitulosController.estornarTitulo");
  Route.delete("/:id", "TitulosController.delete");
})
  .prefix("/titulos")
  .middleware("auth");

  */
Route.group(() => {
  Route.get("/", "DashboardController.index");
})
  .prefix("/dashboard")
  .middleware("auth");

Route.get("/register", "AuthController.showRegister").middleware("guest");
Route.post("/register", "AuthController.register");
Route.post("/logout", "AuthController.logout");
Route.get("/login", "AuthController.showLogin").middleware("guest");
Route.post("/login", "AuthController.login");
