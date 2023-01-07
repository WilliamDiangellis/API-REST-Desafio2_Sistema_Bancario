const validarDados = (nome, cpf, email, data_nascimento, telefone, senha, atualizar) => {
    if (atualizar) {
        if (!nome) {
            return "nome"
        }

        if (!data_nascimento) {
            return "data_nascimento"
        }

        if (!telefone) {
            return "telefone"
        }

        if (!senha) {
            return "senha"
        }
    } else {
        if (!nome) {
            return "nome"
        }

        if (!cpf) {
            return "cpf"
        }

        if (!data_nascimento) {
            return "data_nascimento"
        }

        if (!telefone) {
            return "telefone"
        }

        if (!email) {
            return "email"
        }

        if (!senha) {
            return "senha"
        }
    }
}


module.exports = {
    validarDados
}