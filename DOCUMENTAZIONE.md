# Documentazione del Sito Web Torneo Rugby

## Panoramica

Il sito web Torneo Rugby è una piattaforma completa per la gestione e visualizzazione di informazioni relative a un torneo di rugby. Il sito è sviluppato interamente con tecnologie client-side (HTML, CSS, JavaScript) e utilizza localStorage per memorizzare i dati, rendendo possibile la gestione completa senza necessità di server backend.

## Struttura del Progetto

```
sitoTommy/
├── css/
│   └── style.css
├── js/
│   ├── admin.js
│   ├── main.js
│   ├── reset.js
│   └── modules/
│       ├── calendar.js
│       ├── contents.js
│       ├── form.js
│       ├── next-match.js
│       └── standings.js
├── admin.html
├── index.html
├── login.html
└── partita.html
```

## Funzionalità Principali

### 1. Homepage (index.html)

- **Prossimo Incontro**: Visualizza data, squadre e luogo del prossimo match programmato
- **Form di Iscrizione**: Permette alle squadre di iscriversi al torneo
- **Calendario Partite**: Visualizza tutte le partite in un calendario interattivo
- **Classifica**: Mostra la classifica aggiornata delle squadre
- **Galleria Fotografica**: Immagini delle partite precedenti
- **News ed Aggiornamenti**: Sezione con news e contenuti recenti
- **Footer**: Link utili e accesso all'area amministrativa

### 2. Area Amministrativa (admin.html)

- **Login Protetto**: Accesso tramite credenziali (username: admin, password: admin)
- **Dashboard**: Statistiche generali e informazioni riassuntive
- **Gestione Squadre**: Aggiunta, modifica e cancellazione delle squadre
- **Gestione Partite**: Inserimento risultati dettagliati di rugby (mete, trasformazioni, punizioni, drop)
- **Gestione Classifica**: Calcolo automatico dei punti in base ai risultati
- **Gestione Contenuti**: Creazione e gestione di news, articoli e annunci con controllo visibilità

### 3. Dettaglio Partita (partita.html)

- **Informazioni Match**: Visualizzazione dettagliata di una singola partita
- **Statistiche Rugby**: Visualizzazione di mete, trasformazioni, punizioni e drop per entrambe le squadre
- **Periodi**: Dettaglio dei punti per primo e secondo tempo

## Architettura Tecnica

### 1. Frontend

- **HTML5**: Struttura delle pagine
- **CSS3/Bootstrap 5**: Stile e layout responsive
- **JavaScript (ES6+)**: Logica di presentazione e gestione dati
- **FullCalendar**: Visualizzazione del calendario delle partite
- **EmailJS**: Invio di email dal form di iscrizione

### 2. Struttura Modulare JavaScript

Il codice è organizzato in moduli ES6 per migliorare la manutenibilità:

- **main.js**: Coordinamento dei moduli e inizializzazione
- **calendar.js**: Gestione del calendario partite
- **next-match.js**: Visualizzazione del prossimo incontro
- **standings.js**: Gestione della classifica
- **contents.js**: Gestione dei contenuti e news
- **form.js**: Gestione del form di iscrizione
- **admin.js**: Logica dell'interfaccia amministrativa

### 3. Gestione Dati

- **localStorage**: Memorizzazione dei dati nel browser dell'utente
- **Strutture Dati**:
  - `rugbyTeams`: Array di oggetti squadra
  - `rugbyMatches`: Array di oggetti partita con dettagli rugby
  - `rugbyReferees`: Array di oggetti arbitro
  - `rugbyContents`: Array di oggetti contenuto
  - `rugbyStandings`: Array di oggetti classifica

## Guida all'Installazione e Deploy

### Requisiti

- Web server (Apache, Nginx, o similare)
- Connessione internet per i CDN di Bootstrap, FullCalendar e EmailJS

### Procedura di Deploy

1. **Upload dei File**:
   - Caricare tutti i file e le cartelle del progetto sul server web

