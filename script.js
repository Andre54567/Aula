const SUPABASE_URL = "https://fvybhhuhalqdbnhctvav.supabase.co";
const SUPABASE_KEY = "sb_publishable_S5756VjaOtEmRQ6MIySG7A_4tuqS42Y";

const form = document.getElementById("form-produto");
const productList = document.getElementById("lista");
const searchInput = document.getElementById("busca");
const countLabel = document.getElementById("contagem");
const catalogMessage = document.getElementById("mensagem-catalogo");
const formMessage = document.getElementById("mensagem");
const saveButton = document.getElementById("botao-salvar");

let products = [];
let revealObserver = null;

function renderHeroFeature() {
    const featureLink = document.getElementById("hero-feature-link");
    const featureImage = document.getElementById("hero-feature-image");
    const featureName = document.getElementById("hero-feature-name");
    const featurePrice = document.getElementById("hero-feature-price");
    if (!featureLink || !featureImage || !featureName || !featurePrice) return;

    const product = products[0];
    const existingImage = featureImage.querySelector("img");
    if (existingImage) existingImage.remove();
    featureImage.querySelector(".hero-image-placeholder")?.remove();

    if (!product) {
        featureLink.href = "#catalogo";
        featureLink.setAttribute("aria-label", "Explorar a coleção Aula");
        featureName.textContent = "A coleção começa aqui.";
        featurePrice.textContent = "Descubra a seleção ↗";
        const fallback = document.createElement("div");
        fallback.className = "hero-image-placeholder";
        fallback.innerHTML = '<span class="hero-placeholder-mark">A.</span><span>IMAGEM DA COLEÇÃO</span>';
        featureImage.appendChild(fallback);
        return;
    }

    featureLink.href = "produto.html?id=" + encodeURIComponent(product.id);
    featureLink.setAttribute("aria-label", "Ver detalhes de " + (product.nome || "produto"));
    featureName.textContent = product.nome || "Produto em destaque";
    featurePrice.textContent = formatPrice(product.preco);

    if (isSafeImageUrl(product.imagem)) {
        const image = document.createElement("img");
        image.src = product.imagem;
        image.alt = product.nome ? "Em destaque: " + product.nome : "Produto em destaque";
        image.loading = "eager";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", () => {
            image.remove();
            const fallback = document.createElement("div");
            fallback.className = "hero-image-placeholder";
            fallback.innerHTML = '<span class="hero-placeholder-mark">A.</span><span>IMAGEM NÃO DISPONÍVEL</span>';
            featureImage.appendChild(fallback);
        }, { once: true });
        featureImage.appendChild(image);
    } else {
        const fallback = document.createElement("div");
        fallback.className = "hero-image-placeholder";
        fallback.innerHTML = '<span class="hero-placeholder-mark">A.</span><span>IMAGEM DA COLEÇÃO</span>';
        featureImage.appendChild(fallback);
    }
}

