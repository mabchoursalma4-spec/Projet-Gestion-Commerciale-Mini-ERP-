/*************************************************
 * VARIABLES GLOBALES
 *************************************************/
let commandes = [];
let commandeModal = null;

/*************************************************
 * INITIALISATION
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

    // Initialiser le modal (uniquement sur commandes.html)
    const modalEl = document.getElementById("commandeModal");
    if (modalEl) {
        commandeModal = new bootstrap.Modal(modalEl);
    }

    // Attacher l'événement submit au formulaire
    const form = document.getElementById("commandeForm");
    if (form) {
        form.addEventListener("submit", handleSubmitCommande);
    }

    // Si on est sur la page liste → charger les commandes
    if (document.getElementById("commandesTableBody")) {
        fetchCommandes();
    }
});

/*************************************************
 * FETCH COMMANDES (API PUBLIQUE)
 *************************************************/
function fetchCommandes() {
    fetch("https://dummyjson.com/carts")
        .then(res => res.json())
        .then(data => {
            commandes = data.carts.map(cart => ({
                id: cart.id,
                client: "Client #" + cart.userId,
                date: new Date().toISOString().split("T")[0],
                total: cart.total,
                statut: "En attente"
            }));
            renderCommandes();
        })
        .catch(err => console.error("Erreur chargement commandes :", err));
}

/*************************************************
 * AFFICHAGE TABLE
 *************************************************/
function renderCommandes() {
    const tbody = document.getElementById("commandesTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    commandes.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${c.client}</td>
                <td>${c.date}</td>
                <td>${c.total} DH</td>
                <td>
                    <span class="badge bg-warning text-dark">
                        ${c.statut}
                    </span>
                </td>
                <td>
                    <a href="commandes-details.html?id=${c.id}"
                       class="btn btn-sm btn-info">
                        Détails
                    </a>
                    <button class="btn btn-sm btn-danger"
                        onclick="deleteCommande(${c.id})">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    });
}

/*************************************************
 * OUVERTURE MODAL
 *************************************************/
function openAddCommande() {
    document.getElementById("commandeForm").reset();
    commandeModal.show();
}

/*************************************************
 * CREATE COMMANDE
 *************************************************/
function handleSubmitCommande(e) {
    e.preventDefault();

    const newCommande = {
        id: Date.now(),
        client: document.getElementById("client").value,
        date: document.getElementById("date").value,
        statut: document.getElementById("statut").value,
        total: Math.floor(Math.random() * 3000) + 200
    };

    commandes.unshift(newCommande);
    commandeModal.hide();
    renderCommandes();
}

/*************************************************
 * DELETE COMMANDE
 *************************************************/
function deleteCommande(id) {
    if (!confirm("Supprimer cette commande ?")) return;
    commandes = commandes.filter(c => c.id !== id);
    renderCommandes();
}

/*************************************************
 * PAGE DETAILS COMMANDE
 *************************************************/
function loadCommandeDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    fetch("https://dummyjson.com/carts/" + id)
        .then(res => res.json())
        .then(cart => {
            document.getElementById("detailClient").textContent =
                "Client #" + cart.userId;

            document.getElementById("detailDate").textContent =
                new Date().toLocaleDateString();

            document.getElementById("detailTotal").textContent =
                cart.total + " DH";

            document.getElementById("detailStatut").textContent =
                "En attente";
        })
        .catch(() => {
            alert("Impossible de charger les détails de la commande");
        });
}

/*************************************************
 * EXPORT PDF (SIMPLE)
 *************************************************/
function exportCommandePDF() {
    window.print();
}