2. **Configurazione EmailJS**:
   - Creare un account su [EmailJS](https://www.emailjs.com/)
   - Creare un servizio email e ottenere l'ID servizio
   - Creare un template email con i seguenti parametri:
     - `to_email`: Email destinatario
     - `nomeSquadra`: Nome della squadra
     - `categoria`: Categoria della squadra
     - `email`: Email di contatto
     - `telefono`: Telefono di contatto
     - `date`: Data di invio
   - Ottenere l'ID template
   - Ottenere l'ID utente pubblico
   - Sostituire i valori in js/modules/form.js:
     ```javascript
     emailjs.init("IL_TUO_ID_UTENTE"); // Riga 9
     
     // ... e aggiornare questi valori nella funzione di invio ...
     const response = await emailjs.send('IL_TUO_ID_SERVIZIO', 'IL_TUO_ID_TEMPLATE', templateParams);
     ```

3. **Personalizzazione**:
   - Modificare i dati di esempio in `admin.js` nella funzione `initData()`
   - Personalizzare i loghi e le immagini in base alle esigenze
   - Aggiornare i testi e le informazioni di contatto nell'HTML

4. **Test**:
   - Verificare che tutte le funzionalità siano operative
   - Testare su diversi dispositivi per confermare la responsività
   - Verificare che EmailJS funzioni correttamente con il form di iscrizione

5. **Debug**:
   - Per facilitare il debug, aggiungere `?debug=true` all'URL del sito
   - Verrà visualizzato un pulsante "Reset Dati" che permette di reinizializzare i dati di esempio

## Dettaglio delle API

### 1. EmailJS

```javascript
// Inizializzazione
emailjs.init("_tgxLcltA1eWDBu-W");

// Invio email
emailjs.send('service_4zm2m4t', 'template_slk1ikr', {
    to_email: 'destinatario@example.com',
    nomeSquadra: 'Nome Squadra',
    categoria: 'Categoria',
    email: 'email@example.com',
    telefono: '1234567890',
    date: '01/01/2024 12:30'
});
```

### 2. LocalStorage

```javascript
// Salvare dati
localStorage.setItem('rugbyTeams', JSON.stringify(teams));

// Recuperare dati
const teams = JSON.parse(localStorage.getItem('rugbyTeams')) || [];
```

## Calcolo Punteggi Rugby

Il sistema calcola automaticamente i punteggi delle partite di rugby secondo le seguenti regole:

- Mete: 5 punti ciascuna
- Trasformazioni: 2 punti ciascuna
- Punizioni: 3 punti ciascuna
- Drop: 3 punti ciascuno
- Punti classifica: 4 per vittoria, 1 per pareggio, 0 per sconfitta

## Sicurezza

- L'accesso all'area amministrativa è protetto da credenziali semplici (adeguate per uso dimostrativo)
- I dati sono memorizzati solo localmente nel browser dell'utente
- Non è richiesta alcuna connessione a database esterni

## Limitazioni

- Essendo basato su localStorage, i dati sono limitati al browser dell'utente (circa 5MB)
- L'invio di email richiede integrazione con EmailJS (servizio esterno)
- Non è prevista sincronizzazione tra diversi utenti/dispositivi

## Manutenzione

- **Backup dei Dati**: Per preservare i dati, è possibile esportarli periodicamente da localStorage
- **Aggiornamenti**: I CDN di Bootstrap, FullCalendar e altre librerie vanno aggiornati periodicamente per motivi di sicurezza
- **Dimensione localStorage**: Monitorare la dimensione dei dati per evitare il superamento dei limiti

## Consigli per lo Sviluppo Futuro

- Implementare un backend per la sincronizzazione dei dati
- Aggiungere autenticazione robusta per l'area amministrativa
- Sviluppare una funzionalità di esportazione/importazione dati
- Implementare notifiche in tempo reale per nuovi contenuti o risultati

## Supporto e Contatti

Per assistenza tecnica o domande relative al sito, contattare:
- Email: muylolito1999@gmail.com

---

© 2024 Torneo Rugby. Tutti i diritti riservati. 