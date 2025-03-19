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
    renderReferees();
    renderStandings();
    renderContents();
    updateStatistics();

    // Gestione del form per aggiungere una squadra
    document.getElementById('save-team-btn').addEventListener('click', function() {
        const teamName = document.getElementById('team-name').value;
        const teamCategory = document.getElementById('team-category').value;
        const teamEmail = document.getElementById('team-email').value;
        const teamPhone = document.getElementById('team-phone').value;
        const teamId = this.getAttribute('data-team-id') || '';
        
        if (!teamName || !teamCategory || !teamEmail || !teamPhone) {
            alert('Tutti i campi sono obbligatori');
            return;
        }
        
        const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
        
        if (teamId) {
            // Modalità modifica
            const index = teams.findIndex(team => team.id === teamId);
            if (index !== -1) {
                teams[index] = {
                    id: teamId,
                    name: teamName,
                    category: teamCategory,
                    email: teamEmail,
                    phone: teamPhone
                };
            }
        } else {
            // Modalità aggiunta
            const newTeam = {
                id: generateId(),
                name: teamName,
                category: teamCategory,
                email: teamEmail,
                phone: teamPhone
            };
            
            teams.push(newTeam);
        }
        
        localStorage.setItem('rugbyTeams', JSON.stringify(teams));
        
        // Aggiorna la visualizzazione
        renderTeams();
        updateDashboard();
        populateTeamSelects();
        calculateStandings();
        renderStandings();
        updateStatistics();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
        modal.hide();
        
        // Reset del form e degli attributi data
        document.getElementById('add-team-form').reset();
        this.removeAttribute('data-team-id');
        
        // Ripristina il titolo del modal
        document.querySelector('#addTeamModal .modal-title').textContent = 'Aggiungi Squadra';
    });

    // Gestione del form per aggiungere/modificare una partita
    document.getElementById('save-match-btn').addEventListener('click', function() {
        const matchDate = document.getElementById('match-date').value;
        const homeTeam = document.getElementById('home-team').value;
        const awayTeam = document.getElementById('away-team').value;
        const referee = document.getElementById('match-referee').value;
        const location = document.getElementById('match-location').value;
        const matchId = this.getAttribute('data-match-id') || '';
        
        if (!matchDate || !homeTeam || !awayTeam) {
            alert('Data, squadra casa e squadra ospite sono obbligatori');
            return;
        }
        
        if (homeTeam === awayTeam) {
            alert('Le squadre devono essere diverse');
            return;
        }
        
        const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
        
        if (matchId) {
            // Modalità modifica
            const index = matches.findIndex(match => match.id === matchId);
            if (index !== -1) {
                // Preserva i dettagli del rugby e il punteggio
                const rugbyDetails = matches[index].rugbyDetails;
                const homeScore = matches[index].homeScore;
                const awayScore = matches[index].awayScore;
                const played = matches[index].played;
                const status = matches[index].status;
                
                matches[index] = {
                    id: matchId,
                    date: matchDate,
                    homeTeam: homeTeam,
                    awayTeam: awayTeam,
                    referee: referee,
                    location: location,
                    homeScore: homeScore,
                    awayScore: awayScore,
                    played: played,
                    status: status,
                    rugbyDetails: rugbyDetails
                };
            }
        } else {
            // Modalità aggiunta
            const newMatch = {
                id: generateId(),
                date: matchDate,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                referee: referee,
                location: location,
                homeScore: 0,
                awayScore: 0,
                played: false,
                status: 'disputata',
                rugbyDetails: {
                    home: {
                        periodo1: {
                            mete: 0,
                            trasformazioni: 0,
                            punizioni: 0,
                            drop: 0
                        },
                        periodo2: {
                            mete: 0,
                            trasformazioni: 0,
                            punizioni: 0,
                            drop: 0
                        }
                    },
                    away: {
                        periodo1: {
                            mete: 0,
                            trasformazioni: 0,
                            punizioni: 0,
                            drop: 0
                        },
                        periodo2: {
                            mete: 0,
                            trasformazioni: 0,
                            punizioni: 0,
                            drop: 0
                        }
                    }
                }
            };
            
            matches.push(newMatch);
        }
        
        localStorage.setItem('rugbyMatches', JSON.stringify(matches));
        
        // Aggiorna la visualizzazione
        renderMatches();
        updateDashboard();
        updateCalendar();
        calculateStandings();
        renderStandings();
        updateStatistics();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMatchModal'));
        modal.hide();
        
        // Reset del form e degli attributi data
        document.getElementById('add-match-form').reset();
        this.removeAttribute('data-match-id');
        
        // Ripristina il titolo del modal
        document.querySelector('#addMatchModal .modal-title').textContent = 'Aggiungi Partita';
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

    // Gestione del form per aggiungere/modificare un arbitro
    document.getElementById('save-referee-btn').addEventListener('click', function() {
        const refereeName = document.getElementById('referee-name').value;
        const refereeSurname = document.getElementById('referee-surname').value;
        const refereeEmail = document.getElementById('referee-email').value;
        const refereePhone = document.getElementById('referee-phone').value;
        const refereeLevel = document.getElementById('referee-level').value;
        const refereeId = document.getElementById('referee-id').value;
        
        if (!refereeName || !refereeSurname || !refereeEmail || !refereePhone || !refereeLevel) {
            alert('Tutti i campi sono obbligatori');
            return;
        }
        
        const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
        
        if (refereeId) {
            // Modalità modifica
            const index = referees.findIndex(ref => ref.id === refereeId);
            if (index !== -1) {
                referees[index] = {
                    id: refereeId,
                    name: refereeName,
                    surname: refereeSurname,
                    email: refereeEmail,
                    phone: refereePhone,
                    level: refereeLevel
                };
            }
        } else {
            // Modalità aggiunta
            const newReferee = {
                id: generateId(),
                name: refereeName,
                surname: refereeSurname,
                email: refereeEmail,
                phone: refereePhone,
                level: refereeLevel
            };
            
            referees.push(newReferee);
        }
        
        localStorage.setItem('rugbyReferees', JSON.stringify(referees));
        
        // Aggiorna la visualizzazione
        renderReferees();
        populateRefereeSelect();
        updateStatistics();
        
        // Chiudi il modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRefereeModal'));
        modal.hide();
        
        // Reset del form
        document.getElementById('add-referee-form').reset();
        document.getElementById('referee-id').value = '';
        
        // Ripristina il titolo del modal
        document.querySelector('#addRefereeModal .modal-title').textContent = 'Aggiungi Arbitro';
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

    // Arbitri
    if (!localStorage.getItem('rugbyReferees')) {
        const exampleReferees = [
            { id: generateId(), name: 'Marco', surname: 'Rossi', email: 'marco.rossi@example.com', phone: '3331112223', level: 'national' },
            { id: generateId(), name: 'Luigi', surname: 'Bianchi', email: 'luigi.bianchi@example.com', phone: '3334445556', level: 'regional' }
        ];
        localStorage.setItem('rugbyReferees', JSON.stringify(exampleReferees));
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
                <button class="btn btn-sm btn-primary edit-team" data-id="${team.id}">
                    <i class="fas fa-edit"></i>
                </button>
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

    // Aggiungi event listener ai pulsanti di modifica
    document.querySelectorAll('.edit-team').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-id');
            editTeam(teamId);
        });
    });
}

