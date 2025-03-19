# Sito Torneo Rugby

Sito web per la gestione di un torneo di rugby, realizzato con HTML, Bootstrap e JavaScript.

## Funzionalità

- Form di iscrizione per le squadre
- Calendario delle partite
- Galleria fotografica
- Invio email automatico per le iscrizioni

## Tecnologie Utilizzate

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript
- EmailJS per l'invio delle email

## Come Usare

1. Clona il repository
2. Apri il file `index.html` nel browser
3. Compila il form di iscrizione per testare l'invio delle email

## Configurazione EmailJS

Per far funzionare l'invio delle email:

1. Crea un account su [EmailJS](https://www.emailjs.com/)
2. Crea un nuovo servizio email
3. Crea un nuovo template email
4. Sostituisci nel file `js/main.js`:
   - `YOUR_USER_ID` con il tuo User ID
   - `service_xxxxxxx` con il tuo Service ID
   - `template_xxxxxxx` con il tuo Template ID 