const SUPABASE_URL = "https://fvybhhuhalqdbnhctvav.supabase.co";
const SUPABASE_KEY = "sb_publishable_S5756VjaOtEmRQ6MIySG7A_4tuqS42Y";

const loading = document.getElementById("product-loading");
const detail = document.getElementById("product-detail");
const errorPanel = document.getElementById("product-error");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productDescription = document.getElementById("product-description");
const productImage = document.getElementById("detail-visual");
const purchaseLink = document.getElementById("purchase-link");
const purchaseHelper = document.getElementById("purchase-helper");

function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
        return "Preço não informado";
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value));
}

function isHttpImageUrl(value) {
    if (!value) return false;

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function getSafePurchaseUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}

function showError(title, message) {
    loading.hidden = true;
    detail.hidden = true;
    errorPanel.hidden = false;
    document.getElementById("error-title").textContent = title;
    document.getElementById("error-message").textContent = message;
}

function showImagePlaceholder() {
    productImage.querySelector("img")?.remove();
    const placeholder = document.createElement("div");
    placeholder.className = "detail-placeholder";

    const mark = document.createElement("span");
    mark.className = "detail-placeholder-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "a.";

    const caption = document.createElement("span");
    caption.textContent = "IMAGEM NÃO DISPONÍVEL";
    placeholder.append(mark, caption);

    const existing = productImage.querySelector(".detail-placeholder");
    if (existing) existing.remove();
    productImage.appendChild(placeholder);
}

function renderProduct(product) {
    productName.textContent = product.nome || "Produto sem nome";
    productPrice.textContent = formatPrice(product.preco);
    productDescription.textContent = product.descricao || "Uma peça essencial para a sua coleção.";
    document.getElementById("breadcrumb-product").textContent = product.nome || "Produto";
    document.title = (product.nome || "Produto") + " | Aula";

    if (isHttpImageUrl(product.imagem)) {
        const existingPlaceholder = productImage.querySelector(".detail-placeholder");
        if (existingPlaceholder) existingPlaceholder.remove();

        const image = document.createElement("img");
        image.src = product.imagem;
        image.alt = product.nome ? "Imagem de " + product.nome : "Imagem do produto";
        image.loading = "eager";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", showImagePlaceholder, { once: true });
        productImage.appendChild(image);
    } else {
        showImagePlaceholder();
    }

    const purchaseUrl = getSafePurchaseUrl(product.link_compra);
    if (purchaseUrl) {
        purchaseLink.href = purchaseUrl;
        purchaseLink.hidden = false;
        purchaseHelper.hidden = true;
    } else {
        purchaseLink.hidden = true;
        purchaseHelper.textContent = "O link de compra ainda não foi configurado para este produto. Volte ao catálogo e escolha outra peça.";
        purchaseHelper.hidden = false;
    }

    loading.hidden = true;
    errorPanel.hidden = true;
    detail.hidden = false;
}

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");

    if (!rawId || !/^\d+$/.test(rawId)) {
        showError("Produto não identificado.", "Volte ao catálogo e selecione uma peça para ver seus detalhes.");
        return;
    }

    try {
        const url = SUPABASE_URL + "/rest/v1/produtos?id=eq." +
            encodeURIComponent(rawId) +
            "&select=id,nome,preco,imagem,descricao,link_compra&limit=1";

        const response = await fetch(url, {
            method: "GET",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: "Bearer " + SUPABASE_KEY
            }
        });

        if (!response.ok) {
            throw new Error("Não foi possível consultar os detalhes do produto.");
        }

        const result = await response.json();
        if (!Array.isArray(result) || result.length === 0) {
            showError("Não encontramos esta peça.", "Este produto pode ter sido removido ou o endereço pode estar incorreto.");
            return;
        }

        renderProduct(result[0]);
    } catch (error) {
        console.error("Erro ao carregar detalhes do produto:", error);
        showError("Não foi possível carregar esta peça.", "Confira sua conexão e tente abrir o produto novamente.");
    }
}

loadProduct();
