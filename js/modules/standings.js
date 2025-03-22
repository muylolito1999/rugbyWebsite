/**
 * Modulo per la gestione della classifica
 */

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

export { loadStandings }; 