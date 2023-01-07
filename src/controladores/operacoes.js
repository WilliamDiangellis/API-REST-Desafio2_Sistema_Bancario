const { format } = require("date-fns");
const bancoDeDados = require("../bancodedados");
let { contas, saques, depositos, transferencias } = require("../bancodedados");
const { validarDados } = require("../utils");


let idNumeroConta = 1;

const listarContasBancarias = (req, res) => {

    return res.status(200).json(contas);
}

const criarContaBancaria = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const validacao = validarDados(nome, cpf, data_nascimento, email, telefone, senha, false);

    if (validacao) {
        return res.status(400).json({ mensagem: `O campo ${validacao} é obrigatório` });
    }

    const verificarCPF = contas.find(({ usuario }) => {
        return usuario.cpf === cpf;

    });

    if (verificarCPF) {
        return res.status(409).json({ mensagem: "Já existe uma conta com o cpf informado!" });
    }

    const verificarEmail = contas.find(({ usuario }) => {
        return usuario.email === email;
    });

    if (verificarEmail) {
        return res.status(409).json({ mensagem: "Já existe uma conta com o e-mail informado!" });
    }

    const contaBancaria = {
        numero: idNumeroConta.toString(),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    contas.push(contaBancaria);
    idNumeroConta++;

    return res.sendStatus(201);
}


const atualizarDadosDoUsuarioDaConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;

    const validacao = validarDados(nome, "", "", data_nascimento, telefone, senha, true);
    if (validacao) {
        return res.status(400).json({ mensagem: `O campo ${validacao} é obrigatório` });
    }

    const contaEncontrada = contas.find(conta => conta.numero === numeroConta);

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    }

    const { usuario } = contaEncontrada;

    if (cpf) {
        const verificarCPF = contas.find((conta) => {
            return conta.usuario.cpf === cpf && conta.numero !== numeroConta;
        });


        if (verificarCPF) {
            return res.status(409).json({ mensagem: "Já existe uma conta com o cpf informado!" });
        }
    }

    if (email) {
        const verificarEmail = contas.find((conta) => {
            return conta.usuario.email === email && conta.numero !== numeroConta;
        });

        if (verificarEmail) {
            return res.status(409).json({ mensagem: "Já existe uma conta com o e-mail informado!" });
        }
    }

    usuario.nome = nome;
    usuario.data_nascimento = data_nascimento;
    usuario.telefone = telefone;
    usuario.senha = senha;
    if (cpf) { usuario.cpf = cpf }
    if (email) { usuario.email = email }

    return res.status(201).json({});
}

const excluirUmaContaBancaria = (req, res) => {
    const { numeroConta } = req.params;

    const contaExistente = contas.find(conta => conta.numero === numeroConta);

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "A conta informada não existe" });
    }

    if (contaExistente.saldo > 0) {
        return res.status(400).json({ mensagem: "Não é possivel excluir uma conta que tenha saldo maior que zero (0)" });
    }

    contas = contas.filter((conta) => {
        return conta.numero !== numeroConta;
    });

    return res.send(204);
}

const DepositarEmUmaContaBancaria = (req, res) => {
    const { numero_conta, valor } = req.body;


    if (!numero_conta) {
        return res.status(400).json({ mensagem: "É obrigatório informar o número da conta" });
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "O valor deve ser um numero maior que zero" });
    }

    if (!valor) {
        return res.status(400).json({ mensagem: "É obrigatório informar o valor" });
    }

    const contaEncontrada = contas.find(conta => conta.numero == numero_conta);

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta não localizada" })
    }

    const { depositos } = bancoDeDados;

    contaEncontrada.saldo += valor;

    const registroDeDepositos = {
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta,
        valor
    }
    depositos.push(registroDeDepositos);


    return res.status(204).json({});
}

const sacarDeUmaContaBancaria = (req, res) => {
    const { numero_conta, senha, valor } = req.body;
    const { contas } = bancoDeDados;

    if (!numero_conta) {
        return res.status(400).json({ mensagem: "É obrigatório informar o número da conta" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "É obrigatório informar o senha" });
    }

    if (!valor) {
        return res.status(400).json({ mensagem: "É obrigatório informar o valor" });
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "O valor deve ser um numero maior que zero" });
    }

    const contaEncontrada = contas.find(conta => conta.numero == numero_conta);

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: "Conta não localizada" })
    }

    const { usuario, saldo } = contaEncontrada;

    if (senha !== usuario.senha) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    if (saldo < valor) {
        return res.status(400).json({ mensagem: "Saldo insuficiente" });
    }

    contaEncontrada.saldo -= valor;

    const registroDeSaques = {
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta,
        valor
    }
    const { saques } = bancoDeDados;
    saques.push(registroDeSaques);

    return res.status(200).json({});
}