function observeReveal(element, delay = 0) {
    if (!revealObserver || !element) return;
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${delay}ms`);
    revealObserver.observe(element);
}

function initializeScrollAnimations() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-enabled");
    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -7% 0px",
        threshold: 0.12
    });

    const targets = document.querySelectorAll(
        ".hero-copy, .hero-art, .section-heading, .manage-copy, .product-form, .footer-inner, .manifesto-main, .manifesto-copy"
    );
    targets.forEach((element, index) => observeReveal(element, (index % 3) * 90));
}

function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
        return "Preço não informado";
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(value));
}

function setFormMessage(message, type = "") {
    formMessage.textContent = message;
    formMessage.className = type ? `form-message ${type}` : "form-message";
}

function isSafeImageUrl(value) {
    if (!value) return false;

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function isSafePurchaseUrl(value) {
    if (!value) return false;

    try {
        const url = new URL(value);
        return url.protocol === "https:";
    } catch {
        return false;
    }
}

function createImage(product) {
    const wrapper = document.createElement("div");
    wrapper.className = "product-image";

    const index = document.createElement("span");
    index.className = "product-index";
    index.textContent = "AULA / ESSENCIAL";
    wrapper.appendChild(index);

    if (isSafeImageUrl(product.imagem)) {
        const image = document.createElement("img");
        image.src = product.imagem;
        image.alt = product.nome ? `Imagem de ${product.nome}` : "Imagem do produto";
        image.loading = "lazy";
        image.decoding = "async";
        image.referrerPolicy = "no-referrer";
        image.onerror = () => {
            image.remove();
            wrapper.appendChild(createImagePlaceholder());
        };
        wrapper.appendChild(image);
    } else {
        wrapper.appendChild(createImagePlaceholder());
    }

    return wrapper;
}

function createImagePlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";

    const symbol = document.createElement("span");
    symbol.className = "image-placeholder-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "a.";

    const label = document.createElement("span");
    label.textContent = "IMAGEM EM BREVE";

    placeholder.append(symbol, label);
    return placeholder;
}

function createEmptyState(title, description) {
    const empty = document.createElement("div");
    empty.className = "catalog-empty";

    const symbol = document.createElement("span");
    symbol.className = "catalog-empty-symbol";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "✳";

    const heading = document.createElement("strong");
    heading.textContent = title;

    const paragraph = document.createElement("span");
    paragraph.textContent = description;

    empty.append(symbol, heading, paragraph);
    return empty;
}

function renderProducts() {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = products.filter((product) => {
        const searchable = [
            product.nome,
            product.descricao,
            product.preco === null ? "" : String(product.preco)
        ].join(" ").toLocaleLowerCase("pt-BR");

        return searchable.includes(query);
    });

    productList.replaceChildren();
    productList.setAttribute("aria-busy", "false");
    catalogMessage.textContent = "";

    const count = filtered.length;
    countLabel.textContent = query
        ? `${count} ${count === 1 ? "resultado" : "resultados"}`
        : `${products.length} ${products.length === 1 ? "peça disponível" : "peças disponíveis"}`;

    if (count === 0) {
        const empty = query
            ? createEmptyState("Nenhuma peça encontrada", "Tente buscar por outro nome ou descrição.")
            : createEmptyState("A coleção começa aqui.", "Adicione a primeira peça usando o formulário abaixo.");
        productList.appendChild(empty);
        return;
    }

    filtered.forEach((product, position) => {
        const card = document.createElement("a");
        card.className = "product-card";
        card.href = "produto.html?id=" + encodeURIComponent(product.id);
        card.setAttribute("aria-label", "Ver detalhes de " + (product.nome || "produto"));

        const visual = createImage(product);
        const info = document.createElement("div");
        info.className = "product-info";

        const titleRow = document.createElement("div");
        titleRow.className = "product-title-row";

        const title = document.createElement("h3");
        title.className = "product-title";
        title.textContent = product.nome || "Produto sem nome";

        const number = document.createElement("span");
        number.className = "product-number";
        number.textContent = String(position + 1).padStart(2, "0");

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatPrice(product.preco);

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.descricao || "Uma peça essencial para a sua coleção.";

        titleRow.append(title, number);
        info.append(titleRow, price, description);
        card.append(visual, info);
        productList.appendChild(card);
        observeReveal(card, Math.min(position, 5) * 65);
    });
}

async function listarProdutos() {
    productList.setAttribute("aria-busy", "true");
    catalogMessage.textContent = "";

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/produtos?select=id,nome,preco,imagem,descricao,link_compra&order=id.desc`,
            {
                method: "GET",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Falha ao carregar produtos (HTTP ${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("A resposta do catálogo veio em um formato inesperado.");
        }

        products = data;
        renderHeroFeature();
        renderProducts();
    } catch (error) {
        productList.replaceChildren(
            createEmptyState("Não foi possível carregar a coleção", "Confira sua conexão e tente novamente.")
        );
        productList.setAttribute("aria-busy", "false");
        countLabel.textContent = "Catálogo indisponível";
        catalogMessage.textContent = "Não conseguimos acessar os produtos agora.";
        console.error("Erro ao carregar produtos:", error);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage("");

    const nome = document.getElementById("nome").value.trim();
    const precoInput = document.getElementById("preco").value;
    const preco = precoInput === "" ? null : Number(precoInput);
    const imagem = document.getElementById("imagem").value.trim();
    const linkCompra = document.getElementById("link_compra").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    if (!nome) {
        setFormMessage("Informe o nome do produto.", "error");
        document.getElementById("nome").focus();
        return;
    }

    if (preco === null || !Number.isFinite(preco) || preco < 0) {
        setFormMessage("Informe um preço válido.", "error");
        document.getElementById("preco").focus();
        return;
    }

    if (imagem && !isSafeImageUrl(imagem)) {
        setFormMessage("Use um link de imagem válido começando com http:// ou https://.", "error");
        document.getElementById("imagem").focus();
        return;
    }

    if (linkCompra && !isSafePurchaseUrl(linkCompra)) {
        setFormMessage("O link de compra deve ser uma URL HTTPS segura.", "error");
        document.getElementById("link_compra").focus();
        return;
    }

    saveButton.disabled = true;
    saveButton.querySelector("span:first-child").textContent = "Salvando...";
    setFormMessage("Salvando produto...");

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/produtos`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                nome,
                preco,
                imagem: imagem || null,
                link_compra: linkCompra || null,
                descricao: descricao || null
            })
        });

        if (!response.ok) {
            const details = await response.text();
            console.error("Supabase recusou o cadastro:", details);
            throw new Error("Não foi possível salvar. Confira as permissões do banco de dados.");
        }

        form.reset();
        setFormMessage("Produto adicionado à coleção.");
        await listarProdutos();
        document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        setFormMessage(error.message || "Ocorreu um erro ao salvar. Tente novamente.", "error");
        console.error("Erro ao salvar produto:", error);
    } finally {
        saveButton.disabled = false;
        saveButton.querySelector("span:first-child").textContent = "Salvar produto";
    }
});

searchInput.addEventListener("input", renderProducts);

initializeScrollAnimations();
listarProdutos();
