const bancoDeDados = require("./bancodedados");

const validarSenha = (req, res, next) => {
    const { senha } = req.query;

    if (senha !== bancoDeDados.banco.senha) {
        return res.status(401).json({ mensagem: "A senha está incorreta" });
    }

    next();
}

module.exports = validarSenha;