const transferirValoresEntreContas = (req, res) => {

    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem) {
        return res.status(400).json({ mensagem: "É obrigatório informar o número da conta de origem" });
    }

    if (!numero_conta_destino) {
        return res.status(400).json({ mensagem: "É obrigatório informar o número da conta de destino" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "É obrigatório informar a senha da conta de origem" });
    }

    if (!valor || valor <= 0) {
        return res.status(400).json({ mensagem: "É necessario informar um valor maior que zero" });
    }

    const contaOrigem = contas.find((conta) => {
        return conta.numero === numero_conta_origem;
    });

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: "Conta de origem não encontrada" });
    }

    const contaDestino = contas.find((conta) => {
        return conta.numero === numero_conta_destino;
    });

    if (!contaDestino) {
        return res.status(404).json({ mensagem: "Conta de destino não encontrada" });
    }

    if (contaOrigem === contaDestino) {
        return res.status(400).json({ mensagem: "A Conta de origem deve ser diferente da conta de destino" });
    }

    if (senha !== contaOrigem.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    if (contaOrigem.saldo < valor) {
        return res.status(400).json({ mensagem: "Saldo insuficiente" });
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const registroDeTransferencias = {
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }
    const { transferencias } = bancoDeDados;
    transferencias.push(registroDeTransferencias);

    return res.status(200).json({});
}

const consultarSaldoDaContaBancaria = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta) {
        return res.status(400).json({ mensagem: "É necessário informar o número da conta" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "É necessário informar a senha" });
    }

    const contaInformada = contas.find(conta => conta.numero === numero_conta);

    if (!contaInformada) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    }

    if (contaInformada.usuario.senha !== senha) {
        return res.status(403).json({ mensagem: "Senha inválida" });
    }

    return res.status(200).json({ saldo: contaInformada.saldo });
}

const emitirExtratoBancario = (req, res) => {
    const { numero_conta, senha } = req.query;
    if (!numero_conta) {
        return res.status(400).json({ mensagem: "É necessário informar o número da conta" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "É necessário informar a senha" });
    }

    const contaInformada = contas.find(conta => conta.numero === numero_conta);

    if (!contaInformada) {
        return res.status(404).json({ mensagem: "Conta não encontrada" });
    }

    if (contaInformada.usuario.senha !== senha) {
        return res.status(403).json({ mensagem: "Senha inválida" });
    }

    const saquesRealizados = saques.filter(saque => saque.numero_conta === numero_conta);
    const depositosRealizados = depositos.filter(deposito => deposito.numero_conta === numero_conta);
    const transferenciasRealizadas = transferencias.filter(transferencia => transferencia.numero_conta_origem === numero_conta);
    const transferenciasRecebidas = transferencias.filter(transferencia => transferencia.numero_conta_destino === numero_conta);

    return res.status(200).json({ depositos: depositosRealizados, saques: saquesRealizados, transferenciasRealizadas, transferenciasRecebidas });
}

module.exports = {
    criarContaBancaria,
    listarContasBancarias,
    atualizarDadosDoUsuarioDaConta,
    excluirUmaContaBancaria,
    DepositarEmUmaContaBancaria,
    sacarDeUmaContaBancaria,
    transferirValoresEntreContas,
    consultarSaldoDaContaBancaria,
    emitirExtratoBancario
}

//ctrl + clicar no caminho => acessa o arquivo do caminho
//ctrl + espaço => auxilia no melhor código/indica as possibilidades
//ctrl + D => seleciona palavra repetidas => Backspace apaga
//Fn + F2 => seleciona variaveis repetidas
//https://github.com/features/copilot
//console.log(typeof valor)

// 200 (OK) = requisição bem sucedida
// 201 (Created) = requisição bem sucedida e algo foi criado
// 204 (No Content) = requisição bem sucedida, sem conteúdo no corpo da resposta
// 400 (Bad Request) = o servidor não entendeu a requisição pois está com uma sintaxe/formato inválido
// 401 (Unauthorized) = o usuário não está autenticado (logado)
// 403 (Forbidden) = o usuário não tem permissão de acessar o recurso solicitado
// 404 (Not Found) = o servidor não pode encontrar o recurso solicitado
// 500 (Internal Server Error) = falhas causadas pelo servidor