// Funzione per modificare una squadra
function editTeam(teamId) {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return;
    
    // Popola il form del modal
    document.getElementById('team-name').value = team.name;
    document.getElementById('team-category').value = team.category;
    document.getElementById('team-email').value = team.email;
    document.getElementById('team-phone').value = team.phone;
    
    // Aggiungi l'ID della squadra come attributo data al pulsante di salvataggio
    const saveButton = document.getElementById('save-team-btn');
    saveButton.setAttribute('data-team-id', teamId);
    
    // Cambia il titolo del modal
    document.querySelector('#addTeamModal .modal-title').textContent = 'Modifica Squadra';
    
    // Apri il modal
    const modal = new bootstrap.Modal(document.getElementById('addTeamModal'));
    modal.show();
}

// Popola la tabella delle partite
function renderMatches() {
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    const tableBody = document.getElementById('matches-table-body');
    
    tableBody.innerHTML = '';
    
    matches.forEach(match => {
        const homeTeam = teams.find(team => team.id === match.homeTeam);
        const awayTeam = teams.find(team => team.id === match.awayTeam);
        const referee = referees.find(ref => ref.id === match.referee);
        
        if (!homeTeam || !awayTeam) return;
        
        const row = document.createElement('tr');
        
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('it-IT') + ' ' + matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        
        // Calcola il punteggio totale dalle statistiche di rugby
        let homeTotal = 0;
        let awayTotal = 0;
        
        if (match.rugbyDetails) {
            const homeDetails = match.rugbyDetails.home;
            const awayDetails = match.rugbyDetails.away;
            
            // Calcola i punti per la squadra di casa
            homeTotal += (homeDetails.periodo1.mete + homeDetails.periodo2.mete) * 5; // 5 punti per meta
            homeTotal += (homeDetails.periodo1.trasformazioni + homeDetails.periodo2.trasformazioni) * 2; // 2 punti per trasformazione
            homeTotal += (homeDetails.periodo1.punizioni + homeDetails.periodo2.punizioni) * 3; // 3 punti per punizione
            homeTotal += (homeDetails.periodo1.drop + homeDetails.periodo2.drop) * 3; // 3 punti per drop
            
            // Calcola i punti per la squadra ospite
            awayTotal += (awayDetails.periodo1.mete + awayDetails.periodo2.mete) * 5;
            awayTotal += (awayDetails.periodo1.trasformazioni + awayDetails.periodo2.trasformazioni) * 2;
            awayTotal += (awayDetails.periodo1.punizioni + awayDetails.periodo2.punizioni) * 3;
            awayTotal += (awayDetails.periodo1.drop + awayDetails.periodo2.drop) * 3;
        } else if (match.homeScore !== null && match.awayScore !== null) {
            homeTotal = match.homeScore;
            awayTotal = match.awayScore;
        }
        
        let risultatoText = 'Non giocata';
        if (match.played) {
            if (match.status === 'sospesa') {
                risultatoText = `${homeTotal} - ${awayTotal} (SOSPESA)`;
            } else {
                risultatoText = `${homeTotal} - ${awayTotal}`;
            }
        }
        
        row.innerHTML = `
            <td>${match.id.substring(0, 6)}...</td>
            <td>${formattedDate}</td>
            <td>${homeTeam.name}</td>
            <td>${awayTeam.name}</td>
            <td>${risultatoText}</td>
            <td>
                <button class="btn btn-sm btn-success rugby-result" data-id="${match.id}" title="Referto Arbitrale">
                    <i class="fas fa-clipboard-list"></i>
                </button>
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
            editMatch(matchId);
        });
    });
    
    document.querySelectorAll('.rugby-result').forEach(button => {
        button.addEventListener('click', function() {
            const matchId = this.getAttribute('data-id');
            openRugbyResultModal(matchId);
        });
    });
}

// Funzione per modificare una partita
function editMatch(matchId) {
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;
    
    // Popola il form del modal
    document.getElementById('match-date').value = match.date;
    document.getElementById('home-team').value = match.homeTeam;
    document.getElementById('away-team').value = match.awayTeam;
    document.getElementById('match-referee').value = match.referee || '';
    document.getElementById('match-location').value = match.location || '';
    
    // Aggiungi l'ID della partita come attributo data al pulsante di salvataggio
    const saveButton = document.getElementById('save-match-btn');
    saveButton.setAttribute('data-match-id', matchId);
    
    // Cambia il titolo del modal
    document.querySelector('#addMatchModal .modal-title').textContent = 'Modifica Partita';
    
    // Apri il modal
    const modal = new bootstrap.Modal(document.getElementById('addMatchModal'));
    modal.show();
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

// Funzione per calcolare la classifica
function calculateStandings() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    
    // Inizializza la classifica
    const standings = teams.map(team => ({
        id: team.id,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        scored: 0,    // Mete fatte
        conceded: 0   // Mete subite
    }));
    
    // Aggiorna la classifica in base ai risultati delle partite
    matches.forEach(match => {
        if (!match.played) return; // Ignora le partite non giocate
        
        const homeTeamIndex = standings.findIndex(team => team.id === match.homeTeam);
        const awayTeamIndex = standings.findIndex(team => team.id === match.awayTeam);
        
        if (homeTeamIndex === -1 || awayTeamIndex === -1) return;
        
        const homeTeam = standings[homeTeamIndex];
        const awayTeam = standings[awayTeamIndex];
        
        // Aggiorna il numero di partite giocate
        homeTeam.played++;
        awayTeam.played++;
        
        // Calcola i punteggi dalla partita
        let homeScore = 0;
        let awayScore = 0;
        let homeTeamTries = 0;
        let awayTeamTries = 0;
        
        if (match.rugbyDetails) {
            // Calcola il punteggio totale dai dettagli della partita
            const homeDetails = match.rugbyDetails.home;
            const awayDetails = match.rugbyDetails.away;
            
            // Calcola i punti per la squadra di casa
            homeScore += (homeDetails.periodo1.mete + homeDetails.periodo2.mete) * 5; // 5 punti per meta
            homeScore += (homeDetails.periodo1.trasformazioni + homeDetails.periodo2.trasformazioni) * 2; // 2 punti per trasformazione
            homeScore += (homeDetails.periodo1.calci + homeDetails.periodo2.calci) * 3; // 3 punti per calcio di punizione
            homeScore += (homeDetails.periodo1.drop + homeDetails.periodo2.drop) * 3; // 3 punti per drop
            
            // Calcola i punti per la squadra ospite
            awayScore += (awayDetails.periodo1.mete + awayDetails.periodo2.mete) * 5;
            awayScore += (awayDetails.periodo1.trasformazioni + awayDetails.periodo2.trasformazioni) * 2;
            awayScore += (awayDetails.periodo1.calci + awayDetails.periodo2.calci) * 3;
            awayScore += (awayDetails.periodo1.drop + awayDetails.periodo2.drop) * 3;
            
            // Calcola le mete totali
            homeTeamTries = homeDetails.periodo1.mete + homeDetails.periodo2.mete;
            awayTeamTries = awayDetails.periodo1.mete + awayDetails.periodo2.mete;
        } else {
            // Usa i punteggi diretti se i dettagli non sono disponibili
            homeScore = match.homeScore || 0;
            awayScore = match.awayScore || 0;
        }
        
        // Aggiorna mete fatte e subite
        homeTeam.scored += homeTeamTries;
        homeTeam.conceded += awayTeamTries;
        awayTeam.scored += awayTeamTries;
        awayTeam.conceded += homeTeamTries;
        
        // Aggiorna vittorie, pareggi, sconfitte e punti in classifica
        if (homeScore > awayScore) {
            homeTeam.won++;
            homeTeam.points += 4; // 4 punti per la vittoria
            awayTeam.lost++;
            
            // Bonus punto per chi perde con meno di 7 punti di scarto
            if (homeScore - awayScore <= 7) {
                awayTeam.points += 1;
            }
        } else if (homeScore < awayScore) {
            awayTeam.won++;
            awayTeam.points += 4; // 4 punti per la vittoria
            homeTeam.lost++;
            
            // Bonus punto per chi perde con meno di 7 punti di scarto
            if (awayScore - homeScore <= 7) {
                homeTeam.points += 1;
            }
        } else {
            homeTeam.drawn++;
            awayTeam.drawn++;
            homeTeam.points += 2; // 2 punti per il pareggio
            awayTeam.points += 2; // 2 punti per il pareggio
        }
        
        // Bonus punti per chi segna 4 o più mete (1 punto extra)
        if (homeTeamTries >= 4) {
            homeTeam.points += 1;
        }
        if (awayTeamTries >= 4) {
            awayTeam.points += 1;
        }
    });
    
    // Salva la classifica aggiornata
    localStorage.setItem('rugbyStandings', JSON.stringify(standings));
    
    return standings;
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

    // Popola anche il select degli arbitri
    populateRefereeSelect();
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

// Apre il modal per i risultati dettagliati di rugby
function openRugbyResultModal(matchId) {
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;
    
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const homeTeam = teams.find(team => team.id === match.homeTeam);
    const awayTeam = teams.find(team => team.id === match.awayTeam);
    
    if (!homeTeam || !awayTeam) return;
    
    // Imposta i nomi delle squadre nel modal
    document.getElementById('squadra-casa-nome').textContent = homeTeam.name;
    document.getElementById('squadra-ospite-nome').textContent = awayTeam.name;
    
    // Memorizza l'ID della partita
    document.getElementById('match-id-result').value = matchId;
    
    // Imposta lo stato della partita
    if (match.status === 'sospesa') {
        document.getElementById('match-sospesa').checked = true;
    } else {
        document.getElementById('match-disputata').checked = true;
    }
    
    // Imposta i valori dei campi se esistono dati dettagliati
    if (match.rugbyDetails) {
        // Squadra casa
        document.getElementById('home-mete-1t').value = match.rugbyDetails.home.periodo1.mete;
        document.getElementById('home-trasf-1t').value = match.rugbyDetails.home.periodo1.trasformazioni;
        document.getElementById('home-puniz-1t').value = match.rugbyDetails.home.periodo1.punizioni;
        document.getElementById('home-drop-1t').value = match.rugbyDetails.home.periodo1.drop;
        
        document.getElementById('home-mete-2t').value = match.rugbyDetails.home.periodo2.mete;
        document.getElementById('home-trasf-2t').value = match.rugbyDetails.home.periodo2.trasformazioni;
        document.getElementById('home-puniz-2t').value = match.rugbyDetails.home.periodo2.punizioni;
        document.getElementById('home-drop-2t').value = match.rugbyDetails.home.periodo2.drop;
        
        // Squadra ospite
        document.getElementById('away-mete-1t').value = match.rugbyDetails.away.periodo1.mete;
        document.getElementById('away-trasf-1t').value = match.rugbyDetails.away.periodo1.trasformazioni;
        document.getElementById('away-puniz-1t').value = match.rugbyDetails.away.periodo1.punizioni;
        document.getElementById('away-drop-1t').value = match.rugbyDetails.away.periodo1.drop;
        
        document.getElementById('away-mete-2t').value = match.rugbyDetails.away.periodo2.mete;
        document.getElementById('away-trasf-2t').value = match.rugbyDetails.away.periodo2.trasformazioni;
        document.getElementById('away-puniz-2t').value = match.rugbyDetails.away.periodo2.punizioni;
        document.getElementById('away-drop-2t').value = match.rugbyDetails.away.periodo2.drop;
    } else {
        // Reset dei campi
        document.getElementById('home-mete-1t').value = 0;
        document.getElementById('home-trasf-1t').value = 0;
        document.getElementById('home-puniz-1t').value = 0;
        document.getElementById('home-drop-1t').value = 0;
        
        document.getElementById('home-mete-2t').value = 0;
        document.getElementById('home-trasf-2t').value = 0;
        document.getElementById('home-puniz-2t').value = 0;
        document.getElementById('home-drop-2t').value = 0;
        
        document.getElementById('away-mete-1t').value = 0;
        document.getElementById('away-trasf-1t').value = 0;
        document.getElementById('away-puniz-1t').value = 0;
        document.getElementById('away-drop-1t').value = 0;
        
        document.getElementById('away-mete-2t').value = 0;
        document.getElementById('away-trasf-2t').value = 0;
        document.getElementById('away-puniz-2t').value = 0;
        document.getElementById('away-drop-2t').value = 0;
    }
    
    // Calcola i totali
    updateRugbyTotals();
    
    // Apri il modal
    const rugbyResultModal = new bootstrap.Modal(document.getElementById('rugbyResultModal'));
    rugbyResultModal.show();
}

// Funzione per aggiornare i totali nel modal dei risultati
function updateRugbyTotals() {
    // Home team
    const homeMete1T = parseInt(document.getElementById('home-mete-1t').value) || 0;
    const homeTrasf1T = parseInt(document.getElementById('home-trasf-1t').value) || 0;
    const homePuniz1T = parseInt(document.getElementById('home-puniz-1t').value) || 0;
    const homeDrop1T = parseInt(document.getElementById('home-drop-1t').value) || 0;
    
    const homeMete2T = parseInt(document.getElementById('home-mete-2t').value) || 0;
    const homeTrasf2T = parseInt(document.getElementById('home-trasf-2t').value) || 0;
    const homePuniz2T = parseInt(document.getElementById('home-puniz-2t').value) || 0;
    const homeDrop2T = parseInt(document.getElementById('home-drop-2t').value) || 0;
    
    const homeMeteTot = homeMete1T + homeMete2T;
    const homeTrasfTot = homeTrasf1T + homeTrasf2T;
    const homePunizTot = homePuniz1T + homePuniz2T;
    const homeDropTot = homeDrop1T + homeDrop2T;
    
    // Aggiorna i totali nella tabella
    document.getElementById('home-mete-tot').textContent = homeMeteTot;
    document.getElementById('home-trasf-tot').textContent = homeTrasfTot;
    document.getElementById('home-puniz-tot').textContent = homePunizTot;
    document.getElementById('home-drop-tot').textContent = homeDropTot;
    
    // Calcola il punteggio totale
    const homeTotal = (homeMeteTot * 5) + (homeTrasfTot * 2) + (homePunizTot * 3) + (homeDropTot * 3);
    document.getElementById('home-total-score').textContent = homeTotal;
    
    // Away team
    const awayMete1T = parseInt(document.getElementById('away-mete-1t').value) || 0;
    const awayTrasf1T = parseInt(document.getElementById('away-trasf-1t').value) || 0;
    const awayPuniz1T = parseInt(document.getElementById('away-puniz-1t').value) || 0;
    const awayDrop1T = parseInt(document.getElementById('away-drop-1t').value) || 0;
    
    const awayMete2T = parseInt(document.getElementById('away-mete-2t').value) || 0;
    const awayTrasf2T = parseInt(document.getElementById('away-trasf-2t').value) || 0;
    const awayPuniz2T = parseInt(document.getElementById('away-puniz-2t').value) || 0;
    const awayDrop2T = parseInt(document.getElementById('away-drop-2t').value) || 0;
    
    const awayMeteTot = awayMete1T + awayMete2T;
    const awayTrasfTot = awayTrasf1T + awayTrasf2T;
    const awayPunizTot = awayPuniz1T + awayPuniz2T;
    const awayDropTot = awayDrop1T + awayDrop2T;
    
    // Aggiorna i totali nella tabella
    document.getElementById('away-mete-tot').textContent = awayMeteTot;
    document.getElementById('away-trasf-tot').textContent = awayTrasfTot;
    document.getElementById('away-puniz-tot').textContent = awayPunizTot;
    document.getElementById('away-drop-tot').textContent = awayDropTot;
    
    // Calcola il punteggio totale
    const awayTotal = (awayMeteTot * 5) + (awayTrasfTot * 2) + (awayPunizTot * 3) + (awayDropTot * 3);
    document.getElementById('away-total-score').textContent = awayTotal;
}

// Aggiungi event listeners per aggiornare i totali quando i campi vengono modificati
const rugbyInputs = document.querySelectorAll('#rugby-result-form input[type="number"]');
rugbyInputs.forEach(input => {
    input.addEventListener('input', updateRugbyTotals);
});

// Aggiungi event listener per il pulsante di salvataggio dei risultati
document.getElementById('save-rugby-result-btn').addEventListener('click', function() {
    const matchId = document.getElementById('match-id-result').value;
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) return;
    
    // Ottieni tutti i valori dal form
    const homeMete1T = parseInt(document.getElementById('home-mete-1t').value) || 0;
    const homeTrasf1T = parseInt(document.getElementById('home-trasf-1t').value) || 0;
    const homePuniz1T = parseInt(document.getElementById('home-puniz-1t').value) || 0;
    const homeDrop1T = parseInt(document.getElementById('home-drop-1t').value) || 0;
    
    const homeMete2T = parseInt(document.getElementById('home-mete-2t').value) || 0;
    const homeTrasf2T = parseInt(document.getElementById('home-trasf-2t').value) || 0;
    const homePuniz2T = parseInt(document.getElementById('home-puniz-2t').value) || 0;
    const homeDrop2T = parseInt(document.getElementById('home-drop-2t').value) || 0;
    
    const awayMete1T = parseInt(document.getElementById('away-mete-1t').value) || 0;
    const awayTrasf1T = parseInt(document.getElementById('away-trasf-1t').value) || 0;
    const awayPuniz1T = parseInt(document.getElementById('away-puniz-1t').value) || 0;
    const awayDrop1T = parseInt(document.getElementById('away-drop-1t').value) || 0;
    
    const awayMete2T = parseInt(document.getElementById('away-mete-2t').value) || 0;
    const awayTrasf2T = parseInt(document.getElementById('away-trasf-2t').value) || 0;
    const awayPuniz2T = parseInt(document.getElementById('away-puniz-2t').value) || 0;
    const awayDrop2T = parseInt(document.getElementById('away-drop-2t').value) || 0;
    
    // Ottieni lo stato della partita
    const matchStatus = document.querySelector('input[name="match-status"]:checked').value;
    
    // Calcola i punteggi totali
    const homeTotal = (homeMete1T + homeMete2T) * 5 + (homeTrasf1T + homeTrasf2T) * 2 + 
                      (homePuniz1T + homePuniz2T) * 3 + (homeDrop1T + homeDrop2T) * 3;
    
    const awayTotal = (awayMete1T + awayMete2T) * 5 + (awayTrasf1T + awayTrasf2T) * 2 + 
                      (awayPuniz1T + awayPuniz2T) * 3 + (awayDrop1T + awayDrop2T) * 3;
    
    // Aggiorna l'oggetto partita
    matches[matchIndex].rugbyDetails = {
        home: {
            periodo1: {
                mete: homeMete1T,
                trasformazioni: homeTrasf1T,
                punizioni: homePuniz1T,
                drop: homeDrop1T
            },
            periodo2: {
                mete: homeMete2T,
                trasformazioni: homeTrasf2T,
                punizioni: homePuniz2T,
                drop: homeDrop2T
            }
        },
        away: {
            periodo1: {
                mete: awayMete1T,
                trasformazioni: awayTrasf1T,
                punizioni: awayPuniz1T,
                drop: awayDrop1T
            },
            periodo2: {
                mete: awayMete2T,
                trasformazioni: awayTrasf2T,
                punizioni: awayPuniz2T,
                drop: awayDrop2T
            }
        }
    };
    
    matches[matchIndex].homeScore = homeTotal;
    matches[matchIndex].awayScore = awayTotal;
    matches[matchIndex].played = true;
    matches[matchIndex].status = matchStatus;
    
    // Salva le modifiche
    localStorage.setItem('rugbyMatches', JSON.stringify(matches));
    
    // Aggiorna la visualizzazione
    renderMatches();
    
    // Ricalcola la classifica
    calculateStandings();
    renderStandings();
    
    // Chiudi il modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('rugbyResultModal'));
    modal.hide();
    
    alert('Risultato salvato con successo!');
});

// Popola la tabella degli arbitri
function renderReferees() {
    const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    const tableBody = document.getElementById('referees-table-body');
    
    tableBody.innerHTML = '';
    
    referees.forEach(referee => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${referee.id.substring(0, 6)}...</td>
            <td>${referee.name}</td>
            <td>${referee.surname}</td>
            <td>${referee.email}</td>
            <td>${referee.phone}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-referee" data-id="${referee.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-referee" data-id="${referee.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Aggiungi event listener ai pulsanti
    document.querySelectorAll('.delete-referee').forEach(button => {
        button.addEventListener('click', function() {
            const refereeId = this.getAttribute('data-id');
            if (confirm('Sei sicuro di voler eliminare questo arbitro?')) {
                deleteReferee(refereeId);
            }
        });
    });
    
    document.querySelectorAll('.edit-referee').forEach(button => {
        button.addEventListener('click', function() {
            const refereeId = this.getAttribute('data-id');
            editReferee(refereeId);
        });
    });
}

// Elimina un arbitro
function deleteReferee(refereeId) {
    let referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    referees = referees.filter(referee => referee.id !== refereeId);
    localStorage.setItem('rugbyReferees', JSON.stringify(referees));
    
    // Aggiorna anche le partite che coinvolgono questo arbitro
    let matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    matches = matches.map(match => {
        if (match.referee === refereeId) {
            match.referee = '';
        }
        return match;
    });
    localStorage.setItem('rugbyMatches', JSON.stringify(matches));
    
    // Aggiorna la visualizzazione
    renderReferees();
    renderMatches();
    populateRefereeSelect();
    updateStatistics();
}

// Modifica un arbitro
function editReferee(refereeId) {
    const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    const referee = referees.find(ref => ref.id === refereeId);
    
    if (!referee) return;
    
    // Popola il form
    document.getElementById('referee-id').value = referee.id;
    document.getElementById('referee-name').value = referee.name;
    document.getElementById('referee-surname').value = referee.surname;
    document.getElementById('referee-email').value = referee.email;
    document.getElementById('referee-phone').value = referee.phone;
    document.getElementById('referee-level').value = referee.level;
    
    // Cambia il titolo del modal
    document.querySelector('#addRefereeModal .modal-title').textContent = 'Modifica Arbitro';
    
    // Apri il modal
    const modal = new bootstrap.Modal(document.getElementById('addRefereeModal'));
    modal.show();
}

// Popola il select degli arbitri
function populateRefereeSelect() {
    const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    const refereeSelect = document.getElementById('match-referee');
    
    // Rimuovi tutte le opzioni tranne la prima
    while (refereeSelect.options.length > 1) {
        refereeSelect.remove(1);
    }
    
    // Aggiungi le opzioni
    referees.forEach(referee => {
        const option = document.createElement('option');
        option.value = referee.id;
        option.textContent = `${referee.name} ${referee.surname}`;
        refereeSelect.appendChild(option);
    });
}

// Calcola e aggiorna le statistiche
function updateStatistics() {
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const referees = JSON.parse(localStorage.getItem('rugbyReferees')) || [];
    const playedMatches = matches.filter(match => match.played);
    
    // Statistiche globali
    const totalMatches = playedMatches.length;
    let totalTries = 0;
    let totalPoints = 0;
    let maxScore = 0;
    
    // Statistiche per squadra
    const teamStats = teams.map(team => {
        const teamMatches = playedMatches.filter(match => 
            match.homeTeam === team.id || match.awayTeam === team.id);
        
        let totalTeamTries = 0;
        let totalTeamPoints = 0;
        
        teamMatches.forEach(match => {
            if (match.rugbyDetails) {
                if (match.homeTeam === team.id) {
                    // La squadra è quella di casa
                    const homeMete = match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete;
                    totalTeamTries += homeMete;
                    
                    const homePoints = 
                        (match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete) * 5 +
                        (match.rugbyDetails.home.periodo1.trasformazioni + match.rugbyDetails.home.periodo2.trasformazioni) * 2 +
                        (match.rugbyDetails.home.periodo1.punizioni + match.rugbyDetails.home.periodo2.punizioni) * 3 +
                        (match.rugbyDetails.home.periodo1.drop + match.rugbyDetails.home.periodo2.drop) * 3;
                    
                    totalTeamPoints += homePoints;
                    maxScore = Math.max(maxScore, homePoints);
                } else {
                    // La squadra è quella ospite
                    const awayMete = match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete;
                    totalTeamTries += awayMete;
                    
                    const awayPoints = 
                        (match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete) * 5 +
                        (match.rugbyDetails.away.periodo1.trasformazioni + match.rugbyDetails.away.periodo2.trasformazioni) * 2 +
                        (match.rugbyDetails.away.periodo1.punizioni + match.rugbyDetails.away.periodo2.punizioni) * 3 +
                        (match.rugbyDetails.away.periodo1.drop + match.rugbyDetails.away.periodo2.drop) * 3;
                    
                    totalTeamPoints += awayPoints;
                    maxScore = Math.max(maxScore, awayPoints);
                }
            }
        });
        
        totalTries += totalTeamTries;
        totalPoints += totalTeamPoints;
        
        const efficiency = teamMatches.length > 0 ? (totalTeamPoints / teamMatches.length).toFixed(2) : 0;
        
        return {
            id: team.id,
            name: team.name,
            matches: teamMatches.length,
            tries: totalTeamTries,
            points: totalTeamPoints,
            efficiency: efficiency
        };
    });
    
    // Statistiche per arbitro
    const refereeStats = referees.map(referee => {
        const refereeMatches = playedMatches.filter(match => match.referee === referee.id);
        
        let totalRefereeTries = 0;
        let totalRefereePoints = 0;
        
        refereeMatches.forEach(match => {
            if (match.rugbyDetails) {
                const homeMete = match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete;
                const awayMete = match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete;
                totalRefereeTries += homeMete + awayMete;
                
                const homePoints = 
                    (match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete) * 5 +
                    (match.rugbyDetails.home.periodo1.trasformazioni + match.rugbyDetails.home.periodo2.trasformazioni) * 2 +
                    (match.rugbyDetails.home.periodo1.punizioni + match.rugbyDetails.home.periodo2.punizioni) * 3 +
                    (match.rugbyDetails.home.periodo1.drop + match.rugbyDetails.home.periodo2.drop) * 3;
                
                const awayPoints = 
                    (match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete) * 5 +
                    (match.rugbyDetails.away.periodo1.trasformazioni + match.rugbyDetails.away.periodo2.trasformazioni) * 2 +
                    (match.rugbyDetails.away.periodo1.punizioni + match.rugbyDetails.away.periodo2.punizioni) * 3 +
                    (match.rugbyDetails.away.periodo1.drop + match.rugbyDetails.away.periodo2.drop) * 3;
                
                totalRefereePoints += homePoints + awayPoints;
            }
        });
        
        const avgPoints = refereeMatches.length > 0 ? (totalRefereePoints / refereeMatches.length).toFixed(2) : 0;
        
        return {
            id: referee.id,
            name: `${referee.name} ${referee.surname}`,
            matches: refereeMatches.length,
            tries: totalRefereeTries,
            avgPoints: avgPoints
        };
    });
    
    // Aggiorna le tabelle e i contatori
    // Tabella squadre
    const teamStatsTable = document.getElementById('team-stats-table');
    teamStatsTable.innerHTML = '';
    
    teamStats.sort((a, b) => b.points - a.points).forEach(stat => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.matches}</td>
            <td>${stat.tries}</td>
            <td>${stat.efficiency}</td>
        `;
        
        teamStatsTable.appendChild(row);
    });
    
    // Tabella arbitri
    const refereeStatsTable = document.getElementById('referee-stats-table');
    refereeStatsTable.innerHTML = '';
    
    refereeStats.sort((a, b) => b.matches - a.matches).forEach(stat => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.matches}</td>
            <td>${stat.tries}</td>
            <td>${stat.avgPoints}</td>
        `;
        
        refereeStatsTable.appendChild(row);
    });
    
    // Statistiche globali
    document.getElementById('total-matches-stat').textContent = totalMatches;
    document.getElementById('total-tries-stat').textContent = totalTries;
    document.getElementById('avg-points-stat').textContent = totalMatches > 0 ? (totalPoints / totalMatches).toFixed(2) : 0;
    document.getElementById('max-score-stat').textContent = maxScore;
} 