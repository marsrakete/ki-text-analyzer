# Umsetzungsplan: saubere Modularisierung

Planungsstand: 13. Oktober 2026. Die Umsetzung dieses Plans ist abgeschlossen; der Prüfstand ist unten dokumentiert.

## Abschlussstand

- Struktur, CSS, Inhalte, Berechnungen, SynthID, Services, Views und Controller sind getrennt. `src/app.js` startet nur die Seite; `src/ui/page.js` verbindet die Abhängigkeiten.
- Die Darstellung verwendet zehn HTML-Templates. Der eigene Anwendungscode enthält weder Ternarys noch HTML-String-Rendering; Funktionen und ihre Verträge sind dokumentiert.
- GPT-2 und Gemma werden mit lokalen Laufzeiten und dem festgelegten Gemma-Modell ausgeliefert. Der gewählte Lieferstandard ist eine statische Anwendung über HTTP/HTTPS, ohne externe Downloads während der Nutzung. Eine Ein-Datei-Ausgabe ist nicht Teil dieser Umsetzung.
- Der fehlende `reasons`-Rückgabewert und die Nullinitialisierung der SynthID-Kontexthistorie sind korrigiert. Referenzwerte, Validierung und veraltete asynchrone Ergebnisse sind abgesichert.
- Der ursprüngliche HTML-Stand bleibt unter `backups/index.original.html` erhalten. Die alte Anwendung ist aus dem aktiven Einstieg entfernt.
- Build und Struktur-/Syntax-/Dokumentationsprüfung bestehen. 48 Modul-, Rechen-, Service- und DOM-Tests sowie sechs Edge-Browsertests bestehen mit sauberem Runner-Abschluss.
- Browserprüfungen umfassen leeren Cache, echte Tokenfolgen beider Tokenizer, gesperrte Drittanbieterzugriffe, persistierten Gemma-Cache, Ladefehler und Cache-Löschen. Geometrie wurde bei 390, 768 und 1280 Pixeln geprüft; Screenshots wurden visuell kontrolliert.
- Die SynthID-Fixtures führen festgehaltene upstream-Hash-, g-value- und Scoring-Funktionen mit NumPy-Arrayoperationen aus. GPT-2 und Gemma werden unabhängig gegen Python-Tokenizer verglichen. Die Fixtures lassen sich bytegleich neu erzeugen; eine vollständige PyTorch-/JAX-Modellgenerierung wurde nicht durchgeführt.
- Eine lokale Stichprobe mit 3000 Wörtern / 300 Sätzen benötigte rund 143 ms reine Analyse in Node. Das ist keine allgemeine Leistungszusage für beliebig große Texte.
- Realgeräte, Safari und Firefox bleiben ungeprüft. Die normalen Befehle, Auslieferungsdateien, Referenzquellen und Einschränkungen stehen in `README.md`.

Die folgenden Abschnitte halten den ursprünglichen Plan und seine Abnahmekriterien fest.

## Ziel und Umfang

Die vorhandene statische Seite wird in verständliche, fachlich getrennte Module überführt. Bedienung, Analysebereiche und vorhandene Dokumentation bleiben erhalten. Berechnungen werden zunächst gegen den bisherigen Stand abgesichert. Bekannte Fehler werden als ausdrücklich dokumentierte Korrekturen behandelt.

Es bleibt eine statische Browser-Anwendung ohne eigenen Backend-Dienst. Ein lokaler HTTP-Server ist für Entwicklung und Browsertests vorgesehen. Vollständig netzunabhängige Tokenisierung und eine per Doppelklick nutzbare Ein-Datei-Ausgabe sind zusätzliche Lieferanforderungen, die vor der Asset-Integration festgelegt werden müssen.

## Ausgangslage

