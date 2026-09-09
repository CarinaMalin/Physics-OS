# Physics OS — v0.2

Eigenständige, lokal-first Studien-App für Physik. **`uni-hypernotes` wird nicht verwendet oder verändert.**

## Bereits enthalten

- Dashboard
- Drag & Drop für PDF, CSV/TSV, TXT/Markdown und Bilder
- lokale Dateibibliothek in IndexedDB
- automatische Grobklassifikation nach Vorlesung, Übung, Praktikum, Goodnotes und Daten
- Formelbibliothek
- CSV/TSV-Auswertung mit Mittelwert, Stichproben-Standardabweichung, linearer Regression und R²
- Lernkarten + Goodnotes-CSV-Export
- AES-256-GCM verschlüsseltes Vault-Backup
- **neue Sync-Schicht:** Geräte-ID, zufällige Sync-ID, Push/Pull, Auto-Sync und clientseitige Verschlüsselung
- PWA-/Offline-Grundlage

## Datenschutz / Sync-Architektur

Der App-Code darf öffentlich auf GitHub liegen. Persönliche Dateien und Lerninhalte werden **nicht** ins Repository geschrieben.

Für den Geräte-Sync wird der komplette Snapshot bereits im Browser mit dem Vault-Code verschlüsselt. Der Sync-Server sieht nur Ciphertext. `cloudflare-worker.js` enthält einen kleinen Server für Cloudflare Workers + R2. Ohne konfigurierten Sync-Endpunkt arbeitet Physics OS weiterhin vollständig lokal.

### Cloudflare-Sync einrichten

1. Cloudflare-Konto anlegen.
2. Einen R2-Bucket `physics-os-sync` erstellen.
3. Einen Worker mit `cloudflare-worker.js` deployen.
4. Den R2-Bucket im Worker als `PHYSICS_OS_BUCKET` binden.
5. Die Worker-URL in Physics OS unter **Sync → Sync-Endpunkt** eintragen.
6. Eine Sync-ID erzeugen und zusammen mit demselben Vault-Code auf den weiteren Geräten eintragen.

`wrangler.toml.example` zeigt die passende Bindung für Wrangler.

## Goodnotes

Goodnotes bleibt der Schreibplatz. Exportierte PDFs können in Physics OS importiert werden. Lernkarten können als CSV für Goodnotes exportiert werden.

## Lokal öffnen

`index.html` sollte nicht per `file://` geöffnet werden, weil Browser JavaScript-Module dort häufig blockieren. Nutze GitHub Pages oder lokal einen kleinen Webserver, z. B.:

```bash
python3 -m http.server 8080
```

und öffne danach `http://localhost:8080`.

## Nächste sinnvolle Ausbaustufen

- PDF-Texterkennung und automatische Themen/Formel-Erkennung
- Formeln aus Skripten in persönliche Bibliothek übernehmen
- Fehlerfortpflanzung und wissenschaftliche Plots
- Physics Problem Trainer
- Spaced Repetition
- Knowledge Graph
- Astrophysik-Simulationen
