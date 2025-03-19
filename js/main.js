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