- `index.html` enthält Struktur, CSS, Referenzdaten, Berechnungen, Netzwerkzugriffe, IndexedDB, Darstellung und Ereignisbehandlung.
- Es gibt keine `<template>`-Elemente, aber 24 Zuweisungen an `innerHTML`.
- Ternarys sind verbreitet; Funktionsverträge und JSDoc fehlen.
- `analyze()` sammelt Begründungen, gibt `reasons` aber nicht zurück. `render()` greift auf `r.reasons.map()` zu. Dieser Fehler wurde mit einer kurzen Eingabe in Node reproduziert.
- Der aktive GPT-2-Pfad importiert ein externes Tokenizer-Modul. Daneben liegt eine bisher ungenutzte eigene BPE-Implementierung.
- `encoder.json` und `vocab.bpe` sind als Netzwerkquellen konfiguriert, nicht eingebettet. Gemma lädt ein externes Laufzeitmodul und `tokenizer.model`.
- Die Aussage „keine externen Libraries“ stimmt deshalb nicht mit dem aktiven Tokenizer-Pfad überein.
- Es fehlen Testinfrastruktur und README. Die bisherige Prüfung umfasst Quellcode und JavaScript-Syntax, keine Browser- oder unabhängige SynthID-Referenzprüfung.
- `index.html` und `AGENTS.md` sind beim Planungsstand unversioniert. Vor der Umsetzung muss ein wiederherstellbarer Ausgangsstand gesichert werden.

## Verbindliche Regeln

- Saubere `if / else`-Blöcke, keine Ternarys im eigenen Anwendungscode.
- Jede eigene Funktion erhält eine Beschreibung, Parameter- und Rückgabedokumentation; auch interne Helfer und Ereignishandler.
- Wiederkehrende DOM-Strukturen entstehen aus HTML-Templates. Texte werden mit `textContent` eingesetzt.
- Struktur, Darstellung, Daten, Berechnungen und externe Zugriffe bleiben getrennt.
- Alle sichtbaren Texte kommen aus einer zentralen UTF-8-Inhaltsebene; die statische Dokumentation kann als HTML-Inhalt erhalten bleiben. Keine zweite parallele Kopie derselben Texte.
- DOM-Elemente, Templates und benötigte Services werden ausdrücklich übergeben. Berechnungsmodule kennen weder DOM noch Netzwerk.
- Neue Module erhalten Vertragstests. DOM-Module erhalten zusätzlich DOM- oder Browsertests.
- Bestehende Implementierungen werden nach der Übernahme entfernt. Keine dauerhaften Parallelpfade.
- Fremdcode wird getrennt als unveränderte Abhängigkeit mit Version, Herkunft und Lizenz behandelt.

## Zielstruktur

```text
index.html                         Struktur und wiederverwendbare Templates
styles/
  base.css                         Grundgestaltung und Formulare
  analysis.css                     Analyseergebnisse, Tabellen und Diagramme
  synthid.css                       SynthID-Bereich
  documentation.css                Dokumentationsansicht
src/
  app.js                           Initialisierung und DOM-Verbindungen
  content/
    de.js                          Sichtbare Texte, Labels, Meldungen
    reference-data.js              Wortlisten, Unicode-Daten, Beispieltext
    synthid-config.js               Default-Keys, Konstanten, Demo-Token
  shared/
    statistics.js                  Allgemeine mathematische Helfer
    text.js                        Wort- und Satzzerlegung
    dom.js                         Template-Klonen und gemeinsame DOM-Helfer
  analysis/
    metrics.js                     Textstatistik und lokale Profile
    unicode.js                     Unicode-Funde und Schriftmischung
    scoring.js                     Scorebeiträge, Teilbewertungen, Aussagekraft
    analyze.js                     Koordination der reinen Textanalyse
  synthid/
    engine.js                      Hashing, Maskierung, Referenz-Scoring
    validation.js                  Prüfung von Keys, Token-IDs und Parametern
  services/
    asset-store.js                 IndexedDB und Zugriff auf Tokenizer-Assets
    tokenizer-registry.js          Auswahl und Lebenszyklus der Tokenizer
    gpt2-tokenizer.js               Einheitlicher GPT-2-Adapter
    gemma-tokenizer.js              Einheitlicher Gemma-Adapter
    compression.js                 Browser-Kompression mit Capability-Prüfung
  ui/
    analysis-view.js               Heuristische Ergebnisdarstellung
    analysis-controller.js         Analyse, Beispiel und Leeren
    synthid-view.js                 Status und SynthID-Ergebnisdarstellung
    synthid-controller.js           Vorbereitung, Demo und Referenzprüfung
assets/tokenizers/                 Bei lokaler Auslieferung: Modell-/Vokabulardaten
vendor/                            Bei lokaler Auslieferung: Tokenizer-Laufzeiten
tests/
  contracts/                       Öffentliche APIs aller Module
  unit/                            Berechnungen, Grenzen, ungültige Eingaben
  fixtures/                        Festgehaltene Analyse- und Referenzvektoren
  browser/                         Initialisierung, Bedienung, Geometrie
README.md                          Starten, Prüfen, Architektur, Einschränkungen
```

