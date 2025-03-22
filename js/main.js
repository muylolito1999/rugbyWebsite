/**
 * File principale che importa e coordina tutti i moduli
 */
import { initCalendar } from './modules/calendar.js';
import { updateNextMatch } from './modules/next-match.js';
import { loadStandings } from './modules/standings.js';
import { loadContents } from './modules/contents.js';
import { initForm } from './modules/form.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inizializzazione applicazione...');
    
    // Controllo se esistono dati
    const hasMatches = localStorage.getItem('rugbyMatches') !== null;
    const hasTeams = localStorage.getItem('rugbyTeams') !== null;
    console.log('Dati disponibili:', { matches: hasMatches, teams: hasTeams });
    
    // Inizializzazione EmailJS
    try {
        emailjs.init("_tgxLcltA1eWDBu-W");
        console.log('EmailJS inizializzato con successo');
    } catch (error) {
        console.error('Errore durante l\'inizializzazione di EmailJS:', error);
    }

    // Inizializzazione del calendario
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
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
                    
                    // Colori per le partite in base allo stato
                    let bgColor, borderColor;
                    
                    if (match.played) {
                        if (match.status === 'sospesa') {
                            bgColor = '#dc3545';     // Rosso per partite sospese
                            borderColor = '#b21e2d';
                        } else {
                            bgColor = '#28a745';     // Verde per partite giocate
                            borderColor = '#218838';
                        }
                    } else {
                        // Blu scuro per partite future
                        bgColor = '#003366';
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
        });
        calendar.render();
        console.log('Calendario inizializzato e renderizzato');
    } else {
        console.log('Elemento calendar non trovato nel DOM');
    }
    
    // Carica la classifica
    loadStandings();
    
    // Carica i contenuti
    loadContents();
    
    // Aggiorna le informazioni del prossimo incontro
    updateNextMatch();
    console.log('Funzione updateNextMatch() eseguita');

    // Gestione del form di iscrizione
    const formIscrizione = document.getElementById('form-iscrizione');
    
    if (!formIscrizione) {
        console.error('Form di iscrizione non trovato nel DOM');
    } else {
        console.log('Form di iscrizione trovato e configurato');
        
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
    }
});

