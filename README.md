# Physics OS — v0.3

Eigenständige, lokal-first Studien-App für Physik. **`uni-hypernotes` wird nicht verwendet oder verändert.**

## Was v0.3 bereits kann

- Dashboard mit nächstem Fokus, Concept Radar, Focus-Streak und täglichen Mini-Missionen
- Studienbereich mit Modulen, Aufgaben, Prioritäten, Fälligkeiten und Fortschritt
- Smart Import per Drag & Drop für PDF, CSV/TSV, TXT/Markdown und Bilder
- lokale Textanalyse für analysierbare Dateien: Physik-Themen, Zahlen, mögliche Gleichungen und Vorschau
- großer Formel-Explorer mit Variablen, Einheiten, Umstellungen und Verknüpfungen zum Trainer/Playground
- Physics Problem Trainer mit Kinematik, Newton, Energie und Elektrizität sowie gestuften Hinweisen
- Messdaten-Lab mit Mittelwert, Stichproben-Standardabweichung, linearer Regression, Parameterunsicherheiten und Plot
- Gaußscher Unsicherheits-Rechner für Produkte/Potenzen
- Physics Playground mit interaktivem schiefem Wurf und Schwarzkörperstrahlung
- Lernkarten mit Goodnotes-CSV-Export und einfachem Spaced-Repetition-System
- AES-256-GCM verschlüsseltes Vault-Backup
- Sync-Schicht mit Geräte-ID, Sync-ID, Push/Pull, Auto-Sync und clientseitiger Verschlüsselung
- PWA-/Offline-Grundlage
- Command Palette über `Ctrl/Cmd + K`

## Datenschutz / Sync-Architektur

Der App-Code liegt öffentlich auf GitHub. Persönliche Dateien, Aufgaben, Lernkarten und Messwerte werden **nicht** ins Repository geschrieben.

Für den Geräte-Sync wird der komplette Snapshot bereits im Browser mit dem Vault-Code verschlüsselt. Der Sync-Server erhält nur Ciphertext. `cloudflare-worker.js` enthält einen kleinen Server für Cloudflare Workers + R2. Ohne konfigurierten Sync-Endpunkt arbeitet Physics OS vollständig lokal.

### Cloudflare-Sync einrichten

1. Cloudflare-Konto anlegen.
2. Einen R2-Bucket `physics-os-sync` erstellen.
3. Einen Worker mit `cloudflare-worker.js` deployen.
4. Den R2-Bucket im Worker als `PHYSICS_OS_BUCKET` binden.
5. Die Worker-URL in Physics OS unter **Sync → Sync-Endpunkt** eintragen.
6. Eine Sync-ID erzeugen und zusammen mit demselben Vault-Code auf weiteren Geräten eintragen.

`wrangler.toml.example` zeigt die passende Bindung für Wrangler.

## Goodnotes

Goodnotes bleibt der Schreibplatz. Exportierte PDFs können in Physics OS importiert werden. Lernkarten lassen sich als CSV wieder für Goodnotes exportieren.

## Nächste Ausbaustufen

- Text-Layer/PDF-Analyse für Skripte und Goodnotes-Exporte
- persönliche Formeln direkt aus importierten Dokumenten übernehmen
- Knowledge Graph mit Beziehungen zwischen Begriffen statt nur Concept Radar
- mehr Aufgabentypen und symbolische Zwischenschritte
- nichtlineare Fits, Fehlerbalken und Export fertiger Praktikumsabbildungen
- weitere Simulationen: Orbit, Doppler/Rotverschiebung, Exoplanetentransit und Relativität
