# KI-Text-Analyzer – Technische Dokumentation

Diese Dokumentation beschreibt den lokalen Start, die Auslieferung, Architektur, Entwicklung, Prüfungen und technischen Grenzen. Die Übersicht über Funktionen und Nutzung steht im [README](README.md).

## Historischer RAID-Vergleich

Die Ergebnisse des begrenzten Vergleichs älterer deutscher Nachrichtentexte bleiben unter `reports/raid/` dokumentiert. Die RAID-Rohtexte, lokalen Datenproben und das Auswertungsskript wurden auf Wunsch entfernt. Der Vergleich ist damit kein aktiver Prüfstand mehr und belegt keine Erkennung aktueller Gemini-Texte.

Die historischen Baseline- und Prüfberichte, textfreien Einzelwerte und Auswahlmetadaten bleiben erhalten. Die übernommene Gewichtsanpassung ist in [UNABHAENGIGE_PRUEFUNG.md](reports/raid/UNABHAENGIGE_PRUEFUNG.md) dokumentiert; `implementation-check.json` hält den damaligen Abgleich mit den 1.500 Kandidatenwerten fest. Die regulären Anwendungstests verwenden keine RAID-Texte.

## Starten

Die fertigen Tokenizer-Dateien sind im Projekt enthalten. Die modularisierte Quellversion benötigt einen lokalen HTTP-Server oder statisches Webhosting; direktes Öffnen von `index.html` über `file://` wird für diese Ausgabe nicht unterstützt.

```powershell
npm start
```

Öffnen: <http://127.0.0.1:49317/>. Der kleine Entwicklungsserver verwendet nur Node.js und benötigt für diesen Start keine installierten npm-Pakete. Einen anderen Port kann man mit `$env:PORT = '49318'` festlegen.

Für statisches Hosting werden `index.html`, `licenses.html`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `src/`, `styles/`, `assets/`, `vendor/`, `favicon.ico`, `manifest.webmanifest` und `og-image.jpg` einschließlich aller Dateien in `vendor/licenses/` gemeinsam ausgeliefert. Ein PHP- oder API-Backend ist nicht erforderlich.

## Entwicklung und Prüfungen

Voraussetzung: Node.js 24 oder neuer. Die Browserprüfung verwendet das lokal installierte Microsoft Edge. Nach Installation der Entwicklungsabhängigkeiten arbeiten die regulären Tests und der Build ohne Internetzugriff.

```powershell
npm ci
npm run check
npm test
npm run test:browser
npm run build
```

- `check`: JavaScript-Syntax, Funktionsdokumentation, Verzicht auf Ternarys und HTML-Strings, lokale Imports, zirkuläre Abhängigkeiten, Templates, Ressourcen-Prüfsummen und dokumentierte Befehle in `TECHNISCH.md`.
- `test`: Verträge aller Fachmodule, Vergleich mit den ursprünglichen Rechenwerten, Grenzfälle, Eingabevalidierung, SynthID-Referenzvektoren, Tokenizer-Adapter, Cache-Lebenszyklus sowie DOM- und Controllerprüfungen.
- `test:browser`: Initialisierung mit erfassten `pageerror`-Ereignissen, vollständige Analyse, Unicode-Darstellung, SynthID-Demo und Parameterfehler, echte GPT-2-/Gemma-Tokenisierung, Cache-Löschen und Geometrie bei 390, 768 und 1280 Pixeln. Drittanbieterzugriffe werden erfasst; die Tokenizerprüfung sperrt sie zusätzlich. Screenshots liegen unter `screenshots/`.
- `build`: Erzeugt die lokalen Tokenizer-Laufzeiten, Icons, OG-Bilder, statischen Metadaten, Manifeste und Lizenzbeilage. Der Build lädt das Gemma-Modell nicht neu herunter.

Der Testserver startet auf seinem eigenen Port und verwendet keinen bereits laufenden Server. Ein belegter Port wird als Fehler gemeldet. Realgeräte, Safari und Firefox sind durch die Edge-Tests nicht abgedeckt.

## Favicon, mobile Icons und Open Graph

