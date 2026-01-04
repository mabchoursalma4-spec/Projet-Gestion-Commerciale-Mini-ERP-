// Variables globales pour stocker les instances de graphiques
let produitsChart = null;
let commandesChart = null;
let facturesChart = null;
let utilisateursChart = null;
let clientsChart = null;

// Fonction pour charger les données JSON
async function loadData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showError(`Erreur de chargement des données: ${error.message}`);
        return [];
    }
}

// Fonction pour afficher les erreurs
function showError(message) {
    const statsCards = document.getElementById('statsCards');
    statsCards.innerHTML = `
        <div class="stat-card col-12">
            <h5>Erreur</h5>
            <div class="stat-value" style="color: #e74c3c; font-size: 1rem;">${message}</div>
        </div>
    `;
}

// Initialisation des graphiques
document.addEventListener('DOMContentLoaded', async function() {
    await loadAllCharts();
    
    // Ajouter l'événement au bouton d'actualisation
    document.getElementById('refreshBtn').addEventListener('click', refreshCharts);
});

// Charger tous les graphiques
async function loadAllCharts() {
    try {
        // Afficher un état de chargement
        document.getElementById('statsCards').innerHTML = `
            <div class="stat-card">
                <h5>Chargement...</h5>
                <div class="stat-value">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        `;

        // Charger toutes les données
        const [produits, commandes, factures, utilisateurs, clients] = await Promise.all([
            loadData('produits.json'),
            loadData('commandes.json'),
            loadData('factures.json'),
            loadData('utilisateurs.json'),
            loadData('clients.json')
        ]);

        // Mettre à jour les statistiques
        updateStats(produits, commandes, factures, utilisateurs, clients);
        
        // Détruire les anciens graphiques s'ils existent
        destroyCharts();
        
        // Créer les nouveaux graphiques
        createProduitsChart(produits);
        createCommandesChart(commandes);
        createFacturesChart(factures);
        createUtilisateursChart(utilisateurs);
        createClientsChart(clients);

    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les données');
    }
}

// Détruire tous les graphiques existants
function destroyCharts() {
    if (produitsChart) produitsChart.destroy();
    if (commandesChart) commandesChart.destroy();
    if (facturesChart) facturesChart.destroy();
    if (utilisateursChart) utilisateursChart.destroy();
    if (clientsChart) clientsChart.destroy();
}

// Rafraîchir les graphiques
function refreshCharts() {
    // Désactiver le bouton pendant le chargement
    const refreshBtn = document.getElementById('refreshBtn');
    const originalHTML = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Chargement...';
    refreshBtn.disabled = true;
    
    loadAllCharts().finally(() => {
        // Réactiver le bouton après 1 seconde
        setTimeout(() => {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            
            // Afficher une notification
            showNotification('Données actualisées avec succès!', 'success');
        }, 1000);
    });
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer une div pour la notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Mettre à jour les statistiques
function updateStats(produits, commandes, factures, utilisateurs, clients) {
    const statsCards = document.getElementById('statsCards');
    
    // Calculer les statistiques
    const totalProducts = produits.length;
    const totalOrders = commandes.length;
    const totalInvoices = factures.length;
    const totalUsers = utilisateurs.length;
    const totalClients = clients.length;
    
    // Calculer le revenu total (factures payées)
    const totalRevenue = factures
        .filter(f => f.statut === 'Payée')
        .reduce((sum, f) => sum + f.montant, 0);
    
    // Calculer le montant total en attente
    const pendingRevenue = factures
        .filter(f => f.statut === 'En attente')
        .reduce((sum, f) => sum + f.montant, 0);
    
    // Commandes en attente
    const pendingOrders = commandes.filter(c => c.statut === 'En attente').length;
    
    // Valeur totale du stock
    const stockValue = produits.reduce((sum, p) => sum + (p.prix * p.stock), 0);
    
    // Utilisateurs par rôle
    const roles = {};
    utilisateurs.forEach(u => {
        roles[u.role] = (roles[u.role] || 0) + 1;
    });
    
    // Produits par catégorie
    const categories = {};
    produits.forEach(p => {
        categories[p.categorie] = (categories[p.categorie] || 0) + 1;
    });
    const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'N/A');

    statsCards.innerHTML = `
        <div class="stat-card">
            <h5>Total Produits</h5>
            <div class="stat-value" style="color: #3498db;">${totalProducts}</div>
            <div class="stat-detail">${Object.keys(categories).length} catégories</div>
        </div>
        <div class="stat-card">
            <h5>Total Commandes</h5>
            <div class="stat-value" style="color: #2ecc71;">${totalOrders}</div>
            <div class="stat-detail">${pendingOrders} en attente</div>
        </div>
        <div class="stat-card">
            <h5>Total Factures</h5>
            <div class="stat-value" style="color: #e74c3c;">${totalInvoices}</div>
            <div class="stat-detail">${factures.filter(f => f.statut === 'En attente').length} en attente</div>
        </div>
        <div class="stat-card">
            <h5>Revenu Total</h5>
            <div class="stat-value" style="color: #f39c12;">${totalRevenue.toFixed(2)} DH</div>
            <div class="stat-detail">${pendingRevenue.toFixed(2)} DH en attente</div>
        </div>
        <div class="stat-card">
            <h5>Utilisateurs</h5>
            <div class="stat-value" style="color: #9b59b6;">${totalUsers}</div>
            <div class="stat-detail">${Object.keys(roles).length} rôles</div>
        </div>
        <div class="stat-card">
            <h5>Clients</h5>
            <div class="stat-value" style="color: #1abc9c;">${totalClients}</div>
            <div class="stat-detail">${clients.filter(c => c.ville).length} villes</div>
        </div>
    `;
}

