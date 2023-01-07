const express = require("express");
const { criarContaBancaria, listarContasBancarias, atualizarDadosDoUsuarioDaConta, excluirUmaContaBancaria,
    DepositarEmUmaContaBancaria, sacarDeUmaContaBancaria, transferirValoresEntreContas,
    consultarSaldoDaContaBancaria,
    emitirExtratoBancario } = require("./controladores/operacoes");

const validarSenha = require("./intermediario");
const rotas = express();

rotas.get("/contas", validarSenha, listarContasBancarias);
rotas.post("/contas", criarContaBancaria);
rotas.put("/contas/:numeroConta/usuario", atualizarDadosDoUsuarioDaConta);
rotas.delete("/contas/:numeroConta", excluirUmaContaBancaria);
rotas.post("/transacoes/depositar", DepositarEmUmaContaBancaria);
rotas.post("/transacoes/sacar", sacarDeUmaContaBancaria);
rotas.post("/transacoes/transferir", transferirValoresEntreContas);
rotas.get("/contas/saldo", consultarSaldoDaContaBancaria);
rotas.get("/contas/extrato", emitirExtratoBancario);
module.exports = rotas;