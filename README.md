# FORGED — Version 0.1.0

Eine installierbare, offlinefähige PWA für Android. Keine Anmeldung und kein Server für deine Trainingsdaten. Die Daten werden im lokalen `localStorage` des Browsers auf dem Gerät gespeichert.

## Funktionen
- Dunkles Sportdesign, Ziel Ascona–Locarno März 2027 / Sub 3:20
- Tagesvorschlag und Trainingsphasen
- Tagesform-Check für Schlaf, Müdigkeit und Beschwerden
- Manuelles Laufprotokoll mit Wochenkilometern und Streak-Anzeige
- JSON-Backup exportieren und wieder importieren
- Offline-Caching nach dem ersten Laden
- Kein Garmin-Passwort, keine vorgetäuschte Synchronisation

## Installieren auf Samsung/Android
Eine PWA kann nicht zuverlässig direkt aus einer lokalen ZIP-Datei installiert werden. Die Dateien müssen über HTTPS gehostet werden.

### Einfacher Weg mit GitHub Pages
1. Entpacke die ZIP-Datei auf einem Computer.
2. Melde dich bei GitHub an und erstelle ein neues Repository, z. B. `forged-run`.
3. Lade `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` und den Ordner `icons` in das Stammverzeichnis des Repositorys hoch.
4. In den Repository-Einstellungen unter **Pages** die Veröffentlichung aus dem `main`-Branch und dem Root-Ordner aktivieren.
5. Öffne die angezeigte HTTPS-Adresse auf dem Samsung-Handy in Chrome.
6. Im Chrome-Menü **Installieren** oder **Zum Startbildschirm hinzufügen** auswählen.

### Alternative
Du kannst dieselben Dateien bei einem statischen Hosting-Anbieter veröffentlichen, der HTTPS anbietet. Teile deine persönliche URL nicht öffentlich, wenn du sie privat halten möchtest. Die App enthält selbst keine Server-Synchronisation; die Daten liegen im lokalen Browserprofil.

## Daten und Grenzen
- Exportiere regelmässig ein JSON-Backup. Löschen der Browserdaten oder Entfernen der App kann lokale Daten löschen.
- Ein Lauf pro Kalendertag zählt für die Streak. Zusätzliche Läufe am selben Tag zählen nicht als zusätzliche Streak-Tage.
- Trainingsvorschläge sind ein flexibler Rahmen, kein medizinischer Rat. Bei zunehmenden Schmerzen oder Krankheit nicht durch die Belastung laufen.
- Die aktuelle Version bietet noch keinen FIT-/CSV-Import und keine automatische Garmin-Synchronisation.

## Garmin API
Garmin beschreibt seine Connect APIs als Developer-Programm, das für Business-Anwendungen gedacht ist und eine Anfrage/Freigabe benötigt. Eine offizielle Integration braucht eine zugelassene API-Anbindung und typischerweise einen sicheren Server für OAuth/Webhooks. Diese statische lokale App hat keine Garmin-Anbindung. Offizielle FAQ:
https://developer.garmin.com/gc-developer-program/program-faq/


Branding: FORGED — BUILT BY DISCIPLINE. Das Flammenlogo ist in icons/ integriert.
