document.addEventListener('DOMContentLoaded', function() {
    // Controllo se l'utente è loggato
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Gestione delle sezioni
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Rimuove la classe active da tutti i link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            // Aggiunge la classe active al link cliccato
            this.classList.add('active');
            
            // Nasconde tutte le sezioni
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Mostra la sezione corrispondente
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });

    // Inizializzazione dati dal localStorage o dati di esempio se non presenti
    initData();
    
    // Aggiorna la dashboard
    updateDashboard();
    
    // Popola le tabelle
    renderTeams();
    renderMatches();
    renderStandings();
    renderContents();

    // Gestione del form per aggiungere una squadra
    document.getElementById('save-team-btn').addEventListener('click', function() {
        const teamName = document.getElementById('team-name').value;
        const teamCategory = document.getElementById('team-category').value;
        const teamEmail = document.getElementById('team-email').value;
        const teamPhone = document.getElementById('team-phone').value;
        
        if (!teamName || !teamCategory || !teamEmail || !teamPhone) {
            alert('Tutti i campi sono obbligatori');
            return;
        }
        
        const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
        
        const newTeam = {
            id: generateId(),
            name: teamName,
            category: teamCategory,
            email: teamEmail,
            phone: teamPhone
        };
        
        teams.push(newTeam);
        localStorage.setItem('rugbyTeams', JSON.stringify(teams));
        
        // Aggiorna la visualizzazione
        renderTeams();
        updateDashboard();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
        modal.hide();
        
        // Reset del form
        document.getElementById('add-team-form').reset();
    });

    // Gestione del form per aggiungere una partita
    document.getElementById('save-match-btn').addEventListener('click', function() {
        const matchDate = document.getElementById('match-date').value;
        const homeTeam = document.getElementById('home-team').value;
        const awayTeam = document.getElementById('away-team').value;
        const homeScore = document.getElementById('home-score').value;
        const awayScore = document.getElementById('away-score').value;
        
        if (!matchDate || !homeTeam || !awayTeam) {
            alert('Data, squadra casa e squadra ospite sono obbligatori');
            return;
        }
        
        if (homeTeam === awayTeam) {
            alert('Le squadre devono essere diverse');
            return;
        }
        
        const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
        
        const newMatch = {
            id: generateId(),
            date: matchDate,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            homeScore: homeScore ? parseInt(homeScore) : null,
            awayScore: awayScore ? parseInt(awayScore) : null,
            played: homeScore !== '' && awayScore !== ''
        };
        
        matches.push(newMatch);
        localStorage.setItem('rugbyMatches', JSON.stringify(matches));
        
        // Aggiorna la visualizzazione
        renderMatches();
        updateDashboard();
        updateCalendar();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMatchModal'));
        modal.hide();
        
        // Reset del form
        document.getElementById('add-match-form').reset();
    });

    // Gestione del form per aggiungere un contenuto
    document.getElementById('save-content-btn').addEventListener('click', function() {
        const contentTitle = document.getElementById('content-title').value;
        const contentType = document.getElementById('content-type').value;
        const contentText = document.getElementById('content-text').value;
        const contentImage = document.getElementById('content-image').value;
        
        if (!contentTitle || !contentType || !contentText) {
            alert('Titolo, tipo e contenuto sono obbligatori');
            return;
        }
        
        const contents = JSON.parse(localStorage.getItem('rugbyContents')) || [];
        
        const newContent = {
            id: generateId(),
            title: contentTitle,
            type: contentType,
            text: contentText,
            image: contentImage,
            date: new Date().toISOString()
        };
        
        contents.push(newContent);
        localStorage.setItem('rugbyContents', JSON.stringify(contents));
        
        // Aggiorna la visualizzazione
        renderContents();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addContentModal'));
        modal.hide();
        
        // Reset del form
        document.getElementById('add-content-form').reset();
    });

    // Aggiorna la classifica
    document.getElementById('update-standings-btn').addEventListener('click', function() {
        calculateStandings();
        renderStandings();
        alert('Classifica aggiornata con successo');
    });

    // Popola i select delle squadre nei form
    populateTeamSelects();
});