// 1. Graphique Produits par Catégorie
function createProduitsChart(data) {
    const ctx = document.getElementById('produitsChart').getContext('2d');
    
    // Grouper par catégorie
    const categories = {};
    data.forEach(produit => {
        categories[produit.categorie] = (categories[produit.categorie] || 0) + 1;
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryCounts = Object.values(categories);
    
    produitsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryCounts,
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
                    '#9b59b6', '#1abc9c', '#34495e', '#f1c40f'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Produits par Catégorie',
                    font: { size: 16 }
                },
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} produits (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 2. Graphique Commandes par Statut
function createCommandesChart(data) {
    const ctx = document.getElementById('commandesChart').getContext('2d');
    
    // Grouper par statut
    const statuts = {};
    data.forEach(commande => {
        statuts[commande.statut] = (statuts[commande.statut] || 0) + 1;
    });
    
    const statutLabels = Object.keys(statuts);
    const statutCounts = Object.values(statuts);
    
    // Définir les couleurs pour chaque statut
    const backgroundColors = statutLabels.map(statut => {
        switch(statut) {
            case 'Validée': return '#2ecc71';
            case 'En attente': return '#f39c12';
            case 'Livrée': return '#3498db';
            case 'Annulée': return '#e74c3c';
            default: return '#95a5a6';
        }
    });
    
    commandesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: statutLabels,
            datasets: [{
                data: statutCounts,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Commandes par Statut',
                    font: { size: 16 }
                },
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            const montantTotal = data
                                .filter(c => c.statut === context.label)
                                .reduce((sum, c) => sum + c.total, 0);
                            return `${context.label}: ${context.raw} cmd (${percentage}%) - ${montantTotal.toFixed(2)} DH`;
                        }
                    }
                }
            }
        }
    });
}

