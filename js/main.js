document.addEventListener('DOMContentLoaded', function() {
    // Inizializzazione EmailJS
    emailjs.init("YOUR_USER_ID"); // Sostituisci con il tuo User ID di EmailJS

    // Inizializzazione del calendario
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'it',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Leoni vs Tigri',
                start: '2024-04-15T15:00:00',
                end: '2024-04-15T17:00:00'
            },
            {
                title: 'Orsi vs Lupi',
                start: '2024-04-22T15:00:00',
                end: '2024-04-22T17:00:00'
            },
            {
                title: 'Finale Torneo',
                start: '2024-05-01T16:00:00',
                end: '2024-05-01T18:00:00'
            }
        ]
    });
    calendar.render();

    // Gestione del form di iscrizione
    const formIscrizione = document.getElementById('form-iscrizione');
    
    formIscrizione.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostra un messaggio di caricamento
        const submitButton = formIscrizione.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Invio in corso...';
        submitButton.disabled = true;

        try {
            // Prepara i dati per l'email
            const templateParams = {
                nomeSquadra: document.getElementById('nome-squadra').value,
                categoria: document.getElementById('categoria').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value
            };

            // Invia l'email
            await emailjs.send('service_4zm2m4t', 'template_0r5mdvu', templateParams);
            
            alert('Iscrizione inviata con successo!');
            formIscrizione.reset();
        } catch (error) {
            console.error('Errore durante l\'invio dei dati:', error);
            alert('Si è verificato un errore durante l\'invio dei dati. Riprova più tardi.');
        } finally {
            // Ripristina il pulsante
            submitButton.textContent = originalText;
            submitButton.disabled = false;
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