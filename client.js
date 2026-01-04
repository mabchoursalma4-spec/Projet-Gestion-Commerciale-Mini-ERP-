/*****************************************
 * CRUD CLIENT - localStorage
 *****************************************/

const STORAGE_KEY = "erp_clients";
let clientModalInstance = null;
// Liste des clients chargée depuis `clients.json` (modifications en mémoire/volatiles)
let clients = []; 

document.addEventListener("DOMContentLoaded", () => {
    // Si on est sur la page de liste, charger depuis clients.json
    const tbody = document.getElementById("clientTableBody");
    if (tbody) {
        fetch("clients.json")
            .then(res => res.json())
            .then(data => {
                clients = data;
                loadClients();
            })
            .catch(err => {
                console.error("Erreur chargement clients.json :", err);
                clients = [];
                loadClients();
            });
    }

    const modalEl = document.getElementById("clientModal");
    if (modalEl && window.bootstrap) {
        clientModalInstance = new bootstrap.Modal(modalEl);
    }

    const form = document.getElementById("clientForm");
    if (form) {
        form.addEventListener("submit", onSubmitClientForm);
    }
});

/* STORAGE */
function getClients() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveClients(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* LISTE */
function loadClients() {
    const tbody = document.getElementById("clientTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!clients || clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Aucun client</td></tr>`;
        return;
    }

    clients.forEach((c, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(c.nom)}</td>
                <td>${escapeHtml(c.email)}</td>
                <td>${escapeHtml(c.telephone)}</td>
                <td class="d-flex gap-2">
                    <a class="btn btn-sm btn-info" href="clients-details.html?id=${c.id}">Voir</a>
                    <button class="btn btn-sm btn-warning" onclick="editClient(${c.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClient(${c.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
} 

/* MODAL */
function openAddClient() {
    document.getElementById("clientForm").reset();
    document.getElementById("clientId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter client";
    clientModalInstance.show();
}

/* SUBMIT */
function onSubmitClientForm(e) {
    e.preventDefault();

    const id = document.getElementById("clientId").value;
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const adresse = document.getElementById("adresse").value.trim();

    if (!clients) clients = [];

    if (id) {
        clients = clients.map(c =>
            String(c.id) === String(id) ? { ...c, nom, email, telephone, adresse } : c
        );
    } else {
        clients.unshift({
            id: Date.now(),
            nom,
            email,
            telephone,
            adresse
        });
    }

    // Modifications en mémoire uniquement (volatiles)
    clientModalInstance.hide();
    loadClients();
} 

/* EDIT */
function editClient(id) {
    if (!clients) clients = [];
    const c = clients.find(x => x.id === id);
    if (!c) return;

    document.getElementById("modalTitle").innerText = "Modifier client";
    document.getElementById("clientId").value = c.id;
    document.getElementById("nom").value = c.nom;
    document.getElementById("email").value = c.email;
    document.getElementById("telephone").value = c.telephone;
    document.getElementById("adresse").value = c.adresse;

    clientModalInstance.show();
} 

/* DELETE */
function deleteClient(id) {
    if (!confirm("Supprimer ce client ?")) return;
    if (!clients) clients = [];
    clients = clients.filter(c => c.id !== id);
    loadClients();
} 

/* DETAILS */
function loadClientDetails() {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");
    if (!rawId) return;
    const id = Number(rawId);
    if (Number.isNaN(id)) return;

    const show = (c) => {
        if (!c) return;
        document.getElementById("detailNom").innerText = c.nom;
        document.getElementById("detailEmail").innerText = c.email;
        document.getElementById("detailTelephone").innerText = c.telephone;
        document.getElementById("detailAdresse").innerText = c.adresse;
    };

    if (clients && clients.length > 0) {
        const c = clients.find(x => Number(x.id) === Number(id));
        if (c) { show(c); return; }
    }

    fetch("clients.json")
        .then(res => res.json())
        .then(data => {
            clients = data;
            const c = clients.find(x => Number(x.id) === Number(id));
            show(c);
        })
        .catch(err => console.error("Erreur chargement clients.json :", err));
}

/* UTILS */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