// Funzione per generare un ID univoco
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Inizializzazione dati
function initData() {
    // Squadre
    if (!localStorage.getItem('rugbyTeams')) {
        const exampleTeams = [
            { id: generateId(), name: 'Leoni Rugby', category: 'senior', email: 'leoni@example.com', phone: '3334445556' },
            { id: generateId(), name: 'Tigri Rugby', category: 'senior', email: 'tigri@example.com', phone: '3334445557' },
            { id: generateId(), name: 'Orsi Rugby', category: 'junior', email: 'orsi@example.com', phone: '3334445558' },
            { id: generateId(), name: 'Lupi Rugby', category: 'junior', email: 'lupi@example.com', phone: '3334445559' }
        ];
        localStorage.setItem('rugbyTeams', JSON.stringify(exampleTeams));
    }
    
    // Partite
    if (!localStorage.getItem('rugbyMatches')) {
        const teams = JSON.parse(localStorage.getItem('rugbyTeams'));
        if (teams && teams.length >= 4) {
            const exampleMatches = [
                { 
                    id: generateId(), 
                    date: '2024-04-15T15:00:00', 
                    homeTeam: teams[0].id, 
                    awayTeam: teams[1].id, 
                    homeScore: 24, 
                    awayScore: 18, 
                    played: true 
                },
                { 
                    id: generateId(), 
                    date: '2024-04-22T15:00:00', 
                    homeTeam: teams[2].id, 
                    awayTeam: teams[3].id, 
                    homeScore: null, 
                    awayScore: null, 
                    played: false 
                },
                { 
                    id: generateId(), 
                    date: '2024-05-01T16:00:00', 
                    homeTeam: teams[0].id, 
                    awayTeam: teams[2].id, 
                    homeScore: null, 
                    awayScore: null, 
                    played: false 
                }
            ];
            localStorage.setItem('rugbyMatches', JSON.stringify(exampleMatches));
        }
    }
    
    // Contenuti
    if (!localStorage.getItem('rugbyContents')) {
        const exampleContents = [
            { 
                id: generateId(), 
                title: 'Inizia il torneo di rugby 2024', 
                type: 'news', 
                text: 'Il torneo di rugby 2024 inizierà il 15 aprile con la prima partita tra Leoni e Tigri.', 
                image: '', 
                date: new Date().toISOString() 
            }
        ];
        localStorage.setItem('rugbyContents', JSON.stringify(exampleContents));
    }
    
    // Classifica
    if (!localStorage.getItem('rugbyStandings')) {
        calculateStandings();
    }
}

// Aggiorna la dashboard
function updateDashboard() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const playedMatches = matches.filter(match => match.played);
    
    document.getElementById('total-teams').textContent = teams.length;
    document.getElementById('total-matches').textContent = playedMatches.length;
    document.getElementById('new-registrations').textContent = teams.length; // Simulato
}

// Popola la tabella delle squadre
function renderTeams() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const tableBody = document.getElementById('teams-table-body');
    
    tableBody.innerHTML = '';
    
    teams.forEach(team => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${team.id.substring(0, 6)}...</td>
            <td>${team.name}</td>
            <td>${getCategoryName(team.category)}</td>
            <td>${team.email}</td>
            <td>${team.phone}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-team" data-id="${team.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Aggiungi event listener ai pulsanti di eliminazione
    document.querySelectorAll('.delete-team').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-id');
            if (confirm('Sei sicuro di voler eliminare questa squadra?')) {
                deleteTeam(teamId);
            }
        });
    });
}

