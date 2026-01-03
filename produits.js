/*********************************
 * VARIABLES GLOBALES
 *********************************/
let products = [];
let modal = null;

/*********************************
 * INITIALISATION
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    // Initialiser le modal Bootstrap
    const modalEl = document.getElementById("productModal");
    if (modalEl) modal = new bootstrap.Modal(modalEl);

    // Charger les produits depuis le fichier JSON local (les changements sont en mémoire et volatiles)
    fetch("produits.json")
        .then(res => res.json())
        .then(data => {
            products = data;
            renderProducts();
        })
        .catch(err => {
            console.error("Erreur chargement produits.json :", err);
            products = [];
            renderProducts();
        });
});

/*********************************
 * AFFICHAGE TABLEAU
 *********************************/
function renderProducts() {
    const tbody = document.getElementById("productTableBody") || document.getElementById("setape");
    if (!tbody) return;

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Aucun produit disponible</td></tr>`;
        return;
    }

    const formatPrice = (p) => (typeof p === 'number' ? p.toFixed(2) : p);

    let html = "";
    products.forEach((p, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${p.nom}</td>
                <td>${p.categorie}</td>
                <td>${formatPrice(p.prix)} MAD</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewProduct(${p.id})">Voir</button>
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${p.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
} 

/*********************************
 * AJOUT PRODUIT
 *********************************/
function openAddProduct() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter produit";
    modal.show();
}

/*********************************
 * SUBMIT FORMULAIRE
 *********************************/
document.getElementById("productForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("productId").value;

    // Récupérer les valeurs
    const nom = document.getElementById("nom").value.trim();
    const categorie = document.getElementById("categorie").value.trim();
    const prix = Number(document.getElementById("prix").value);
    const stock = Number(document.getElementById("stock").value);

    // Validation simple
    if (!nom || !categorie || isNaN(prix) || isNaN(stock) || prix < 0 || stock < 0) {
        alert("Veuillez remplir correctement tous les champs.");
        return;
    }

    if (!products) products = [];

    if (id === "") {
        const newProduct = {
            id: Date.now(),
            nom,
            categorie,
            prix,
            stock
        };
        products.push(newProduct);
    } else {
        const idx = products.findIndex(p => String(p.id) === String(id));
        if (idx !== -1) {
            products[idx] = { ...products[idx], nom, categorie, prix, stock };
        }
    }

    if (modal) modal.hide();
    renderProducts();
});

/*********************************
 * MODIFIER PRODUIT
 *********************************/
function editProduct(id) {
    if (!products) products = [];
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("productId").value = p.id;
    document.getElementById("nom").value = p.nom;
    document.getElementById("categorie").value = p.categorie;
    document.getElementById("prix").value = p.prix;
    document.getElementById("stock").value = p.stock;

    document.getElementById("modalTitle").innerText = "Modifier produit";
    if (modal) modal.show();
} 

/*********************************
 * SUPPRIMER PRODUIT
 *********************************/
function deleteProduct(id) {
    if (!products) products = [];
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    if (confirm("Supprimer ce produit ?")) {
        products.splice(idx, 1);
        renderProducts();
    }
} 

/*********************************
 * PAGE DÉTAILS
 *********************************/
function viewProduct(id) {
    window.location.href = `produits-details.html?id=${id}`;
}

function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    if (!id) return;

    const show = (p) => {
        if (!p) return;
        document.getElementById("detailNom").innerText = p.nom;
        document.getElementById("detailCategorie").innerText = p.categorie;
        document.getElementById("detailPrix").innerText = Number(p.prix).toFixed(2) + " MAD";
        document.getElementById("detailStock").innerText = p.stock;
    };

    // chercher en mémoire
    if (products && products.length > 0) {
        const p = products.find(x => Number(x.id) === Number(id));
        if (p) { show(p); return; }
    }

    // sinon charger depuis JSON
    fetch("produits.json")
        .then(res => res.json())
        .then(data => {
            products = data;
            const p = products.find(x => Number(x.id) === Number(id));
            show(p);
        })
        .catch(err => console.error("Erreur chargement produits.json :", err));
}

/* =======================
   EXPORT PDF (simple — ouvre la boîte d'impression)
======================= */
function exportPDF() {
    // Si vous préférez générer un fichier PDF directement, on peut utiliser jsPDF.
    window.print();
}
