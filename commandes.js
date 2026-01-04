/*****************************************
 * CRUD COMMANDES - localStorage
 * Inspiré de `utilisateur.js` : get/save, modal Bootstrap, handlers
 *****************************************/

const COMMANDES_KEY = "erp_commandes";
let commandeModalInstance = null;
// Liste en mémoire des commandes (peuvent venir de commandes.json)
let commandes = [];

document.addEventListener("DOMContentLoaded", () => {
    // Préparer le modal si présent
    const modalEl = document.getElementById("commandeModal");
    if (modalEl && window.bootstrap) {
        commandeModalInstance = new bootstrap.Modal(modalEl);
    }

    // Brancher le submit si le formulaire existe
    const form = document.getElementById("commandeForm");
    if (form) form.addEventListener("submit", onSubmitCommandeForm);

    // Charger la liste si on est sur la page de liste
    loadCommandes();
});

/* =======================
   STORAGE
======================= */
function getCommandes() {
    return JSON.parse(localStorage.getItem(COMMANDES_KEY)) || [];
}

function saveCommandes(data) {
    localStorage.setItem(COMMANDES_KEY, JSON.stringify(data));
}

/* =======================
   LISTE / RENDER (depuis commandes.json)
   Les opérations (ajout/modif/suppression) modifient la variable en mémoire `commandes`.
   Note: les changements sont volatiles (perdus au rechargement) — dites-moi si vous voulez la persistance.
======================= */
function loadCommandes() {
    const tbody = document.getElementById("commandesTableBody");
    if (!tbody) return; // si on est sur details.html, pas de table

    // Charger directement depuis le fichier JSON local
    fetch("commandes.json")
        .then(res => res.json())
        .then(data => {
            commandes = data;
            renderCommandes();
        })
        .catch(err => {
            console.error("Erreur chargement commandes.json :", err);
            commandes = [];
            renderCommandes();
        });
}

function renderCommandes() {
    const tbody = document.getElementById("commandesTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!commandes || commandes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucune commande</td>
            </tr>
        `;
        return;
    }

    commandes.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(c.client)}</td>
                <td>${escapeHtml(c.date)}</td>
                <td>${Number(c.total).toFixed(2)} DH</td>
                <td>
                    <span class="badge ${c.statut === 'Livrée' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${escapeHtml(c.statut)}
                    </span>
                </td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info" href="commandes-details.html?id=${c.id}">Détails</a>
                    <button class="btn btn-sm btn-warning" type="button" onclick="editCommande(${c.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" type="button" onclick="deleteCommande(${c.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

/* =======================
   INIT FROM API (OPTIONAL)
======================= */
function fetchInitialCommandes() {
    return fetch("https://dummyjson.com/carts")
        .then(res => res.json())
        .then(data => {
            const seed = data.carts.map(cart => ({
                id: Date.now() + cart.id,
                client: "Client #" + cart.userId,
                date: new Date().toISOString().split("T")[0],
                total: cart.total,
                statut: "En attente"
            }));
            saveCommandes(seed);
            commandes = seed;
        });
}

/* =======================
   MODAL - OUVRIR AJOUT
======================= */
function openAddCommande() {
    const form = document.getElementById("commandeForm");
    if (!form) return;

    form.reset();
    document.getElementById("commandeId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter commande";

    if (commandeModalInstance) commandeModalInstance.show();
}

/* =======================
   SUBMIT FORM (AJOUT/MODIF) — modifie la variable `commandes` en mémoire
======================= */
function onSubmitCommandeForm(e) {
    e.preventDefault();

    const id = document.getElementById("commandeId").value;
    const client = document.getElementById("client").value.trim();
    const date = document.getElementById("date").value;
    const statut = document.getElementById("statut").value;
    const totalInput = document.getElementById("total");
    const total = totalInput ? Number(totalInput.value) : Math.floor(Math.random() * 3000) + 200;

    if (!client || !date) {
        alert("Veuillez remplir le client et la date.");
        return;
    }

    if (!commandes) commandes = [];

    if (id) {
        // modifier en mémoire
        commandes = commandes.map(c => String(c.id) === String(id) ? { ...c, client, date, statut, total } : c);
    } else {
        // ajouter en mémoire
        const newCommande = {
            id: Date.now(),
            client,
            date,
            statut,
            total
        };
        commandes.unshift(newCommande);
    }

    if (commandeModalInstance) commandeModalInstance.hide();
    renderCommandes();
}

/* =======================
   EDIT (en mémoire)
======================= */
function editCommande(id) {
    if (!commandes) commandes = [];
    const c = commandes.find(x => x.id === id);
    if (!c) return;

    document.getElementById("modalTitle").innerText = "Modifier commande";
    document.getElementById("commandeId").value = c.id;
    document.getElementById("client").value = c.client;
    document.getElementById("date").value = c.date;
    document.getElementById("statut").value = c.statut;
    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.value = c.total;

    if (commandeModalInstance) commandeModalInstance.show();
}

/* =======================
   DELETE (en mémoire)
======================= */
function deleteCommande(id) {
    if (!confirm("Supprimer cette commande ?")) return;

    if (!commandes) commandes = [];
    commandes = commandes.filter(c => c.id !== id);
    renderCommandes();
}

/* =======================
   DETAILS PAGE (lit `commandes.json` si nécessaire)
   Affiche un message si la commande est introuvable ou si l'ID est invalide.
======================= */
function loadCommandeDetails() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");
    if (!rawId) {
        showCommandeNotFound();
        return;
    }

    const id = Number(rawId);
    if (Number.isNaN(id)) {
        showCommandeNotFound();
        return;
    }

    const show = (c) => {
        if (!c) { showCommandeNotFound(); return; }
        const detailClient = document.getElementById("detailClient");
        const detailDate = document.getElementById("detailDate");
        const detailTotal = document.getElementById("detailTotal");
        const detailStatut = document.getElementById("detailStatut");

        if (detailClient) detailClient.innerText = c.client;
        if (detailDate) detailDate.innerText = c.date;
        if (detailTotal) detailTotal.innerText = Number(c.total).toFixed(2) + " DH";
        if (detailStatut) detailStatut.innerText = c.statut;
    };

    const findAndShow = () => {
        if (!commandes || commandes.length === 0) return false;
        const c = commandes.find(x => Number(x.id) === Number(id));
        if (c) { show(c); return true; }
        return false;
    };

    if (!findAndShow()) {
        // si la liste n'est pas chargée en mémoire, charger depuis JSON
        fetch("commandes.json")
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                commandes = data;
                const c = commandes.find(x => Number(x.id) === Number(id));
                show(c);
            })
            .catch(err => {
                console.error('Erreur chargement commandes.json :', err);
                showCommandeNotFound();
            });
    }
}

function showCommandeNotFound() {
    const detailClient = document.getElementById("detailClient");
    const detailDate = document.getElementById("detailDate");
    const detailTotal = document.getElementById("detailTotal");
    const detailStatut = document.getElementById("detailStatut");

    const msg = "Commande introuvable";
    if (detailClient) detailClient.innerText = msg;
    if (detailDate) detailDate.innerText = "-";
    if (detailTotal) detailTotal.innerText = "-";
    if (detailStatut) detailStatut.innerText = "-";
}

/* =======================
   EXPORT
======================= */
function exportCommandePDF() {
    window.print();
}

/* =======================
   UTILS
======================= */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
