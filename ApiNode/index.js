const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000; //porta padrão
const mysql = require("mysql");
const validations = require("./validations");
const create = require("./create-table");
// const { func } = require("joi");

create.conectar();

//função abaixo serve apara permitir requisisões
//resolve erro de cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, application/json, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var caminhoURL = "localhost";
//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get("/", (req, res) => res.json({ message: "Funcionando!" }));
app.use("/", router);

//inicia o servidor
app.listen(port);
console.log("API funcionando!");

//dados do banco de dados
function execSQLQuery(sqlQry, res) {
  const connection = mysql.createConnection({
    host: caminhoURL,
    port: 3306,
    user: "root",
    password: "",
    database: "hoteldatabase",
  });

  connection.query(sqlQry, function (error, results, fields) {
    if (error) {
      res.json(error);
    } else {
      // if (res.json(results.quartoDisponivel == 0)) {
      //   res.json(result)
      //   connection.end();
      //   console.log("executou!");
      // }
      
      res.json(results);
    }
  });
}


//verificação se quarto está ou não  ocupado
function getId(result) {
  let r = [];
  result.forEach((element) => {
    if(element.quartoDisponivel == 0){
      element.quartoDisponivel = "Disponível"
    }
    else{
      element.quartoDisponivel = "Ocupado"
    }
  });
  return result;
}

//lista todos clientes
router.get("/clientes", (req, res) => {
  execSQLQuery("SELECT * FROM funcionario", res);
});

//lista um cliente
router.get("/clientes/:id?", (req, res) => {
  let filter = "";
  if (req.params.id) filter = " WHERE ID=" + parseInt(req.params.id);
  execSQLQuery("SELECT * FROM Clientes " + filter, res);
});

//lista um cliente pelo nome
router.get("/clientes/nome/:nome?", (req, res) => {
  let filter = "";
  if (req.params.nome) filter = " WHERE Nome=" + '"' + req.params.nome + '"';
  execSQLQuery("SELECT * FROM clientes" + filter, res);
});

//delete de um cliente
router.delete("/clientes/:id", (req, res) => {
  execSQLQuery("DELETE FROM funcionario WHERE funcionarioID=" + parseInt(req.params.id), res);
});

//adcionando um cliente
router.post("/clientes", (req, res) => {
  const quartoNumero = req.body.quartoNumero.substring(0, 150);
  const quartoDisponivel = req.body.quartoDisponivel;
  parseInt(quartoNumero);

  // const val1 = validations.userSchema.validate({
  //   nome: nome,
  //   cpf: cpf,
  // });

  // if (!val1.err) {
  execSQLQuery(
    `INSERT INTO quarto(quartoNumero, quartoDisponivel) VALUES('${quartoNumero}','${quartoDisponivel}')`,
    res
  );
  // } else {
  //   res.status(400).json({ msgErro: "Erro: Valores incorretos", nome, cpf });
  // }
});

//update
router.patch("/clientes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const nome = req.body.Nome.substring(0, 150);
  const cpf = req.body.CPF.substring(0, 11);
  execSQLQuery(
    `UPDATE Clientes SET Nome='${nome}', CPF='${cpf}' WHERE ID=${id}`,
    res
  );
});