Die Struktur beschreibt Zuständigkeiten. Weitere Dateien werden nur bei einer stabilen fachlichen Grenze angelegt. Ein separater Worker wird erst bei nachgewiesenem Bedarf durch lange Eingaben eingeführt.

## Umsetzung in Etappen

### 1. Ausgangsstand und Prüfbasis sichern

1. Vorhandene Dateien und Git-Zustand sichern, ohne Nutzeränderungen zu überschreiben.
2. Ein reproduzierbares Testsetup für ES-Module, Syntaxprüfung und Browsertests einrichten. Testabhängigkeiten gehören zur Entwicklung, nicht zur ausgelieferten Seite.
3. Den aktuellen Rechenstand mit festen Eingaben charakterisieren: leer, sehr kurz, Beispieltext, wiederholter Text, mehrere Absätze, Unicode-Marker und gemischte Schriftzeichen.
4. Bei der Bestandsprüfung die Analysefunktion nur im Test-Harness zugänglich machen; keinen zusätzlichen Produktionspfad aufbauen.
5. Den fehlenden `reasons`-Rückgabewert mit einem Regressionstest absichern und als Fehlerkorrektur beheben. Das fehlerhafte Verhalten wird nicht zum Sollzustand erklärt.
6. Browserfehler vor und nach dieser Korrektur erfassen. Einen brauchbaren visuellen Ausgangsstand nach der Korrektur sichern.

Abnahme: reproduzierbare Prüfbefehle, gesicherter Ausgangsstand, dokumentierte bekannte Fehler und belastbare Vergleichswerte.

### 2. CSS und Inhaltsebene trennen

1. Inline-CSS in externe, nach Bereichen geordnete Stylesheets übernehmen.
2. Statische `style`-Attribute durch Klassen ersetzen. Berechnete Balkenbreiten und Diagrammhöhen dürfen dynamische Werte behalten.
3. Sichtbare dynamische Texte nach `content/de.js` verschieben; Referenzlisten und Konfiguration aus dem Script herauslösen.
4. Vorhandene IDs und sichtbare Inhalte zunächst beibehalten.

Abnahme: unveränderte Bedienung und Darstellung bei Desktop- und Mobilbreite; korrekte UTF-8-Texte.

### 3. Reine Analyse extrahieren

1. Mathematik und Textzerlegung zuerst auslagern.
2. Textmetriken und Unicode-Analyse mit expliziten Eingaben und Ergebnissen extrahieren.
3. Scoreberechnung von Metrikberechnung trennen. Bewertung liefert strukturierte Beiträge und Textschlüssel statt HTML.
4. `analyze(text)` koordiniert die fachlichen Module und liefert ein dokumentiertes Ergebnisobjekt, einschließlich Begründungen.
5. Doppelte Wortlisten und identische n-Gramm-Berechnungen gezielt zusammenführen; bisherige Ergebnisse dabei vergleichen.
6. Ternarys durch lesbare Verzweigungen ersetzen und sämtliche Funktionen dokumentieren.

Abnahme: Vertragstests, normale und Grenzfälle, ungültige Eingaben sowie Vergleich der bisherigen Werte. Keine DOM- oder Netzwerkabhängigkeit in der Analyse.