Die bestätigte öffentliche Adresse ist `https://marsrakete.github.io/ki-text-analyzer/`. Titel, Beschreibung, Bild-Alternativtext, Farben und öffentliche URL stehen zentral in `config/site.config.json`. Open-Graph- und Twitter-Card-Metadaten sowie die Canonical-Adresse werden statisch im HTML erzeugt und sind ohne JavaScript sichtbar. Die Bild-URLs sind absolute HTTPS-Adressen; lokale Icon- und Manifest-Pfade bleiben relativ und funktionieren auch im GitHub-Pages-Unterverzeichnis.

Der OG-Build ist aus Threadlines `scripts/build-og-images.js` übernommen und an ES-Module angepasst: Eine editierbare SVG-Vorlage wird mit **Resvg** gerendert, auf **1200 × 630 Pixel** geprüft und mit **Sharp** als PNG und JPEG ausgegeben. Die Konfiguration steht in `config/og-image.config.json`, die Vorlage unter `assets/branding/og-image.svg`. Das eingebundene PNG liegt unter `assets/branding/og-image.png`; `og-image.jpg` ist die zusätzliche JPEG-Ausgabe. Für den Text verwendet Resvg verfügbare Systemschriften, bevorzugt Segoe UI bzw. DejaVu Sans.

Das gemeinsame Markenzeichen ist in `assets/branding/icon.svg` als wiederverwendbares SVG-Symbol definiert. Der Build übernimmt dieses Symbol in die OG- und Maskable-Vorlagen, damit keine zweite Zeichnung separat gepflegt werden muss.

`config/icons.config.json` definiert die Browser-Favicons als SVG, 16-/32-Pixel-PNG und ICO mit 16-, 32- und 48-Pixel-Frames. Für Apple gibt es ein **180 × 180 Pixel** großes PNG-Touch-Icon. Das Manifest enthält **192 × 192** und **512 × 512 Pixel** große Android-Icons sowie separate maskierbare Varianten mit deckendem Hintergrund. Das Zeichen liegt in der zentralen sicheren Kreisfläche. Diese Metadaten unterstützen mobile Lesezeichen und Icons; sie führen keinen Service Worker oder eine Offline-Installation ein.

Die Grafiken und Metadaten lassen sich separat neu erzeugen:

```powershell
npm run build:icons
npm run build:og-image
npm run build:metadata
npm run build:branding
```

`build:metadata` aktualisiert das vorhandene HTML ohne doppelte Tags und erzeugt `manifest.webmanifest`. Bei Änderungen der öffentlichen URL genügt eine Anpassung in `config/site.config.json` und ein erneuter Metadaten-Build. Live-Vorschauen bei sozialen Netzwerken sind erst nach Veröffentlichung der Dateien prüfbar; deren Vorschau-Caches werden durch diesen lokalen Build nicht geleert.

## Modulgrenzen

| Bereich                   | Verantwortung                                                                    |
| ------------------------- | -------------------------------------------------------------------------------- |
| `src/app.js`              | Kleiner Seitenstart                                                              |
| `src/ui/page.js`          | DOM-Verbindungen und Initialisierung aller Abhängigkeiten                        |
| `src/shared/`             | Mathematik, Textzerlegung, Formatierung und Template-Helfer                      |
| `src/analysis/metrics.js` | Beschreibende Textmetriken und Profile                                           |
| `src/analysis/unicode.js` | Unicode-Marker und Schriftmischung                                               |
| `src/analysis/scoring.js` | Heuristische Gewichte, Teilbewertungen und Aussagekraft                          |
| `src/analysis/analyze.js` | Reine Koordination der Textanalyse                                               |
| `src/synthid/`            | Parameterprüfung, Hashing, Kontextmaskierung und Referenz-Scoring                |
| `src/services/`           | Lokale Assets, IndexedDB, Tokenizer-Adapter und Browser-Kompression              |
| `src/ui/`                 | Getrennte Views und Controller für beide Analysebereiche                         |
| `src/content/`            | Deutsche dynamische Texte, Wortlisten, Unicode-Daten und Referenzkonfiguration   |
| `index.html`              | Semantische Seitenstruktur, statische Dokumentation und zehn Rendering-Templates |
| `styles/`                 | Grundgestaltung und Styles nach Analyse, SynthID und Dokumentation               |

