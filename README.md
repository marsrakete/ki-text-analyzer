# KI-Text-Analyzer

**Texte genauer verstehen:** Der KI-Text-Analyzer macht sprachliche Muster, Wiederholungen und unsichtbare Zeichen sichtbar. Er zeigt, welche Merkmale in einem Text auffallen und wie sich daraus ein heuristischer KI-Indikator ergibt.

Der eingegebene Text wird auf deinem Gerät ausgewertet und nicht an einen externen Analysedienst übertragen.

[Zur Anwendung](https://marsrakete.github.io/ki-text-analyzer/)

## Was die Seite tut

Du fügst einen Text ein und erhältst eine Auswertung mit verständlichen Erläuterungen:

- **Textstatistik:** Umfang, Satz- und Wortlängen, Wortschatz und sprachliche Vielfalt.
- **Rhythmus und Struktur:** Wie ähnlich die Sätze aufgebaut sind und wie gleichmäßig sich der Text liest.
- **Wiederholungen:** Häufige Wörter, wiederkehrende Wortfolgen und typische Übergangsformulierungen.
- **Unsichtbare Zeichen:** Versteckte oder auffällige Unicode-Zeichen werden gefunden und im Text sichtbar gemacht.
- **Auffälligkeit sprachlicher Muster:** Ein Score von 0 bis 100 fasst ausgewählte Merkmale als KI-Indikator zusammen. Die Auswertung erklärt, welche Merkmale den Wert erhöhen oder senken.
- **Aussagekraft:** Die Seite ordnet ein, wie viel Text und wie viele Merkmalsgruppen für die Analyse zur Verfügung stehen.
- **SynthID-Referenzprüfung:** Eine separate Prüfung sucht nach einem Wasserzeichensignal für die gewählten Einstellungen. Eine Positivdemo zeigt, wie ein passendes Signal aussieht.

## Was du damit machen kannst

- Einen eigenen oder fremden Text auf wiederkehrende sprachliche Muster untersuchen.
- Verschiedene Texte nacheinander analysieren und ihre Ergebnisse vergleichen.
- Auffällige Stellen und Merkmale nachvollziehen, statt nur einen einzelnen Score zu sehen.
- Unsichtbare Zeichen erkennen, die beispielsweise beim Kopieren aus Dokumenten oder Webseiten übernommen wurden.
- Mit dem eingebauten Beispiel die Auswertung kennenlernen.

## Was die Seite nicht kann

**Der KI-Indikator ist kein Beweis für die Herkunft eines Textes.** Ein Wert von 80 bedeutet nicht „80 Prozent Wahrscheinlichkeit für KI“. Menschliche Texte können hohe Werte erhalten; KI-Texte können unauffällig bleiben.

- Sie erkennt Gemini, ChatGPT oder andere KI-Modelle nicht zuverlässig und benennt keinen konkreten Erzeuger.
- Sie unterscheidet nicht sicher zwischen selbst geschriebenen, überarbeiteten und teilweise KI-gestützten Texten.
- Sie kann aus kurzen Texten nur wenige Muster ableiten. Auch eine hohe angezeigte Aussagekraft bestätigt keine KI-Autorenschaft.
- Sie bewertet weder den Wahrheitsgehalt noch die Qualität eines Textes und ist keine Plagiatsprüfung.
- Unsichtbare Zeichen sind kein Nachweis für ein KI-Wasserzeichen.
- Die SynthID-Referenzprüfung ist kein allgemeiner Gemini-Detektor. Ein fehlendes Signal schließt KI-Autorenschaft nicht aus.

Die Ergebnisse eignen sich zur Untersuchung von Textmerkmalen. Für Vorwürfe oder Entscheidungen über die Autorenschaft reichen sie allein nicht aus.

## So benutzt du sie

1. Öffne die [Anwendung](https://marsrakete.github.io/ki-text-analyzer/).
2. Füge einen Text ein oder wähle „Beispiel einsetzen“.
3. Klicke auf „Analysieren“.
4. Lies den KI-Indikator zusammen mit den einzelnen Befunden und den Hinweisen zur Aussagekraft.

Die SynthID-Prüfung ist ein zusätzlicher Bereich mit eigenen Einstellungen. Für die normale statistische Auswertung brauchst du ihn nicht.

## Datenschutz

Die Analyse läuft im Browser auf deinem Gerät. Der eingegebene Text wird nicht an einen externen Analysedienst gesendet. Zum Öffnen der gehosteten Seite benötigt dein Browser eine Verbindung zum Webserver.

## Weiterführendes

- [Technische Dokumentation](TECHNISCH.md): lokal starten, installieren, weiterentwickeln, testen und veröffentlichen.
- [Lizenz des eigenen Codes](LICENSE): Apache-2.0.
- [Drittanbieter und Lizenzbeilage](THIRD_PARTY_NOTICES.md): Bedingungen der mitgelieferten Komponenten. Die abschließende Lizenzzuordnung der Gemma-Tokenizer-Datei bleibt offen; die [dokumentierte Prüfung](GEMMA_LICENSE_REVIEW.md) erläutert den Stand.