### 4. SynthID-Engine und Eingabeprüfung isolieren

1. Hashing, Initialwert, g-values, Kontextmaskierung und Scoring in ein reines Engine-Modul verschieben.
2. Keys, Token-IDs, n-Gramm-Länge und History-Größe unabhängig vom DOM validieren. Ganzzahlen, Wertebereiche und leere Eingaben ausdrücklich prüfen.
3. Default-Konfiguration und Demo-Token als Daten übergeben.
4. Eigene Keys und WebCrypto-Verfügbarkeit getrennt prüfen; fehlende Fähigkeiten verständlich melden.
5. Referenzvektoren aus der offiziellen Implementierung in einer festgehaltenen Version erzeugen oder übernehmen. Die selbst konstruierte Positivdemo allein belegt keine Referenztreue.
6. Bitgenaue Hashwerte und Masken sowie numerische Mean-/Weighted-Mean-Werte vergleichen; z-Wert weiterhin als Näherung kennzeichnen.

Abnahme: unabhängige Referenzvektoren, Tests für wiederholte Kontexte und History-Grenzen, zu wenige Tokens und ungültige Konfiguration. Keine stillen Änderungen der mathematischen Logik.

### 5. Tokenizer und Asset-Strategie umsetzen

Vor dieser Etappe werden die Lieferanforderungen festgelegt:

| Punkt | Vorgeschlagener Standard | Zusätzliche Option |
| --- | --- | --- |
| Start | Statische Seite über HTTP/HTTPS | Ein-Datei-Ausgabe für `file://` |
| Tokenizer-Assets | Lokal mitgelieferte, versionierte Dateien | Eingebettete Assets in erzeugter Ausgabe |
| Netzzugriff zur Laufzeit | Für lokale Auslieferung keiner | Ausdrücklich dokumentiertes Nachladen |

1. Asset-Größen, Laufzeitabhängigkeiten, Lizenzen und vollständige Offline-Eignung prüfen, bevor ein Auslieferungsformat verbindlich umgesetzt wird.
2. Für GPT-2 genau einen getesteten Pfad auswählen: gebündelter Tokenizer oder eigene BPE-Implementierung mit `encoder.json` und `vocab.bpe`. Den anderen Pfad entfernen.
3. Für Gemma `tokenizer.model` und alle benötigten Laufzeit-/WASM-Dateien gemeinsam berücksichtigen. Nur das Modell einzubetten genügt nicht.
4. Beide Adapter auf einen dokumentierten Tokenizer-Vertrag bringen; BOS-Verhalten und Modellidentität ausdrücklich erhalten.
5. Netzwerk/Asset-Zugriff und IndexedDB kapseln; Datenbankverbindungen schließen, Cachefehler kontrolliert behandeln und erfolgreiche Transaktionen abwarten.
6. Parallele Ladevorgänge, Ladefehler und erneute Versuche prüfen. Cache-Löschen muss die ausgewählten lokalen Cachebestände tatsächlich zurücksetzen.
7. Festgelegte Texte gegen Token-IDs des jeweiligen Referenz-Tokenizers testen, einschließlich Unicode und BOS an/aus.
8. Falls eine Ein-Datei-Ausgabe erforderlich ist, sie aus den modularen Quellen erzeugen. Keine separat gepflegte zweite Anwendung erstellen.

Abnahme: identische Tokenisierung für festgelegte Modellversionen, korrekte Statusmeldungen und nachgewiesenes Netzwerkverhalten. Offline-Nutzung mit leerem Cache und gesperrtem Netzwerk testen, falls zugesagt.

### 6. Darstellung mit Templates und Controller trennen