Berechnungsmodule kennen weder DOM noch Netzwerk. Views erhalten DOM und Templates ausdrücklich; Controller erhalten Services und Berechnungsfunktionen. Nur die Tokenizer-Registry koordiniert Laufzeit- und Modell-Ladevorgänge. Veraltete asynchrone Ergebnisse werden nach Eingabeänderungen verworfen.

## Tokenizer und lokale Auslieferung

GPT-2 verwendet `gpt-tokenizer` **4.0.0** mit GPT-2/r50k-Vokabular. Vokabular und BPE-Merges sind im lokalen `vendor/gpt2.js` enthalten. Die ungenutzte zweite BPE-Implementierung und ihre separaten Netzwerkquellen wurden entfernt.

Gemma verwendet `@sctg/sentencepiece-js` **1.3.3**. Die Browser-Laufzeit einschließlich WASM liegt in `vendor/sentencepiece.js`; Node-spezifische Dateilader sind im Browser-Build ausdrücklich deaktiviert. Das separat mitgelieferte Modell liegt unter `assets/tokenizers/gemma.model` und stammt aus [google/gemma_pytorch, Commit 33b652c](https://github.com/google/gemma_pytorch/blob/33b652c465537c6158f9a472ea5700e5e770ad3f/tokenizer/tokenizer.model). Der BOS-Token ist standardmäßig aktiv und kann ausgeschaltet werden.

Versionen, Modellquelle und SHA-256-Prüfsummen stehen in `assets/tokenizers/manifest.json`. Lizenzdateien und Herkunft sind unter `vendor/licenses/` und in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) festgehalten.

### Lokale Auslieferung und Cache

Tokenizer-Laufzeiten und Modell werden mit der Website ausgeliefert. Die Anwendung benötigt während der Nutzung keine externen CDN- oder Modellzugriffe. Ein statischer Server muss die lokalen Dateien weiterhin bereitstellen. Das ist keine Service-Worker-PWA und keine Ein-Datei-Ausgabe. Ein vollständig netzunabhängiger Betrieb ist mit lokalem Server und allen mitgelieferten Dateien möglich; ein späterer Aufruf einer extern gehosteten Seite ohne Verbindung ist dadurch nicht zugesagt.

Das Gemma-Modell wird optional im bestehenden IndexedDB-Store `ki-text-analyzer-assets` gespeichert. Datenbankname, Store und Version bleiben erhalten. Cachefehler verhindern die lokale Modellladung nicht. „Tokenizer-Cache löschen“ wartet auf laufende Ladevorgänge, leert den Modell-Store und setzt die vorbereiteten Instanzen zurück. Es entfernt keine vom Browser selbst verwalteten HTTP-/JavaScript-Caches.

## Lizenzbeilage

Der dauerhaft sichtbare Link „Lizenzen und Drittanbieter“ öffnet `licenses.html`. Die Seite enthält die vollständigen Originaltexte, Quellen, Versionen und Änderungshinweise der mitgelieferten Komponenten. `THIRD_PARTY_NOTICES.md` dient als portable Beilage; `vendor/licenses/` enthält die Originaltexte. Der eigene Anwendungscode bleibt unter Apache-2.0.

Die Einträge stehen zentral in `config/licenses.config.json`; die HTML-Struktur steht in `templates/licenses.html`. Nach Änderungen erzeugt `npm run build:licenses` beide Ansichten neu. Der Vendor-Build erhält Herkunfts- und Änderungshinweise in den Bundles und kopiert die npm-Lizenztexte erneut. Die übrigen festgelegten Originaltexte bleiben im Repository enthalten.

**Offen bleibt die Lizenzzuordnung von `assets/tokenizers/gemma.model`.** Der beigefügte Apache-2.0-Text stammt aus dem Herkunftsrepository. Er belegt allein keine abschließende Freigabe dieser Binärdatei unter Apache-2.0; eventuell zusätzlich geltende Gemma-Bedingungen müssen gesondert geklärt werden. Die Beilage kennzeichnet diesen Unterschied ausdrücklich.