// Funzione per aggiornare le informazioni sul prossimo incontro
function updateNextMatch() {
    const matches = JSON.parse(localStorage.getItem('rugbyMatches')) || [];
    const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
    
    // Elementi DOM
    const dataElement = document.getElementById('prossima-data');
    const squadreElement = document.getElementById('prossime-squadre');
    const luogoElement = document.getElementById('prossimo-luogo');
    
    // Verifica che gli elementi esistano nella pagina
    if (!dataElement || !squadreElement || !luogoElement) {
        console.error('Elementi DOM per il prossimo incontro non trovati');
        return;
    }
    
    // Trova la prossima partita (prima partita futura)
    const now = new Date();
    const upcomingMatches = matches
        .filter(match => !match.played && new Date(match.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log(`Trovate ${upcomingMatches.length} partite future`);
    
    if (upcomingMatches.length > 0) {
        const nextMatch = upcomingMatches[0];
        const homeTeam = teams.find(team => team.id === nextMatch.homeTeam) || { name: 'Squadra sconosciuta' };
        const awayTeam = teams.find(team => team.id === nextMatch.awayTeam) || { name: 'Squadra sconosciuta' };
        
        console.log('Prossimo incontro:', nextMatch);
        console.log('Squadra casa:', homeTeam.name);
        console.log('Squadra ospite:', awayTeam.name);
        console.log('Luogo:', nextMatch.location || 'Da definire');
        
        const matchDate = new Date(nextMatch.date);
        dataElement.textContent = matchDate.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        squadreElement.textContent = `${homeTeam.name} vs ${awayTeam.name}`;
        
        // Gestione del luogo
        luogoElement.textContent = nextMatch.location || 'Da definire';
    } else {
        dataElement.textContent = 'Nessuna partita programmata';
        squadreElement.textContent = '-';
        luogoElement.textContent = '-';
    }
}

// Carica la classifica
function loadStandings() {
    const standingsTable = document.getElementById('standings-table');
    if (!standingsTable) {
        console.log('Elemento standings-table non trovato nella pagina');
        return;
    }
    
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

// Carica i contenuti nella homepage
function loadContents() {
    const newsContainer = document.getElementById('news-container');
    const noNewsMessage = document.getElementById('no-news-message');
    
    if (!newsContainer) {
        console.log('Elemento news-container non trovato nella pagina');
        return;
    }
    
    const contents = JSON.parse(localStorage.getItem('rugbyContents')) || [];
    
    // Filtra solo i contenuti visibili
    const visibleContents = contents.filter(content => content.visible);
    
    // Ordina per data (più recenti prima)
    visibleContents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Mostra il messaggio se non ci sono contenuti
    if (visibleContents.length === 0) {
        if (noNewsMessage) noNewsMessage.classList.remove('d-none');
        return;
    } else {
        if (noNewsMessage) noNewsMessage.classList.add('d-none');
    }
    
    // Rimuovi i contenuti esistenti tranne il messaggio di nessuna news
    const childrenToRemove = Array.from(newsContainer.children).filter(child => child.id !== 'no-news-message');
    childrenToRemove.forEach(child => newsContainer.removeChild(child));
    
    // Aggiungi i contenuti
    visibleContents.forEach(content => {
        const contentDate = new Date(content.date);
        const formattedDate = contentDate.toLocaleDateString('it-IT');
        
        const contentType = {
            'news': { icon: 'fa-newspaper', color: 'primary' },
            'article': { icon: 'fa-file-alt', color: 'info' },
            'announcement': { icon: 'fa-bullhorn', color: 'warning' }
        }[content.type] || { icon: 'fa-file', color: 'secondary' };
        
        const contentCard = document.createElement('div');
        contentCard.className = 'col-md-6 col-lg-4 mb-4';
        contentCard.innerHTML = `
            <div class="card h-100 shadow">
                <div class="card-header bg-${contentType.color} text-white">
                    <i class="fas ${contentType.icon} me-2"></i> ${getContentTypeName(content.type)}
                </div>
                ${content.image ? `<img src="${content.image}" class="card-img-top" alt="Immagine del contenuto">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${content.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted"><i class="far fa-calendar-alt me-1"></i> ${formattedDate}</h6>
                    <div class="card-text mt-3">${truncateText(content.text, 150)}</div>
                </div>
                <div class="card-footer text-end">
                    <button class="btn btn-sm btn-primary view-content-details" data-id="${content.id}">
                        Leggi tutto <i class="fas fa-arrow-right ms-1"></i>
                    </button>
                </div>
            </div>
        `;
        
        newsContainer.appendChild(contentCard);
    });
    
    // Aggiungi gli event listener ai pulsanti "Leggi tutto"
    document.querySelectorAll('.view-content-details').forEach(button => {
        button.addEventListener('click', function() {
            const contentId = this.getAttribute('data-id');
            viewContentDetails(contentId);
        });
    });
}

// Funzione per troncare il testo
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Visualizza i dettagli di un contenuto
function viewContentDetails(contentId) {
    const contents = JSON.parse(localStorage.getItem('rugbyContents')) || [];
    const content = contents.find(c => c.id === contentId && c.visible);
    
    if (!content) return;
    
    // Crea un modal di visualizzazione dinamico
    const modalHtml = `
        <div class="modal fade" id="viewContentDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${content.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <span class="badge bg-secondary">
                                <i class="far fa-calendar-alt"></i> ${new Date(content.date).toLocaleDateString('it-IT')}
                            </span>
                            <span class="badge bg-primary ms-2">
                                ${getContentTypeName(content.type)}
                            </span>
                        </div>
                        ${content.image ? `<div class="mb-3"><img src="${content.image}" alt="Immagine" class="img-fluid"></div>` : ''}
                        <div class="content-text">
                            ${content.text}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Aggiungi il modal al body e mostralo
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    const viewModal = new bootstrap.Modal(document.getElementById('viewContentDetailsModal'));
    viewModal.show();
    
    // Rimuovi il modal dopo la chiusura
    document.getElementById('viewContentDetailsModal').addEventListener('hidden.bs.modal', function() {
        modalContainer.remove();
    });
}

// Funzione helper per ottenere il nome del tipo di contenuto
function getContentTypeName(typeCode) {
    const types = {
        'news': 'News',
        'article': 'Articolo',
        'announcement': 'Annuncio'
    };
    return types[typeCode] || typeCode;
} 