/*********************************
 * VARIABLES GLOBALES
 *********************************/
let factures = [];
let modal = null;

/*********************************
 * INITIALISATION
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    // Initialiser le modal Bootstrap
    const modalEl = document.getElementById("factureModal");
    if (modalEl) modal = new bootstrap.Modal(modalEl);

    // Charger les factures depuis le fichier JSON local (les changements sont en mémoire et volatiles)
    fetch("factures.json")
        .then(res => res.json())
        .then(data => {
            factures = data;
            renderFactures();
        })
        .catch(err => {
            console.error("Erreur chargement factures.json :", err);
            factures = [];
            renderFactures();
        });
});

/*********************************
 * AFFICHAGE TABLEAU
 *********************************/
function renderFactures() {
    const tbody = document.getElementById("factureTableBody");
    if (!tbody) return;

    if (!factures || factures.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Aucune facture disponible</td></tr>`;
        return;
    }

    let html = "";
    factures.forEach((f, index) => {
        // Déterminer la classe CSS pour le statut
        let statusClass = "";
        switch(f.statut) {
            case 'Payée': statusClass = 'badge bg-success'; break;
            case 'En attente': statusClass = 'badge bg-warning'; break;
            case 'Annulée': statusClass = 'badge bg-danger'; break;
            default: statusClass = 'badge bg-secondary';
        }

        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${f.commande}</strong></td>
                <td>${formatDate(f.date)}</td>
                <td>${f.montant} DH</td>
                <td><span class="${statusClass}">${f.statut}</span></td>
                <td>
                    <a class="btn btn-sm btn-info" href="factures-details.html?id=${f.id}">Détails</a>
                    <button class="btn btn-sm btn-warning" onclick="editFacture(${f.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFacture(${f.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/*********************************
 * FORMATTER LA DATE
 *********************************/
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/*********************************
 * AJOUT FACTURE
 *********************************/
function openAddFacture() {
    document.getElementById("factureForm").reset();
    document.getElementById("factureId").value = "";
    document.getElementById("modalTitle").innerText = "Ajouter facture";
    
    // Définir la date d'aujourd'hui par défaut
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = today;
    
    if (modal) modal.show();
}

/*********************************
 * SUBMIT FORMULAIRE
 *********************************/
document.getElementById("factureForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("factureId").value;

    // Récupérer les valeurs
    const commande = document.getElementById("commande").value.trim();
    const date = document.getElementById("date").value;
    const montant = Number(document.getElementById("montant").value);
    const statut = document.getElementById("statut").value;

    // Validation simple
    if (!commande || !date || isNaN(montant) || !statut) {
        alert("Veuillez remplir correctement tous les champs.");
        return;
    }

    if (!factures) factures = [];

    if (id === "") {
        const newFacture = {
            id: Date.now(),
            commande,
            date,
            montant,
            statut
        };
        factures.push(newFacture);
    } else {
        const idx = factures.findIndex(f => String(f.id) === String(id));
        if (idx !== -1) {
            factures[idx] = { ...factures[idx], commande, date, montant, statut };
        }
    }

    if (modal) modal.hide();
    renderFactures();
});

/*********************************
 * MODIFIER FACTURE
 *********************************/
function editFacture(id) {
    if (!factures) factures = [];
    const f = factures.find(x => x.id === id);
    if (!f) return;

    document.getElementById("factureId").value = f.id;
    document.getElementById("commande").value = f.commande;
    document.getElementById("date").value = f.date;
    document.getElementById("montant").value = f.montant;
    document.getElementById("statut").value = f.statut;

    document.getElementById("modalTitle").innerText = "Modifier facture";
    if (modal) modal.show();
}

/*********************************
 * SUPPRIMER FACTURE
 *********************************/
function deleteFacture(id) {
    if (!factures) factures = [];
    const idx = factures.findIndex(f => f.id === id);
    if (idx === -1) return;

    if (confirm("Supprimer cette facture ?")) {
        factures.splice(idx, 1);
        renderFactures();
    }
}

/*********************************
 * STATISTIQUES (optionnel)
 *********************************/
function updateStats() {
    if (!factures || factures.length === 0) return;
    
    // Calcul des statistiques
    const total = factures.length;
    const totalMontant = factures.reduce((sum, f) => sum + f.montant, 0);
    const payeeCount = factures.filter(f => f.statut === 'Payée').length;
    const attenteCount = factures.filter(f => f.statut === 'En attente').length;
    const annuleeCount = factures.filter(f => f.statut === 'Annulée').length;
    
    // Mettre à jour l'affichage si les éléments existent
    const statsElement = document.getElementById('factureStats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">Total Factures</h5>
                            <h2>${total}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">Total Montant</h5>
                            <h2>${totalMontant.toFixed(2)} DH</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card text-white" style="background-color: #28a745;">
                        <div class="card-body">
                            <h6 class="card-title">Payées</h6>
                            <h4>${payeeCount}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card text-white" style="background-color: #ffc107;">
                        <div class="card-body">
                            <h6 class="card-title">En attente</h6>
                            <h4>${attenteCount}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card text-white" style="background-color: #dc3545;">
                        <div class="card-body">
                            <h6 class="card-title">Annulées</h6>
                            <h4>${annuleeCount}</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/*********************************
 * RECHERCHE DE FACTURES
 *********************************/
function searchFactures() {
    const searchInput = document.getElementById('searchFactureInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const tbody = document.getElementById("factureTableBody");
    
    if (!searchTerm) {
        renderFactures();
        return;
    }
    
    if (!factures || factures.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Aucune facture disponible</td></tr>`;
        return;
    }
    
    const filteredFactures = factures.filter(f => 
        f.commande.toLowerCase().includes(searchTerm) ||
        f.date.toLowerCase().includes(searchTerm) ||
        f.statut.toLowerCase().includes(searchTerm) ||
        f.montant.toString().includes(searchTerm)
    );
    
    if (filteredFactures.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Aucun résultat trouvé</td></tr>`;
        return;
    }
    
    let html = "";
    filteredFactures.forEach((f, index) => {
        let statusClass = "";
        switch(f.statut) {
            case 'Payée': statusClass = 'badge bg-success'; break;
            case 'En attente': statusClass = 'badge bg-warning'; break;
            case 'Annulée': statusClass = 'badge bg-danger'; break;
            default: statusClass = 'badge bg-secondary';
        }

        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${f.commande}</strong></td>
                <td>${formatDate(f.date)}</td>
                <td>${f.montant} DH</td>
                <td><span class="${statusClass}">${f.statut}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editFacture(${f.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFacture(${f.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

/*********************************
 * EXPORT PDF
 *********************************/
function exportPDF() {
    window.print();
}
