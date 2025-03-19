document.addEventListener('DOMContentLoaded', function() {
    console.log('Inizializzazione applicazione...');
    
    // Inizializzazione EmailJS
    try {
        emailjs.init("_tgxLcltA1eWDBu-W");
        console.log('EmailJS inizializzato con successo');
    } catch (error) {
        console.error('Errore durante l\'inizializzazione di EmailJS:', error);
    }

    // Inizializzazione del calendario
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'it',
        initialView: window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
            },
            listMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
            }
        },
        height: 'auto',
        expandRows: true,
        windowResize: function(view) {
            if (window.innerWidth < 768) {
                calendar.changeView('listMonth');
            } else {
                calendar.changeView('dayGridMonth');
            }
        },
        eventClick: function(info) {
            // Reindirizza alla pagina dei dettagli della partita
            window.location.href = 'partita.html?id=' + info.event.id;
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            // Ottiene le partite dal localStorage
            const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
            const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
            
            const events = matches.map(match => {
                const homeTeam = teams.find(team => team.id === match.homeTeam) || { name: 'Squadra Sconosciuta' };
                const awayTeam = teams.find(team => team.id === match.awayTeam) || { name: 'Squadra Sconosciuta' };
                
                // Calcola il punteggio totale
                let homeScore = match.homeScore;
                let awayScore = match.awayScore;
                
                if (match.rugbyDetails) {
                    const homeDetails = match.rugbyDetails.home;
                    const awayDetails = match.rugbyDetails.away;
                    
                    homeScore = (homeDetails.periodo1.mete + homeDetails.periodo2.mete) * 5 + 
                               (homeDetails.periodo1.trasformazioni + homeDetails.periodo2.trasformazioni) * 2 + 
                               (homeDetails.periodo1.punizioni + homeDetails.periodo2.punizioni) * 3 + 
                               (homeDetails.periodo1.drop + homeDetails.periodo2.drop) * 3;
                    
                    awayScore = (awayDetails.periodo1.mete + awayDetails.periodo2.mete) * 5 + 
                               (awayDetails.periodo1.trasformazioni + awayDetails.periodo2.trasformazioni) * 2 + 
                               (awayDetails.periodo1.punizioni + awayDetails.periodo2.punizioni) * 3 + 
                               (awayDetails.periodo1.drop + awayDetails.periodo2.drop) * 3;
                }
                
                // Crea il titolo con il punteggio se la partita è stata giocata
                let title = `${homeTeam.name} vs ${awayTeam.name}`;
                if (match.played) {
                    title += ` (${homeScore} - ${awayScore})`;
                    if (match.status === 'sospesa') {
                        title += ' [SOSPESA]';
                    }
                }
                
                return {
                    id: match.id,
                    title: title,
                    start: match.date,
                    backgroundColor: match.played ? (match.status === 'sospesa' ? '#dc3545' : '#28a745') : '#007bff',
                    textColor: '#ffffff',
                    borderColor: match.played ? (match.status === 'sospesa' ? '#b21e2d' : '#218838') : '#0069d9',
                    url: null // Non usare l'url predefinito, ma gestire il click con eventClick
                };
            });
            
            successCallback(events);
        }
    });
    calendar.render();

    // Carica la classifica
    loadStandings();

    // Gestione del form di iscrizione
    const formIscrizione = document.getElementById('form-iscrizione');
    
    if (!formIscrizione) {
        console.error('Form di iscrizione non trovato nel DOM');
    } else {
        console.log('Form di iscrizione trovato e configurato');
    }
    
    formIscrizione.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form sottomesso, inizio processo di invio...');
        
        // Mostra un messaggio di caricamento
        const submitButton = formIscrizione.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Invio in corso...';
        submitButton.disabled = true;

        try {
            // Log dei valori del form
            const formData = {
                nomeSquadra: document.getElementById('nome-squadra').value,
                categoria: document.getElementById('categoria').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value
            };
            console.log('Dati del form raccolti:', formData);

            // Prepara i dati per l'email
            const now = new Date();
            const dateStr = now.toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            console.log('Data formattata:', dateStr);

            const templateParams = {
                to_email: 'muylolito1999@gmail.com',
                nomeSquadra: formData.nomeSquadra,
                categoria: formData.categoria,
                email: formData.email,
                telefono: formData.telefono,
                date: dateStr
            };
            console.log('Parametri template preparati:', templateParams);

            // Invia l'email usando il tuo servizio e template
            console.log('Tentativo di invio email con service_4zm2m4t e template_slk1ikr...');
            const response = await emailjs.send('service_4zm2m4t', 'template_slk1ikr', templateParams);
            console.log('Risposta da EmailJS:', response);
            
            alert('Iscrizione inviata con successo!');
            formIscrizione.reset();
            console.log('Form resettato dopo invio con successo');
        } catch (error) {
            console.error('Dettagli completi dell\'errore:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                error: error
            });
            alert('Si è verificato un errore durante l\'invio dei dati. Riprova più tardi.\nErrore: ' + error.message);
        } finally {
            // Ripristina il pulsante
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            console.log('Pulsante di submit ripristinato');
        }
    });

    // Dati di esempio per il prossimo incontro
    const prossimoIncontro = {
        data: '2024-04-15',
        squadre: 'Leoni vs Tigri'
    };

    // Aggiorna le informazioni del prossimo incontro
    document.getElementById('prossima-data').textContent = new Date(prossimoIncontro.data).toLocaleDateString('it-IT');
    document.getElementById('prossime-squadre').textContent = prossimoIncontro.squadre;
});

// Carica la classifica
function loadStandings() {
    const standingsTable = document.getElementById('standings-table');
    if (!standingsTable) return;
    
    const standings = JSON.parse(localStorage.getItem('rugbyStandings')) || [];
    
    // Ordina per punti
    standings.sort((a, b) => b.points - a.points);
    
    if (standings.length === 0) {
        standingsTable.innerHTML = '<tr><td colspan="8" class="text-center">Nessuna squadra in classifica</td></tr>';
        return;
    }
    
    standingsTable.innerHTML = '';
    
    standings.forEach((team, index) => {
        // Calcola il numero di mete fatte e subite dalle statistiche delle partite
        let meteFatte = 0;
        let meteSubite = 0;
        
        // Verifica se ci sono dati delle mete
        if (team.scored !== undefined) {
            meteFatte = team.scored;
            meteSubite = team.conceded;
        } else {
            // Cerca le partite giocate dalla squadra
            const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
            const teamMatches = matches.filter(match => 
                (match.homeTeam === team.id || match.awayTeam === team.id) && match.played);
            
            teamMatches.forEach(match => {
                if (match.rugbyDetails) {
                    if (match.homeTeam === team.id) {
                        // La squadra è quella di casa
                        meteFatte += match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete;
                        meteSubite += match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete;
                    } else {
                        // La squadra è quella ospite
                        meteFatte += match.rugbyDetails.away.periodo1.mete + match.rugbyDetails.away.periodo2.mete;
                        meteSubite += match.rugbyDetails.home.periodo1.mete + match.rugbyDetails.home.periodo2.mete;
                    }
                }
            });
        }
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${team.name}</td>
            <td><strong>${team.points}</strong></td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.lost}</td>
            <td>${meteFatte}</td>
            <td>${meteSubite}</td>
        `;
        
        standingsTable.appendChild(row);
    });
} 