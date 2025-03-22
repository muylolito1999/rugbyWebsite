/**
 * Modulo per la gestione del calendario delle partite
 */

// Inizializza il calendario
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return null;
    
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
        events: getCalendarEvents
    });
    
    return calendar;
}

// Genera gli eventi per il calendario
function getCalendarEvents(fetchInfo, successCallback, failureCallback) {
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
        
        // Colori per le partite in base allo stato
        let bgColor, textColor, borderColor;
        
        if (match.played) {
            if (match.status === 'sospesa') {
                bgColor = '#dc3545';     // Rosso per partite sospese
                borderColor = '#b21e2d';
            } else {
                bgColor = '#28a745';     // Verde per partite giocate
                borderColor = '#218838';
            }
        } else {
            bgColor = '#003366';     // Blu scuro per partite future
            borderColor = '#002244';
        }
        
        return {
            id: match.id,
            title: title,
            start: match.date,
            backgroundColor: bgColor,
            textColor: '#ffffff', // Testo bianco per massimo contrasto
            borderColor: borderColor,
            url: null // Non usare l'url predefinito, ma gestire il click con eventClick
        };
    });
    
    successCallback(events);
}

// Esporta le funzioni
export { initCalendar }; 