// 3. Graphique Factures par Statut
function createFacturesChart(data) {
    const ctx = document.getElementById('facturesChart').getContext('2d');
    
    // Grouper par statut avec montants
    const statuts = {};
    data.forEach(facture => {
        if (!statuts[facture.statut]) {
            statuts[facture.statut] = {
                count: 0,
                montant: 0
            };
        }
        statuts[facture.statut].count++;
        statuts[facture.statut].montant += facture.montant;
    });
    
    const statutLabels = Object.keys(statuts);
    const statutCounts = statutLabels.map(statut => statuts[statut].count);
    const statutMontants = statutLabels.map(statut => statuts[statut].montant);
    
    // Définir les couleurs pour chaque statut
    const backgroundColors = statutLabels.map(statut => {
        switch(statut) {
            case 'Payée': return 'rgba(46, 204, 113, 0.8)';
            case 'En attente': return 'rgba(243, 156, 18, 0.8)';
            case 'Annulée': return 'rgba(231, 76, 60, 0.8)';
            default: return 'rgba(149, 165, 166, 0.8)';
        }
    });
    
    facturesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statutLabels,
            datasets: [
                {
                    label: 'Nombre de factures',
                    data: statutCounts,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Montant total (DH)',
                    data: statutMontants,
                    backgroundColor: backgroundColors.map(color => color.replace('0.8', '0.4')),
                    borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    yAxisID: 'y1',
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Factures par Statut',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Nombre de factures'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Montant (DH)'
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                const percentage = ((context.raw / data.length) * 100).toFixed(1);
                                return `Factures: ${context.raw} (${percentage}%)`;
                            } else {
                                return `Montant: ${context.raw.toFixed(2)} DH`;
                            }
                        }
                    }
                }
            }
        }
    });
}

// 4. Graphique Utilisateurs par Rôle
function createUtilisateursChart(data) {
    const ctx = document.getElementById('utilisateursChart').getContext('2d');
    
    // Grouper par rôle
    const roles = {};
    data.forEach(user => {
        roles[user.role] = (roles[user.role] || 0) + 1;
    });
    
    const roleLabels = Object.keys(roles);
    const roleCounts = Object.values(roles);
    
    utilisateursChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: roleLabels,
            datasets: [{
                data: roleCounts,
                backgroundColor: [
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(241, 196, 15, 0.7)',
                    'rgba(230, 126, 34, 0.7)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Utilisateurs par Rôle',
                    font: { size: 16 }
                },
                legend: { 
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} utilisateurs (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 5. Graphique Clients par Ville
function createClientsChart(data) {
    const ctx = document.getElementById('clientsChart').getContext('2d');
    
    // Grouper par ville
    const villes = {};
    data.forEach(client => {
        if (client.ville) {
            villes[client.ville] = (villes[client.ville] || 0) + 1;
        }
    });
    
    // Trier par nombre de clients (descendant) et prendre les 10 premières villes
    const sortedVilles = Object.entries(villes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const villeLabels = sortedVilles.map(v => v[0]);
    const villeCounts = sortedVilles.map(v => v[1]);
    
    clientsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: villeLabels,
            datasets: [{
                label: 'Nombre de clients',
                data: villeCounts,
                backgroundColor: 'rgba(26, 188, 156, 0.7)',
                borderColor: 'rgba(22, 160, 133, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Villes par Nombre de Clients',
                    font: { size: 16 }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de clients'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Ville'
                    }
                }
            }
        }
    });
}

// Fonction pour afficher la liste des derniers utilisateurs
function displayLastUsers(users) {
    const usersList = document.getElementById('lastUsersList');
    if (!usersList) return;
    
    const lastUsers = users.slice(-5).reverse(); // 5 derniers utilisateurs
    usersList.innerHTML = lastUsers.map(user => `
        <div class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${user.nom} ${user.prenom || ''}</h6>
                <small class="text-muted">${user.role}</small>
            </div>
            <p class="mb-1">${user.email}</p>
            <small class="text-muted">Ajouté le ${user.date_creation || 'N/A'}</small>
        </div>
    `).join('');
}

// Fonction pour afficher la liste des derniers clients
function displayLastClients(clients) {
    const clientsList = document.getElementById('lastClientsList');
    if (!clientsList) return;
    
    const lastClients = clients.slice(-5).reverse(); // 5 derniers clients
    clientsList.innerHTML = lastClients.map(client => `
        <div class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${client.nom}</h6>
                <small class="text-muted">${client.ville || 'Non spécifié'}</small>
            </div>
            <p class="mb-1">${client.email}</p>
            <small class="text-muted">${client.telephone || 'Téléphone non disponible'}</small>
        </div>
    `).join('');
}