// Popola la tabella delle partite
function renderMatches() {
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const tableBody = document.getElementById('matches-table-body');
    
    tableBody.innerHTML = '';
    
    matches.forEach(match => {
        const homeTeam = teams.find(team => team.id === match.homeTeam);
        const awayTeam = teams.find(team => team.id === match.awayTeam);
        
        if (!homeTeam || !awayTeam) return;
        
        const row = document.createElement('tr');
        
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('it-IT') + ' ' + matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        
        row.innerHTML = `
            <td>${match.id.substring(0, 6)}...</td>
            <td>${formattedDate}</td>
            <td>${homeTeam.name}</td>
            <td>${awayTeam.name}</td>
            <td>${match.played ? `${match.homeScore} - ${match.awayScore}` : 'Non giocata'}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-match" data-id="${match.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-match" data-id="${match.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Aggiungi event listener ai pulsanti
    document.querySelectorAll('.delete-match').forEach(button => {
        button.addEventListener('click', function() {
            const matchId = this.getAttribute('data-id');
            if (confirm('Sei sicuro di voler eliminare questa partita?')) {
                deleteMatch(matchId);
            }
        });
    });
    
    document.querySelectorAll('.edit-match').forEach(button => {
        button.addEventListener('click', function() {
            const matchId = this.getAttribute('data-id');
            // Funzionalità di modifica da implementare
            alert('Funzionalità di modifica da implementare');
        });
    });
}

// Popola la tabella della classifica
function renderStandings() {
    const standings = JSON.parse(localStorage.getItem('rugbyStandings')) || [];
    const tableBody = document.getElementById('standings-table-body');
    
    tableBody.innerHTML = '';
    
    // Ordina per punti
    standings.sort((a, b) => b.points - a.points);
    
    standings.forEach((team, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td>${team.points}</td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.lost}</td>
            <td>${team.scored}</td>
            <td>${team.conceded}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Popola la tabella dei contenuti
function renderContents() {
    const contents = JSON.parse(localStorage.getItem('rugbyContents')) || [];
    const tableBody = document.getElementById('content-table-body');
    
    tableBody.innerHTML = '';
    
    // Ordina per data (più recenti prima)
    contents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    contents.forEach(content => {
        const row = document.createElement('tr');
        
        const contentDate = new Date(content.date);
        const formattedDate = contentDate.toLocaleDateString('it-IT');
        
        row.innerHTML = `
            <td>${content.id.substring(0, 6)}...</td>
            <td>${content.title}</td>
            <td>${formattedDate}</td>
            <td>${getContentTypeName(content.type)}</td>
            <td>
                <button class="btn btn-sm btn-primary view-content" data-id="${content.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-content" data-id="${content.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Aggiungi event listener ai pulsanti
    document.querySelectorAll('.delete-content').forEach(button => {
        button.addEventListener('click', function() {
            const contentId = this.getAttribute('data-id');
            if (confirm('Sei sicuro di voler eliminare questo contenuto?')) {
                deleteContent(contentId);
            }
        });
    });
    
    document.querySelectorAll('.view-content').forEach(button => {
        button.addEventListener('click', function() {
            const contentId = this.getAttribute('data-id');
            // Funzionalità di visualizzazione da implementare
            alert('Funzionalità di visualizzazione da implementare');
        });
    });
}

// Elimina una squadra
function deleteTeam(teamId) {
    let teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    teams = teams.filter(team => team.id !== teamId);
    localStorage.setItem('rugbyTeams', JSON.stringify(teams));
    
    // Aggiorna anche le partite che coinvolgono questa squadra
    let matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    matches = matches.filter(match => match.homeTeam !== teamId && match.awayTeam !== teamId);
    localStorage.setItem('rugbyMatches', JSON.stringify(matches));
    
    // Ricalcola la classifica
    calculateStandings();
    
    // Aggiorna la visualizzazione
    renderTeams();
    renderMatches();
    renderStandings();
    updateDashboard();
    populateTeamSelects();
}

// Elimina una partita
function deleteMatch(matchId) {
    let matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    matches = matches.filter(match => match.id !== matchId);
    localStorage.setItem('rugbyMatches', JSON.stringify(matches));
    
    // Ricalcola la classifica
    calculateStandings();
    
    // Aggiorna la visualizzazione
    renderMatches();
    renderStandings();
    updateDashboard();
}

// Elimina un contenuto
function deleteContent(contentId) {
    let contents = JSON.parse(localStorage.getItem('rugbyContents')) || [];
    contents = contents.filter(content => content.id !== contentId);
    localStorage.setItem('rugbyContents', JSON.stringify(contents));
    
    // Aggiorna la visualizzazione
    renderContents();
}

// Calcola la classifica
function calculateStandings() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const playedMatches = matches.filter(match => match.played);
    
    // Inizializza la classifica
    const standings = teams.map(team => ({
        id: team.id,
        name: team.name,
        points: 0,
        played: 0,
        won: 0,
        lost: 0,
        scored: 0,
        conceded: 0
    }));
    
    // Calcola i punti
    playedMatches.forEach(match => {
        const homeTeamIndex = standings.findIndex(team => team.id === match.homeTeam);
        const awayTeamIndex = standings.findIndex(team => team.id === match.awayTeam);
        
        if (homeTeamIndex === -1 || awayTeamIndex === -1) return;
        
        // Aggiorna le statistiche della squadra di casa
        standings[homeTeamIndex].played++;
        standings[homeTeamIndex].scored += match.homeScore;
        standings[homeTeamIndex].conceded += match.awayScore;
        
        // Aggiorna le statistiche della squadra ospite
        standings[awayTeamIndex].played++;
        standings[awayTeamIndex].scored += match.awayScore;
        standings[awayTeamIndex].conceded += match.homeScore;
        
        // Assegna punti (4 per vittoria, 2 per pareggio, 0 per sconfitta)
        if (match.homeScore > match.awayScore) {
            standings[homeTeamIndex].won++;
            standings[homeTeamIndex].points += 4;
            standings[awayTeamIndex].lost++;
        } else if (match.homeScore < match.awayScore) {
            standings[awayTeamIndex].won++;
            standings[awayTeamIndex].points += 4;
            standings[homeTeamIndex].lost++;
        } else {
            // Pareggio
            standings[homeTeamIndex].points += 2;
            standings[awayTeamIndex].points += 2;
        }
        
        // Bonus per 4 o più mete (1 punto)
        if (match.homeScore >= 4) {
            standings[homeTeamIndex].points += 1;
        }
        if (match.awayScore >= 4) {
            standings[awayTeamIndex].points += 1;
        }
        
        // Bonus per sconfitta con meno di 7 punti di scarto (1 punto)
        if (match.homeScore < match.awayScore && match.awayScore - match.homeScore < 7) {
            standings[homeTeamIndex].points += 1;
        }
        if (match.awayScore < match.homeScore && match.homeScore - match.awayScore < 7) {
            standings[awayTeamIndex].points += 1;
        }
    });
    
    localStorage.setItem('rugbyStandings', JSON.stringify(standings));
}

// Popola i select delle squadre
function populateTeamSelects() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const homeTeamSelect = document.getElementById('home-team');
    const awayTeamSelect = document.getElementById('away-team');
    
    // Rimuovi tutte le opzioni tranne la prima
    while (homeTeamSelect.options.length > 1) {
        homeTeamSelect.remove(1);
    }
    while (awayTeamSelect.options.length > 1) {
        awayTeamSelect.remove(1);
    }
    
    // Aggiungi le opzioni
    teams.forEach(team => {
        const homeOption = document.createElement('option');
        homeOption.value = team.id;
        homeOption.textContent = team.name;
        homeTeamSelect.appendChild(homeOption);
        
        const awayOption = document.createElement('option');
        awayOption.value = team.id;
        awayOption.textContent = team.name;
        awayTeamSelect.appendChild(awayOption);
    });
}

// Aggiorna il calendario sul frontend
function updateCalendar() {
    // Questa funzione dovrebbe aggiornare il calendario sulla homepage
    console.log('Calendario aggiornato');
}

// Ottieni il nome della categoria
function getCategoryName(categoryCode) {
    const categories = {
        'senior': 'Senior',
        'junior': 'Junior',
        'amatori': 'Amatori'
    };
    return categories[categoryCode] || categoryCode;
}

// Ottieni il nome del tipo di contenuto
function getContentTypeName(typeCode) {
    const types = {
        'news': 'News',
        'article': 'Articolo',
        'announcement': 'Annuncio'
    };
    return types[typeCode] || typeCode;
} 