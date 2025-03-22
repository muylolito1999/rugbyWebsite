/**
 * Modulo per la gestione del prossimo incontro
 */

// Aggiorna le informazioni del prossimo incontro
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

export { updateNextMatch }; 