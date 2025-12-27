/*****************************************
 * CRUD FACTURES - localStorage
 *****************************************/

const STORAGE_KEY = "erp_factures"; 

document.addEventListener("DOMContentLoaded", () => {
    // Charger les factures au démarrage
    afficherFactures();

    // Brancher le formulaire
    const form = document.getElementById("factureForm");
    if (form) form.addEventListener("submit", ajouterOuModifierFacture);
});

/* ===== LOCALSTORAGE ===== */
function getFactures() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveFactures(factures) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(factures));
}

/* ===== AFFICHER ===== */
function afficherFactures() {
    const tbody = document.getElementById("factureTableBody");
    const factures = getFactures();
    tbody.innerHTML = "";

    if (factures.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Aucune facture</td></tr>`;
        return;
    }

    factures.forEach((f, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${f.client}</td>
                <td>${f.amount.toFixed(2)}</td>
                <td>${f.status}</td>
                <td>
                    <button onclick="modifierFacture(${f.id})" class="btn btn-sm btn-warning">Modifier</button>
                    <button onclick="supprimerFacture(${f.id})" class="btn btn-sm btn-danger">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

/* ===== AJOUT / MODIF ===== */
function ajouterOuModifierFacture(e) {
    e.preventDefault();

    const client = document.getElementById("client").value.trim();
    const amount = parseFloat(document.getElementById("Montant").value);
    const status = document.getElementById("status").value;

    if (!client || isNaN(amount)) return;

    let factures = getFactures();
    const form = document.getElementById("factureForm");

    if (form.dataset.editId) {
        // Modifier facture existante
        const editId = parseInt(form.dataset.editId);
        factures = factures.map(f => f.id === editId ? { ...f, client, amount, status } : f);
        delete form.dataset.editId;
    } else {
        // Ajouter nouvelle facture
        factures.push({ id: Date.now(), client, amount, status });
    }

    saveFactures(factures);
    afficherFactures();
    form.reset();
}

/* ===== MODIFIER ===== */
function modifierFacture(id) {
    const f = getFactures().find(f => f.id === id);
    if (!f) return;

    document.getElementById("client").value = f.client;
    document.getElementById("Montant").value = f.amount;
    document.getElementById("status").value = f.status;

    document.getElementById("factureForm").dataset.editId = id;
}

/* ===== SUPPRIMER ===== */
function supprimerFacture(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette facture ?")) return;

    let factures = getFactures();
    factures = factures.filter(f => f.id !== id);
    saveFactures(factures);
    afficherFactures();
}