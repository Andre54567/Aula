const URL = "https://fvybhhuhalqdbnhctvav.supabase.co";

const KEY = "sb_publishable_S5756VjaOtEmRQ6MIySG7A_4tuqS42Y";

// SALVAR PRODUTO
async function salvar() {

    const nome = document.getElementById("nome").value.trim();
    const preco = document.getElementById("preco").value;
    const imagem = document.getElementById("imagem").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    const mensagem = document.getElementById("mensagem");
    mensagem.className = "";

    if (nome === "") {
        alert("Digite o nome do produto!");
        return;
    }

    const resposta = await fetch(
        URL + "/rest/v1/produtos",
        {
            method: "POST",

            headers: {
                "apikey": KEY,
                "Authorization": "Bearer " + KEY,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nome: nome,
                preco: preco === "" ? null : Number(preco),
                imagem: imagem === "" ? null : imagem,
                descricao: descricao === "" ? null : descricao
            })
        }
    );

    if (resposta.ok) {

        mensagem.innerText = "Produto salvo!";

        document.getElementById("nome").value = "";
        document.getElementById("preco").value = "";
        document.getElementById("imagem").value = "";
        document.getElementById("descricao").value = "";

        listarProdutos();

    } else {

        mensagem.className = "erro";
        mensagem.innerText = "Erro ao salvar. Veja o console (F12).";
        console.error(await resposta.text());

    }
}


// FORMATAR PREÇO (ex: 59.9 -> R$ 59,90)
function formatarPreco(valor) {
    if (valor === null || valor === undefined) {
        return "Preço não informado";
    }
    return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}


// LISTAR PRODUTOS
async function listarProdutos() {

    const resposta = await fetch(
        URL + "/rest/v1/produtos?select=*&order=id",
        {
            method: "GET",

            headers: {
                "apikey": KEY,
                "Authorization": "Bearer " + KEY
            }
        }
    );

    const produtos = await resposta.json();

    const lista = document.getElementById("lista");

    lista.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "vazio";
        vazio.innerText = "Nenhum produto cadastrado ainda.";
        lista.appendChild(vazio);
        return;
    }

    produtos.forEach(produto => {

        const card = document.createElement("article");
        card.className = "produto";

        // foto (com aviso se não houver imagem ou o link falhar)
        const foto = document.createElement("div");
        foto.className = "foto";

        if (produto.imagem) {
            const img = document.createElement("img");
            img.src = produto.imagem;
            img.alt = produto.nome;
            img.onerror = () => {
                foto.innerHTML = "";
                foto.innerText = "Imagem indisponível";
            };
            foto.appendChild(img);
        } else {
            foto.innerText = "Sem imagem";
        }

        // informações
        const info = document.createElement("div");
        info.className = "info";

        const titulo = document.createElement("h3");
        titulo.innerText = produto.nome;

        const preco = document.createElement("p");
        preco.className = "preco";
        preco.innerText = formatarPreco(produto.preco);

        const descricao = document.createElement("p");
        descricao.className = "descricao";
        descricao.innerText = produto.descricao || "";

        info.appendChild(titulo);
        info.appendChild(preco);
        info.appendChild(descricao);

        card.appendChild(foto);
        card.appendChild(info);
        lista.appendChild(card);

    });
}


// CARREGAR PRODUTOS AO ABRIR A PÁGINA
listarProdutos();