1. Templates für Tabellenzeilen, Kennzahlen, Begründungen, Badges, Unicode-Marker und Diagrammbalken in `index.html` definieren.
2. View-Module erhalten DOM-Ziele, Template-Inhalte und zentrale Texte als Abhängigkeiten.
3. Plaintext mit `textContent`, formatierte Befunde über strukturierte DOM-Knoten darstellen. Eingabetext als Text erhalten.
4. Ereignishandler in Controller überführen. Parser erhalten Werte als Parameter statt selbst DOM-Felder auszulesen.
5. Wiederholte Tokenizer-Statusdarstellung zusammenführen.
6. Laufende Analysen, erneute Klicks und Leeren während einer asynchronen Berechnung berücksichtigen; veraltete Ergebnisse dürfen die aktuelle Ansicht nicht überschreiben.
7. `app.js` initialisiert Services und Controller erst nach ihren Abhängigkeiten und verbindet die Bereiche.

Abnahme: DOM-/Browsertests für beide Analysebereiche, Template-Verwendung ohne große HTML-Strings, keine verbliebene alte Rendering- oder Ereignislogik.

### 7. Gesamtprüfung und Dokumentation

1. Syntax, Modulverträge, Imports/Exports und zirkuläre Abhängigkeiten prüfen.
2. Unit- und Referenztests ausführen; jede neue öffentliche Kernfunktion mit Normal-, Grenz- und Fehlerfall abdecken, soweit anwendbar.
3. Die Seite im Browser mit gesammelten `pageerror`-Ereignissen laden. Auch abgewiesene Ressourcen und nicht behandelte asynchrone Fehler erfassen.
4. Beispiel → Analysieren → Leeren, Unicode-Darstellung, Scorebeiträge, SynthID-Demo, eigene Token-IDs, Tokenizer-Vorbereitung, Cache-Löschen und Fehlerzustände prüfen.
5. Desktop-, Tablet- und Mobilbreiten prüfen. Geometrieassertionen gegen Überläufe, abgeschnittene Bedienelemente und überlappende Inhalte ergänzen; Screenshots visuell prüfen.
6. Lange Eingaben auf blockierende Berechnung untersuchen, insbesondere paarweise Satzvergleiche und LZ-Komplexität. Optimierungen nur mit Ergebnisvergleich umsetzen.
7. Alte Implementierungen, ungenutzte Quellen und überholte Kommentare entfernen. Widersprüchliche UI-Aussagen über Libraries, Offline-Nutzung und Cache korrigieren.
8. README mit tatsächlichen Start-/Testbefehlen, Modulübersicht, Lieferformat, Abhängigkeiten, Datenquellen und fachlichen Einschränkungen erstellen. Bestehende Seitendokumentation synchronisieren.
9. Versions- und Asset-Konsistenz prüfen; falls ein Cache oder eine erzeugte Ausgabe eingeführt wird, auch dessen vollständige Dateiliste und Aktualisierung prüfen.

## Definition of Done

- Die Quellanwendung besteht aus klaren fachlichen Modulen; der Einstieg enthält nur Initialisierung und Verbindungen.
- CSS und statische Daten sind ausgelagert, dynamische UI-Texte zentralisiert.
- Wiederkehrende Darstellung nutzt Templates und sichere DOM-Zuweisungen.
- Eigene Funktionen sind dokumentiert; eigener Anwendungscode enthält keine Ternarys.
- Der fehlende `reasons`-Vertrag ist korrigiert und gegen Regression abgesichert.
- Keine alten oder doppelten Implementierungen bleiben zurück.
- Alle Module haben Vertragstests; betroffene Views und die Seite sind im Browser geprüft.
- Syntax-, Unit-, Referenz-, Browser- und Dokumentationsprüfungen bestehen.
- Die geprüfte Tokenizer-Konfiguration, Abhängigkeiten und Netzwerkanforderungen sind nachvollziehbar dokumentiert.
- Nicht ausgeführte Geräte- oder Browserprüfungen werden ausdrücklich genannt. Eine Offline- oder Referenztreue-Zusage erfolgt erst nach dem passenden Nachweis.

## Empfohlener Start

Mit Etappe 1 beginnen, anschließend CSS/Inhalte und reine Analyse extrahieren. Danach SynthID-Engine absichern, Tokenizer-Auslieferung festlegen und erst dann die Darstellung vollständig auf Templates umstellen. Jede Etappe endet mit ihren Prüfungen und einem überprüfbaren Zwischenstand.