Die [dokumentierte Prüfung vom 13.10.2026](GEMMA_LICENSE_REVIEW.md) bestätigt den Original-Lizenztext und die identische Datei in Googles Vertex-AI-SDK. Sie erläutert die verbleibende Abgrenzung zu den Gemma-Bedingungen und enthält einen konkreten Anfrageentwurf an den Rechteinhaber.

## Verhalten und fachliche Grenzen

Die bisherigen Metriken, Gewichte und Schwellen sind durch Vergleichsfixtures geschützt. Nach der [unabhängigen RAID-Prüfung](reports/raid/UNABHAENGIGE_PRUEFUNG.md) wurde ausschließlich der Beitrag wiederholter Drei-Wort-Folgen von +8 auf +3 reduziert. Auslöseschwelle, übrige Gewichte und Teilbewertungen bleiben unverändert. Die Originalfixtures bleiben erhalten; `tests/fixtures/analysis-scoring-v2.json` dokumentiert die gezielten Score-Änderungen. Korrigiert wurden zuvor der fehlende `reasons`-Rückgabewert und die SynthID-Kontexthistorie, die entsprechend der Referenz mit Null-Hashes beginnt. Sichere Ganzzahlen und Parameterbereiche werden geprüft. Mobile Tabellen können lange Begriffe umbrechen.

Der heuristische Score ist weder Herkunftsnachweis noch Wahrscheinlichkeit für KI-Autorenschaft. Die bisherigen Grenzen und Signalgruppen bleiben erhalten; die Anzeige „Aussagekraft“ ist weiterhin eine heuristische Eingabeabdeckung und keine kalibrierte Messunsicherheit.

Die Ergebnisanzeige bezeichnet den Score als „Auffälligkeit sprachlicher Muster“. „KI-Indikator“ bleibt als ergänzende Bezeichnung mit dem Hinweis „Kein Herkunftsnachweis“ sichtbar.

Direkt bei beiden Ergebnissen erklärt „Was bedeutet das Ergebnis?“ die fachlichen Grenzen. Die Heuristik erläutert die Bedeutung der Aussagekraft und zeigt bei weniger als 80 Wörtern einen zusätzlichen Hinweis zur kurzen Textbasis. SynthID unterscheidet ein erhöhtes von einem unauffälligen Referenzsignal und erklärt Konfigurationsabhängigkeit, fehlende Kalibrierung und mögliche Grenzen der Erkennung. Berechnungen und Schwellen bleiben unverändert.

SynthID prüft die öffentliche Referenzkonfiguration mit den angegebenen Keys und dem passenden Tokenizer. Das ist kein universeller Gemini-Detektor. Der z-Wert bleibt eine Näherung; Abhängigkeiten zwischen g-values werden dabei nicht berücksichtigt.

Die Referenzfixtures beziehen sich auf [google-deepmind/synthid-text, Commit a6ec02c](https://github.com/google-deepmind/synthid-text/tree/a6ec02c22ce87177c061643503e14a7cc839dc2b). Für Hashing, g-values und Mean-/Weighted-Mean-Scoring wurden die festgehaltenen upstream-Funktionen mit NumPy-Arrayoperationen ausgeführt; die Masken folgen der dortigen Historienlogik. Es wurde keine vollständige PyTorch-/JAX-Modellgenerierung ausgeführt. Tokenfolgen werden unabhängig gegen `tiktoken` 0.14.0 und Python `sentencepiece` 0.2.2 verglichen.

Die erzeugten Fixtures liegen unter `tests/fixtures/`, die festgehaltenen upstream-Dateien unter `tests/reference/upstream/`. Zur optionalen Neuerzeugung dient `scripts/generate-reference.py` mit NumPy, `sentencepiece==0.2.2` und `tiktoken==0.14.0`; tiktoken kann beim ersten Lauf sein Referenzvokabular aus dem Netz laden. Die regulären npm-Tests benötigen weder Python noch diese Downloads.

Der ursprüngliche HTML-Stand wurde vor der Umsetzung unter `backups/index.original.html` gesichert. Dieser lokale Sicherungsordner gehört nicht zu Git oder zur Auslieferung.
