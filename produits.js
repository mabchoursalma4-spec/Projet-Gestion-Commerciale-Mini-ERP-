let products = JSON.parse(localStorage.getItem("products")) || [];
let modal = new bootstrap.Modal(document.getElementById("productModal"));

function renderProducts() {
    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    products.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${p.nom}</td>
                <td>${p.categorie}</td>
                <td>${p.prix} MAD</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewProduct(${index})">Voir</button>
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${index})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

function openAddProduct() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter produit";
    modal.show();
}

document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("productId").value;
    const product = {
        nom: document.getElementById("nom").value,
        categorie: document.getElementById("categorie").value,
        prix: document.getElementById("prix").value,
        stock: document.getElementById("stock").value
    };

    if (id === "") {
        products.push(product);
    } else {
        products[id] = product;
    }

    localStorage.setItem("products", JSON.stringify(products));
    modal.hide();
    renderProducts();
});

function editProduct(index) {
    const p = products[index];
    document.getElementById("productId").value = index;
    document.getElementById("nom").value = p.nom;
    document.getElementById("categorie").value = p.categorie;
    document.getElementById("prix").value = p.prix;
    document.getElementById("stock").value = p.stock;
    document.getElementById("modalTitle").innerText = "Modifier produit";
    modal.show();
}

function deleteProduct(index) {
    if (confirm("Supprimer ce produit ?")) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
    }
}

renderProducts();

function viewProduct(index) {
    localStorage.setItem("selectedProduct", index);
    window.location.href = "produits-details.html";
}

function loadProductDetails() {
    const index = localStorage.getItem("selectedProduct");
    const products = JSON.parse(localStorage.getItem("products"));

    if (index === null || !products || !products[index]) return;

    const p = products[index];

    document.getElementById("detailNom").innerText = p.nom;
    document.getElementById("detailCategorie").innerText = p.categorie;
    document.getElementById("detailPrix").innerText = p.prix + " MAD";
    document.getElementById("detailStock").innerText = p.stock;
}

