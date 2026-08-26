/* Fallakten. Alle Personen und Orte sind erfunden.
   x/y der Spuren sind Anteile der Szenenbreite/-höhe (0..1). */

export const FAELLE = [

/* ============================ FALL 1 ============================ */
{
  id: 'f1', nr: 1,
  titel: 'Der verschwundene Znüni-Kuchen',
  ort: 'Schulhaus Bärenmoos',
  schwierigkeit: 1,
  szene: 'schule',
  bild: 'assets/img/tatort-1.webp',
  briefing: [
    'Grüezi! Schön, bist du da. Ich bin Wachtmeister Brünnli.',
    'Im Schulhaus Bärenmoos ist der Znüni-Kuchen der Klasse 2b verschwunden. Er stand auf dem Pult, als alle in der grossen Pause waren.',
    'Nimm die Lupe und such den Tatort ab. Rösti, mein Spürhund, hilft dir.'
  ],
  fakten: [
    'Tatzeit: Dienstag, 09:20 bis 09:45 Uhr (grosse Pause).',
    'Draussen war es hell und es regnete leicht.',
    'Das Fenster im Klassenzimmer stand offen.'
  ],
  spuren: [
    { id: 's1', icon: 'kruemel', x: 0.26, y: 0.80, name: 'Kuchenkrümel',
      text: 'Eine Spur aus Krümeln führt vom Pult zur Tür.',
      wert: 'Der Kuchen wurde weggetragen, nicht aus dem Fenster geworfen.' },
    { id: 's2', icon: 'schuh', x: 0.63, y: 0.85, name: 'Nasser Schuhabdruck',
      text: 'Ein feuchter Abdruck auf dem Boden. Das Muster ist gut zu sehen.',
      wert: 'Die Person war kurz vorher draussen im Regen.' },
    { id: 's3', icon: 'haar', x: 0.60, y: 0.47, name: 'Ein Haar',
      text: 'Am Stuhl beim Pult klebt ein einzelnes Haar.',
      wert: 'Jemand hat sich über das Pult gebeugt.' },
    { id: 's4', icon: 'zettel', x: 0.89, y: 0.53, name: 'Zerknüllter Zettel',
      text: 'Im Papierkorb liegt ein Zettel: "Ich habe mein Znüni vergessen."',
      wert: 'Jemand in der Klasse hatte nichts zu essen dabei.' }
  ],
  labor: [
    { typ: 'vergleich', frage: 'Welche Sohle passt zum Abdruck am Tatort?',
      hilfe: 'Schau genau auf das Muster – nicht auf die Grösse.',
      probe: { art: 'sohle', v: 'zickzack', label: 'Abdruck vom Tatort' },
      optionen: [
        { id: 'a', art: 'sohle', v: 'punkte',   label: 'Sohle A' },
        { id: 'b', art: 'sohle', v: 'zickzack', label: 'Sohle B' },
        { id: 'c', art: 'sohle', v: 'wellen',   label: 'Sohle C' },
        { id: 'd', art: 'sohle', v: 'raster',   label: 'Sohle D' }
      ],
      richtig: 'b',
      ergebnis: 'Der Täter trägt Schuhe mit Zickzack-Sohle.' },
    { typ: 'vergleich', frage: 'Welches Haar sieht aus wie das Haar vom Stuhl?',
      hilfe: 'Achte auf Farbe und Form.',
      probe: { art: 'faser', v: ['#d9b45c', false], label: 'Haar vom Tatort' },
      optionen: [
        { id: 'a', art: 'faser', v: ['#3a2a1c', false], label: 'Probe A' },
        { id: 'b', art: 'faser', v: ['#d9b45c', true],  label: 'Probe B' },
        { id: 'c', art: 'faser', v: ['#d9b45c', false], label: 'Probe C' },
        { id: 'd', art: 'faser', v: ['#b1442c', false], label: 'Probe D' }
      ],
      richtig: 'c',
      ergebnis: 'Das Haar ist blond und glatt.' }
  ],
  zeugen: [
    { name: 'Herr Zaugg', rolle: 'Hauswart', seed: 21, opts: { haar: '#8e8e8e', lang: false, brille: true },
      aussagen: [
        'Ich habe um 09:30 im Gang den Boden gewischt.',
        'Da war eine nasse Spur, die aus dem Zimmer 2b kam.',
        'Gesehen habe ich niemanden, ich war mit dem Rücken zur Tür.'
      ], luege: -1 },
    { name: 'Livia', rolle: 'Schülerin 2b', seed: 34, opts: { haar: '#d9b45c', lang: true },
      aussagen: [
        'Ich war die ganze Pause draussen beim Fangis.',
        'Als ich zurückkam, war der Kuchen schon weg.',
        'Ich habe Ruben aus dem Zimmer kommen sehen.'
      ], luege: -1 },
    { name: 'Ruben', rolle: 'Schüler 2b', seed: 12, opts: { haar: '#d9b45c', lang: false },
      aussagen: [
        'Ich war kurz im Zimmer, um mein Etui zu holen.',
        'Es war stockdunkel, ich habe gar nichts gesehen.',
        'Danach bin ich sofort wieder raus.'
      ], luege: 1,
      warum: 'Um halb zehn am Morgen ist es hell – und das Licht im Gang brannte. Stockdunkel kann es nicht gewesen sein.' }
  ],
  verdaechtige: [
    { id: 'v1', name: 'Nora', seed: 5, opts: { haar: '#3a2a1c', lang: true },
      merkmale: ['Haare: braun', 'Sohle: Punkte'] },
    { id: 'v2', name: 'Ruben', seed: 12, opts: { haar: '#d9b45c', lang: false },
      merkmale: ['Haare: blond', 'Sohle: Zickzack'] },
    { id: 'v3', name: 'Livia', seed: 34, opts: { haar: '#d9b45c', lang: true },
      merkmale: ['Haare: blond', 'Sohle: Punkte'] }
  ],
  ausschluss: [
    { frage: 'Das Haar am Stuhl ist blond. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die keine blonden Haare haben.',
      raus: ['v1'],
      warum: 'Nora hat braune Haare. Das Haar am Tatort war blond.' },
    { frage: 'Der Abdruck zeigt eine Zickzack-Sohle. Wer scheidet aus?',
      hinweis: 'Tippe alle an, deren Schuhe ein anderes Muster haben.',
      raus: ['v3'],
      warum: 'Livias Schuhe haben Punkte, nicht Zickzack.' }
  ],
  taeter: 'v2',
  aufloesung: [
    'Ruben hat den Kuchen genommen. Er hatte sein Znüni vergessen und riesigen Hunger.',
    'Er hat gelogen, weil er Angst vor Ärger hatte. Als du ihm die Spuren gezeigt hast, hat er es zugegeben.',
    'Die Klasse backt am Freitag zusammen einen neuen Kuchen – und Ruben hilft mit.'
  ],
  wusstest: {
    titel: 'Die Nummer 117',
    text: 'In der Schweiz erreichst du die Polizei unter 117. Der Notruf 112 funktioniert in der ganzen Schweiz und in ganz Europa. Für die Sanität wählst du 144, für die Feuerwehr 118.'
  }
},

/* ============================ FALL 2 ============================ */
{
  id: 'f2', nr: 2,
  titel: 'Das gestohlene Velo',
  ort: 'Bahnhof Bärenmoos',
  schwierigkeit: 2,
  szene: 'bahnhof',
  bild: 'assets/img/tatort-2.webp',
  briefing: [
    'Neuer Fall. Beim Bahnhof ist ein rotes Velo verschwunden.',
    'Es war mit einem Schloss am Veloständer angehängt. Jetzt liegt nur noch das Schloss da.',
    'Der Kies rund um den Ständer ist weich – da bleiben Spuren zurück.'
  ],
  fakten: [
    'Tatzeit: Freitag zwischen 16:00 und 16:30 Uhr.',
    'Der Veloständer ist vom Kiosk aus nicht zu sehen. Dazwischen steht eine hohe Hecke.',
    'Am Boden liegt weicher Kies.'
  ],
  spuren: [
    { id: 's1', icon: 'schluessel', x: 0.35, y: 0.83, name: 'Durchtrenntes Schloss',
      text: 'Das Veloschloss wurde mit einer Zange durchgeschnitten.',
      wert: 'Der Täter hatte Werkzeug dabei – das war geplant.' },
    { id: 's2', icon: 'reifen', x: 0.62, y: 0.72, name: 'Reifenspur im Kies',
      text: 'Ein deutliches Profil im Kies, direkt neben dem Ständer.',
      wert: 'Der Täter kam mit einem eigenen Fahrzeug.' },
    { id: 's3', icon: 'schuh', x: 0.85, y: 0.84, name: 'Schuhabdruck',
      text: 'Ein klarer Abdruck im Kies. Er lässt sich genau ausmessen.',
      wert: 'Aus der Länge lässt sich die Schuhgrösse berechnen.' },
    { id: 's4', icon: 'ticket', x: 0.16, y: 0.72, name: 'Billett',
      text: 'Ein Bahnbillett von 16:22 Uhr liegt im Kies. Es wurde nie entwertet.',
      wert: 'Um 16:22 war jemand hier – und ist nicht in den Zug gestiegen.' },
    { id: 's5', icon: 'velo', x: 0.45, y: 0.57, name: 'Roter Lacksplitter',
      text: 'Ein roter Lacksplitter am Ständer.',
      wert: 'Das Velo wurde hastig herausgezogen.' }
  ],
  labor: [
    { typ: 'vergleich', frage: 'Zu welchem Reifen passt die Spur im Kies?',
      hilfe: 'Grobe Stollen gehören zu einem Mountainbike, dünne Linien zu einem Rennvelo.',
      probe: { art: 'reifen', v: 'mountainbike', label: 'Spur vom Tatort' },
      optionen: [
        { id: 'a', art: 'reifen', v: 'rennvelo',     label: 'Rennvelo' },
        { id: 'b', art: 'reifen', v: 'trottinett',   label: 'Trottinett' },
        { id: 'c', art: 'reifen', v: 'mountainbike', label: 'Mountainbike' },
        { id: 'd', art: 'reifen', v: 'kinderwagen',  label: 'Kinderwagen' }
      ],
      richtig: 'c',
      ergebnis: 'Der Täter war mit einem Mountainbike unterwegs.' },
    { typ: 'wahl', frage: 'Wie lang ist der Schuhabdruck?',
      hilfe: 'Lies am Lineal ab, wo der Abdruck aufhört.',
      bild: { art: 'lineal', v: 24 },
      optionen: [{ id: 'a', label: '18 cm' }, { id: 'b', label: '24 cm' }, { id: 'c', label: '30 cm' }],
      richtig: 'b',
      ergebnis: 'Der Abdruck ist 24 cm lang.' },
    { typ: 'wahl', frage: 'Welche Schuhgrösse ist das?',
      hilfe: 'Such 24 cm in der Tabelle.',
      tabelle: [['22 cm', 'Grösse 35'], ['23 cm', 'Grösse 37'], ['24 cm', 'Grösse 38'], ['25 cm', 'Grösse 40']],
      optionen: [{ id: 'a', label: 'Grösse 35' }, { id: 'b', label: 'Grösse 38' }, { id: 'c', label: 'Grösse 40' }],
      richtig: 'b',
      ergebnis: 'Der Täter hat Schuhgrösse 38.' }
  ],
  zeugen: [
    { name: 'Frau Bärtschi', rolle: 'Kiosk', seed: 44, opts: { haar: '#8e8e8e', lang: true, brille: true },
      aussagen: [
        'Ich habe um 16:15 einen Jungen mit einem Mountainbike vorbeifahren sehen.',
        'Er kam vom Veloständer her.',
        'Mehr habe ich nicht gesehen, ich musste Kunden bedienen.'
      ], luege: -1 },
    { name: 'Herr Steiner', rolle: 'Pendler', seed: 8, opts: { haar: '#3a2a1c', lang: false },
      aussagen: [
        'Ich habe auf den Zug um 16:22 gewartet.',
        'Beim Ständer hat jemand herumgewerkelt, ich dachte an eine Panne.',
        'Dann kam mein Zug und ich bin eingestiegen.'
      ], luege: -1 },
    { name: 'Selina', rolle: 'Schülerin', seed: 61, opts: { haar: '#b1442c', lang: true },
      aussagen: [
        'Ich sass die ganze Zeit beim Kiosk und habe ein Glace gegessen.',
        'Von dort habe ich genau gesehen, wie das Velo weggeführt wurde.',
        'Wer es war, konnte ich nicht erkennen.'
      ], luege: 1,
      warum: 'Zwischen Kiosk und Veloständer steht eine hohe Hecke. Vom Kiosk aus kann man den Ständer nicht sehen.' }
  ],
  verdaechtige: [
    { id: 'v1', name: 'Timo', seed: 15, opts: { haar: '#3a2a1c', lang: false },
      merkmale: ['Mountainbike', 'Schuhgrösse 38'] },
    { id: 'v2', name: 'Mira', seed: 27, opts: { haar: '#7a4a22', lang: true },
      merkmale: ['Rennvelo', 'Schuhgrösse 36'] },
    { id: 'v3', name: 'Aaron', seed: 39, opts: { haar: '#2b2b2b', lang: false },
      merkmale: ['Trottinett', 'Schuhgrösse 38'] },
    { id: 'v4', name: 'Nina', seed: 52, opts: { haar: '#d9b45c', lang: true },
      merkmale: ['Mountainbike', 'Schuhgrösse 40'] }
  ],
  ausschluss: [
    { frage: 'Die Spur stammt von einem Mountainbike. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die kein Mountainbike haben.',
      raus: ['v2', 'v3'],
      warum: 'Mira fährt Rennvelo, Aaron Trottinett. Beide Profile sehen anders aus.' },
    { frage: 'Der Täter hat Schuhgrösse 38. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die eine andere Grösse tragen.',
      raus: ['v4'],
      warum: 'Nina trägt Grösse 40. Ihr Abdruck wäre 25 cm lang, nicht 24 cm.' }
  ],
  taeter: 'v1',
  aufloesung: [
    'Timo hat das Velo mitgenommen. Sein eigenes war kaputt und er wollte "nur schnell" nach Hause fahren.',
    'Das Velo steht im Wald hinter dem Bahnhof – unbeschädigt. Timo bringt es zurück.',
    'Wichtig: Etwas ohne Fragen mitnehmen ist Diebstahl, auch wenn man es zurückgeben will.'
  ],
  wusstest: {
    titel: 'Dein Velo wiederfinden',
    text: 'Jedes Velo hat eine Rahmennummer, eingeprägt am Rahmen. Schreib sie zu Hause auf und mach ein Foto von deinem Velo. Wird es gestohlen, kann die Polizei es damit eindeutig zuordnen.'
  }
},

/* ============================ FALL 3 ============================ */
{
  id: 'f3', nr: 3,
  titel: 'Farbe am Gemeindehaus',
  ort: 'Dorfplatz Bärenmoos',
  schwierigkeit: 3,
  szene: 'gemeindehaus',
  bild: 'assets/img/tatort-3.webp',
  briefing: [
    'An der Wand des Gemeindehauses ist über Nacht ein grosses grünes Zeichen aufgetaucht.',
    'Die Gemeinde muss die Wand für viel Geld reinigen lassen. Das nennt man Sachbeschädigung.',
    'Diesmal musst du auch die Uhr lesen können – die Alibis hängen an Uhrzeiten.'
  ],
  fakten: [
    'Tatzeit: Samstag zwischen 14:00 und 15:00 Uhr.',
    'Die Kirchturmuhr im Hintergrund ist auf jedem Foto zu sehen.',
    'Die Farbe ist noch feucht – sie braucht drei Stunden zum Trocknen.'
  ],
  spuren: [
    { id: 's1', icon: 'farbe', x: 0.46, y: 0.69, name: 'Farbspritzer',
      text: 'Grüne Tropfen auf dem Pflaster, noch klebrig.',
      wert: 'Die Farbe ist frisch – die Tat ist erst wenige Stunden her.' },
    { id: 's2', icon: 'handschuh', x: 0.82, y: 0.55, name: 'Handschuh',
      text: 'Ein einzelner Arbeitshandschuh im Gebüsch, innen grüne Farbe.',
      wert: 'Der Täter hat Handschuhe getragen – deshalb keine Fingerabdrücke an der Dose.' },
    { id: 's3', icon: 'zettel', x: 0.30, y: 0.84, name: 'Notizzettel',
      text: 'Ein Zettel mit einer Skizze des Zeichens. Handschrift gut erkennbar.',
      wert: 'Die Handschrift lässt sich vergleichen.' },
    { id: 's4', icon: 'schuh', x: 0.62, y: 0.86, name: 'Farbige Fussspur',
      text: 'Jemand ist in die Farbe getreten und drei Schritte weit gelaufen.',
      wert: 'Der Täter hat grüne Farbe an der Schuhsohle.' },
    { id: 's5', icon: 'glas', x: 0.13, y: 0.62, name: 'Leere Spraydose',
      text: 'Eine leere Dose "Moosgrün" hinter dem Brunnen.',
      wert: 'Die Farbe ist Moosgrün – nicht Tannengrün, nicht Blaugrün.' }
  ],
  labor: [
    { typ: 'uhr', frage: 'Ein Foto zeigt den Täter vor der Kirchturmuhr. Wie spät war es?',
      hilfe: 'Der kurze Zeiger ist die Stunde, der lange die Minuten.',
      bild: { art: 'uhr', v: [14, 40] },
      optionen: [{ id: 'a', label: '08:14 Uhr' }, { id: 'b', label: '14:40 Uhr' }, { id: 'c', label: '15:20 Uhr' }],
      richtig: 'b',
      ergebnis: 'Der Täter war um 14:40 Uhr am Gemeindehaus.' },
    { typ: 'vergleich', frage: 'Welche Handschrift passt zum Notizzettel?',
      hilfe: 'Achte auf die Neigung der Buchstaben.',
      probe: { art: 'handschrift', v: 'links', label: 'Schrift vom Zettel' },
      optionen: [
        { id: 'a', art: 'handschrift', v: 'steil',  label: 'Probe A' },
        { id: 'b', art: 'handschrift', v: 'rechts', label: 'Probe B' },
        { id: 'c', art: 'handschrift', v: 'links',  label: 'Probe C' },
        { id: 'd', art: 'handschrift', v: 'dick',   label: 'Probe D' }
      ],
      richtig: 'c',
      ergebnis: 'Die Schrift ist stark nach links geneigt.' },
    { typ: 'vergleich', frage: 'Welche Farbprobe ist Moosgrün wie auf der Dose?',
      hilfe: 'Vergleiche den Farbton, nicht die Form.',
      probe: { art: 'faser', v: ['#4f8f3a', false], label: 'Farbe vom Tatort' },
      optionen: [
        { id: 'a', art: 'faser', v: ['#1f5c3a', false], label: 'Tannengrün' },
        { id: 'b', art: 'faser', v: ['#4f8f3a', false], label: 'Moosgrün' },
        { id: 'c', art: 'faser', v: ['#3aa19c', false], label: 'Blaugrün' },
        { id: 'd', art: 'faser', v: ['#9fc94a', false], label: 'Hellgrün' }
      ],
      richtig: 'b',
      ergebnis: 'Die Farbe ist eindeutig Moosgrün.' }
  ],
  zeugen: [
    { name: 'Frau Odermatt', rolle: 'Bäckerei', seed: 71, opts: { haar: '#7a4a22', lang: true },
      aussagen: [
        'Ich habe um 14:30 den Laden geschlossen.',
        'Beim Gemeindehaus stand jemand mit einer Kapuze.',
        'Das Gesicht habe ich nicht gesehen.'
      ], luege: -1 },
    { name: 'Kevin', rolle: 'Nachbar', seed: 83, opts: { haar: '#2b2b2b', lang: false },
      aussagen: [
        'Ich war den ganzen Nachmittag im Hallenbad.',
        'Um Viertel vor drei war ich schon zu Hause und habe geduscht.',
        'Von der Farbe habe ich erst am Abend gehört.'
      ], luege: 1,
      warum: 'Er sagt zuerst, er war den ganzen Nachmittag im Hallenbad – und dann, dass er schon um 14:45 zu Hause war. Beides zusammen geht nicht.' },
    { name: 'Herr Frei', rolle: 'Brunnenmeister', seed: 95, opts: { haar: '#8e8e8e', lang: false, brille: true },
      aussagen: [
        'Ich habe um 15:00 den Brunnen kontrolliert.',
        'Die Farbe an der Wand war da schon dran und noch nass.',
        'Hinter dem Brunnen lag eine leere Dose.'
      ], luege: -1 }
  ],
  verdaechtige: [
    { id: 'v1', name: 'Kevin', seed: 83, opts: { haar: '#2b2b2b', lang: false },
      merkmale: ['Schrift: nach links', 'Farbe: Moosgrün', 'Um 14:40 am Platz'] },
    { id: 'v2', name: 'Jill', seed: 22, opts: { haar: '#b1442c', lang: true },
      merkmale: ['Schrift: nach rechts', 'Farbe: Moosgrün', 'Um 14:40 am Platz'] },
    { id: 'v3', name: 'Dario', seed: 47, opts: { haar: '#3a2a1c', lang: false },
      merkmale: ['Schrift: nach links', 'Farbe: Tannengrün', 'Um 14:40 am Platz'] },
    { id: 'v4', name: 'Enia', seed: 66, opts: { haar: '#d9b45c', lang: true },
      merkmale: ['Schrift: nach links', 'Farbe: Moosgrün', 'Um 14:40 im Zug'] }
  ],
  ausschluss: [
    { frage: 'Die Schrift auf dem Zettel neigt sich nach links. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die anders schreiben.',
      raus: ['v2'],
      warum: 'Jill schreibt nach rechts geneigt. Die Schrift auf dem Zettel neigt sich nach links.' },
    { frage: 'Die Farbe ist Moosgrün. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die eine andere Farbe besitzen.',
      raus: ['v3'],
      warum: 'Dario hat nur Tannengrün. Das ist ein dunklerer Ton.' },
    { frage: 'Um 14:40 war der Täter vor dem Gemeindehaus. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die zu dieser Zeit woanders waren.',
      raus: ['v4'],
      warum: 'Enia sass um 14:40 nachweislich im Zug nach Luzern.' }
  ],
  taeter: 'v1',
  aufloesung: [
    'Kevin hat das Zeichen gesprayt. In seiner Aussage hat er sich selbst widersprochen.',
    'Er muss die Wand zusammen mit dem Hauswart reinigen und die Farbe bezahlen.',
    'Wachtmeister Brünnli zeigt ihm die legale Sprayerwand beim Jugendtreff. Dort darf man malen, so viel man will.'
  ],
  wusstest: {
    titel: 'Kantons- oder Stadtpolizei?',
    text: 'In der Schweiz ist die Polizei Sache der Kantone. Jeder Kanton hat eine Kantonspolizei. Grössere Städte haben zusätzlich eine eigene Stadt- oder Gemeindepolizei. Deshalb sehen die Uniformen und Autos nicht überall gleich aus.'
  }
},

/* ============================ FALL 4 ============================ */
{
  id: 'f4', nr: 4,
  titel: 'Das goldene Murmeltier',
  ort: 'Heimatmuseum Bärenmoos',
  schwierigkeit: 4,
  szene: 'museum',
  bild: 'assets/img/tatort-4.webp',
  briefing: [
    'Ernster Fall: Aus dem Heimatmuseum ist das goldene Murmeltier verschwunden.',
    'Es ist über hundert Jahre alt und gehört dem ganzen Dorf.',
    'Der Alarm ging um 03:10 Uhr los. Als die Patrouille ankam, war die Vitrine leer.'
  ],
  fakten: [
    'Der Alarm ging um 03:10 Uhr los.',
    'Nur vier Personen haben einen Schlüssel zum Seiteneingang.',
    'Die Vitrine wurde nicht aufgebrochen, sondern korrekt aufgeschlossen.'
  ],
  spuren: [
    { id: 's1', icon: 'fenster', x: 0.16, y: 0.26, name: 'Offenes Fenster',
      text: 'Das Fenster im Erdgeschoss ist von innen geöffnet worden.',
      wert: 'Der Täter war schon im Haus, bevor er das Fenster öffnete.' },
    { id: 's2', icon: 'leiter', x: 0.89, y: 0.36, name: 'Die Leiter',
      text: 'Eine Holzleiter lehnt an der Wand. Draussen im Blumenbeet stehen zwei passende Abdrücke – auf frischen Erdspuren, die erst danach entstanden sind.',
      wert: 'Die Leiter wurde erst nachher angestellt. Eine falsche Fährte.' },
    { id: 's3', icon: 'haar', x: 0.30, y: 0.44, name: 'Rote Wollfaser',
      text: 'Am Fensterrahmen hängt eine rote Wollfaser.',
      wert: 'Der Täter trug etwas aus roter Wolle.' },
    { id: 's4', icon: 'fingerabdruck', x: 0.53, y: 0.35, name: 'Fingerabdruck',
      text: 'Auf der Vitrine ist ein einzelner Abdruck – mit Wirbelmuster.',
      wert: 'Der Abdruck lässt sich mit den Schlüsselträgern vergleichen.' },
    { id: 's5', icon: 'schluessel', x: 0.68, y: 0.52, name: 'Schlüssel',
      text: 'Der Schlüssel zur Vitrine steckt noch im Schloss.',
      wert: 'Der Täter hatte es eilig – oder wollte gefunden werden.' },
    { id: 's6', icon: 'glas', x: 0.50, y: 0.80, name: 'Glas Wasser',
      text: 'Ein halb volles Glas steht auf dem Sockel. Noch nicht eingetrocknet.',
      wert: 'Jemand hat sich hier länger aufgehalten.' }
  ],
  labor: [
    { typ: 'vergleich', frage: 'Welcher Fingerabdruck hat ein Wirbelmuster wie der Abdruck auf der Vitrine?',
      hilfe: 'Beim Wirbel drehen sich die Linien im Kreis. Beim Bogen laufen sie über einen Hügel.',
      probe: { art: 'fingerabdruck', v: 'wirbel', label: 'Abdruck von der Vitrine' },
      optionen: [
        { id: 'a', art: 'fingerabdruck', v: 'bogen',    label: 'Person A' },
        { id: 'b', art: 'fingerabdruck', v: 'schleife', label: 'Person B' },
        { id: 'c', art: 'fingerabdruck', v: 'wirbel',   label: 'Person C' },
        { id: 'd', art: 'fingerabdruck', v: 'doppel',   label: 'Person D' }
      ],
      richtig: 'c',
      ergebnis: 'Der Abdruck auf der Vitrine ist ein Wirbel.' },
    { typ: 'vergleich', frage: 'Welche Faser passt zur Faser am Fensterrahmen?',
      hilfe: 'Vergleiche Farbe und ob die Faser wellig oder glatt ist.',
      probe: { art: 'faser', v: ['#c0392b', true], label: 'Faser vom Rahmen' },
      optionen: [
        { id: 'a', art: 'faser', v: ['#c0392b', false], label: 'Probe A' },
        { id: 'b', art: 'faser', v: ['#2c5fa8', true],  label: 'Probe B' },
        { id: 'c', art: 'faser', v: ['#c0392b', true],  label: 'Probe C' },
        { id: 'd', art: 'faser', v: ['#8e8e8e', true],  label: 'Probe D' }
      ],
      richtig: 'c',
      ergebnis: 'Rote, wellige Wolle – wie von einem gestrickten Schal.' },
    { typ: 'uhr', frage: 'Die Uhr im Ausstellungsraum blieb beim Alarm stehen. Wie spät war es?',
      hilfe: 'Der kurze Zeiger steht kurz nach der 3.',
      bild: { art: 'uhr', v: [3, 10] },
      optionen: [{ id: 'a', label: '02:15 Uhr' }, { id: 'b', label: '03:10 Uhr' }, { id: 'c', label: '10:15 Uhr' }],
      richtig: 'b',
      ergebnis: 'Bestätigt: Der Alarm ging um 03:10 Uhr los.' }
  ],
  zeugen: [
    { name: 'Frau Rüegg', rolle: 'Museumsleiterin', seed: 101, opts: { haar: '#8e8e8e', lang: true, brille: true },
      aussagen: [
        'Ich habe das Museum um 18:00 abgeschlossen.',
        'Die Vitrine war zu und das Murmeltier drin.',
        'Der Alarm hat mich um 03:10 aus dem Schlaf geholt.'
      ], luege: -1 },
    { name: 'Herr Kunz', rolle: 'Nachtwächter', seed: 113, opts: { haar: '#3a2a1c', lang: false },
      aussagen: [
        'Ich mache jede Stunde eine Runde.',
        'Um 03:00 war noch alles in Ordnung.',
        'Der Täter ist mit einer Leiter durchs Fenster eingestiegen, das sieht man ja.'
      ], luege: 2,
      warum: 'Das Fenster wurde von INNEN geöffnet, und die Leiterabdrücke sind auf den Farbspritzern – also erst danach entstanden. Eingestiegen ist niemand.' },
    { name: 'Frau Beeler', rolle: 'Restauratorin', seed: 127, opts: { haar: '#b1442c', lang: true },
      aussagen: [
        'Ich habe bis 20:00 im Depot gearbeitet.',
        'Mein roter Schal hängt seit Wochen im Büro.',
        'Ich habe niemanden mehr im Haus gesehen.'
      ], luege: -1 }
  ],
  verdaechtige: [
    { id: 'v1', name: 'Herr Kunz', seed: 113, opts: { haar: '#3a2a1c', lang: false },
      merkmale: ['Abdruck: Wirbel', 'Rote Wolle: ja', 'Schlüssel: ja'] },
    { id: 'v2', name: 'Frau Rüegg', seed: 101, opts: { haar: '#8e8e8e', lang: true, brille: true },
      merkmale: ['Abdruck: Bogen', 'Rote Wolle: ja', 'Schlüssel: ja'] },
    { id: 'v3', name: 'Frau Beeler', seed: 127, opts: { haar: '#b1442c', lang: true },
      merkmale: ['Abdruck: Wirbel', 'Rote Wolle: ja', 'Schlüssel: nein'] },
    { id: 'v4', name: 'Herr Ammann', seed: 139, opts: { haar: '#d9b45c', lang: false },
      merkmale: ['Abdruck: Wirbel', 'Rote Wolle: nein', 'Schlüssel: ja'] }
  ],
  ausschluss: [
    { frage: 'Der Abdruck auf der Vitrine ist ein Wirbel. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die ein anderes Muster haben.',
      raus: ['v2'],
      warum: 'Frau Rüegg hat einen Bogen. Ein Bogen kann nie zu einem Wirbel werden.' },
    { frage: 'Am Rahmen hing rote Wolle. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die nichts aus roter Wolle besitzen.',
      raus: ['v4'],
      warum: 'Herr Ammann besitzt nichts aus roter Wolle.' },
    { frage: 'Die Vitrine wurde aufgeschlossen, nicht aufgebrochen. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die keinen Schlüssel haben.',
      raus: ['v3'],
      warum: 'Frau Beeler hat keinen Schlüssel. Sie hätte die Vitrine aufbrechen müssen.' }
  ],
  taeter: 'v1',
  aufloesung: [
    'Herr Kunz war es. Er hat das Murmeltier aus der Vitrine genommen und danach die Leiter ans Fenster gestellt, damit es nach einem Einbruch von aussen aussieht.',
    'Sein Grund: Er hatte gehört, das Museum wolle das Murmeltier verkaufen. Er wollte es "retten". Es lag unversehrt in seinem Schuppen.',
    'Das Murmeltier bleibt im Museum – verkauft wird es nicht. Trotzdem gibt es eine Anzeige. Eine gute Absicht macht eine Straftat nicht ungeschehen.'
  ],
  wusstest: {
    titel: 'Warum man am Tatort nichts anfasst',
    text: 'Die Spurensicherung trägt weisse Anzüge, Handschuhe und Maske. Nicht zum Schutz vor Schmutz, sondern damit sie keine eigenen Haare, Fasern oder Fingerabdrücke am Tatort hinterlässt. Jede fremde Spur macht die Arbeit schwieriger.'
  }
},

/* ============================ FALL 5 ============================ */
{
  id: 'f5', nr: 5,
  titel: 'Wo ist Rösti?',
  ort: 'Waldrand Bärenmoos',
  schwierigkeit: 5,
  szene: 'wald',
  bild: 'assets/img/tatort-5.webp',
  briefing: [
    'Jetzt wird es persönlich. Rösti ist weg.',
    'Ich habe ihn am Waldrand angebunden, während ich zehn Minuten im Forsthaus war. Als ich zurückkam, war die Leine leer.',
    'Du hast alles gelernt, was du brauchst. Bring mir meinen Hund zurück.'
  ],
  fakten: [
    'Rösti war von 15:50 bis 16:00 Uhr allein am Waldrand.',
    'Es war ein sehr heisser Tag, 31 Grad, und der Platz lag in der prallen Sonne.',
    'Rösti ist freundlich und geht mit jedem mit, der Guetzli dabei hat.'
  ],
  spuren: [
    { id: 's1', icon: 'pfote', x: 0.42, y: 0.80, name: 'Pfotenabdrücke',
      text: 'Röstis Pfoten führen vom Baum weg – Richtung Dorf, nicht in den Wald.',
      wert: 'Rösti ist nicht weggelaufen, er wurde weggeführt.' },
    { id: 's2', icon: 'schluessel', x: 0.30, y: 0.42, name: 'Die Leine',
      text: 'Die Leine ist nicht zerrissen. Der Karabiner wurde sauber geöffnet.',
      wert: 'Ein Mensch hat die Leine geöffnet.' },
    { id: 's3', icon: 'kruemel', x: 0.20, y: 0.68, name: 'Guetzli-Krümel',
      text: 'Hundeguetzli-Krümel am Boden, direkt beim Baum.',
      wert: 'Die Person hatte Hundeguetzli dabei – sie kennt Hunde.' },
    { id: 's4', icon: 'schuh', x: 0.60, y: 0.85, name: 'Schuhabdruck',
      text: 'Ein Abdruck im weichen Boden, Wellenmuster.',
      wert: 'Der Täter trägt Schuhe mit Wellensohle.' },
    { id: 's5', icon: 'zettel', x: 0.78, y: 0.72, name: 'Einkaufszettel',
      text: 'Ein Einkaufszettel: "Gartenschlauch, Hundefutter, Sonnencreme".',
      wert: 'Die Person kauft Hundefutter – hat aber laut Nachbarn keinen Hund.' },
    { id: 's6', icon: 'reifen', x: 0.60, y: 0.55, name: 'Kinderwagenspur',
      text: 'Eine schmale, glatte Doppelspur im Sand.',
      wert: 'Jemand mit einem Kinderwagen war hier.' }
  ],
  labor: [
    { typ: 'vergleich', frage: 'Welche Sohle passt zum Abdruck am Waldrand?',
      hilfe: 'Wellen sind runde Linien, keine Zacken.',
      probe: { art: 'sohle', v: 'wellen', label: 'Abdruck vom Waldrand' },
      optionen: [
        { id: 'a', art: 'sohle', v: 'stollen',  label: 'Sohle A' },
        { id: 'b', art: 'sohle', v: 'wellen',   label: 'Sohle B' },
        { id: 'c', art: 'sohle', v: 'zickzack', label: 'Sohle C' },
        { id: 'd', art: 'sohle', v: 'raster',   label: 'Sohle D' }
      ],
      richtig: 'b',
      ergebnis: 'Der Täter trägt Schuhe mit Wellensohle.' },
    { typ: 'uhr', frage: 'Eine Nachbarin hat Rösti vorbeilaufen sehen. Ihre Küchenuhr zeigte:',
      hilfe: 'Kurzer Zeiger knapp vor der 4, langer Zeiger auf der 11.',
      bild: { art: 'uhr', v: [3, 55] },
      optionen: [{ id: 'a', label: '03:55 Uhr' }, { id: 'b', label: '15:55 Uhr' }, { id: 'c', label: '11:15 Uhr' }],
      richtig: 'b',
      ergebnis: 'Um 15:55 Uhr wurde Rösti Richtung Dorf geführt – mitten im Tatzeitfenster.' },
    { typ: 'wahl', frage: 'Rösti war 10 Minuten allein. Um 15:55 wurde er gesehen. Wie lange war er da schon weg?',
      hilfe: 'Von 15:50 bis 15:55 – zähl die Minuten.',
      optionen: [{ id: 'a', label: '5 Minuten' }, { id: 'b', label: '10 Minuten' }, { id: 'c', label: '15 Minuten' }],
      richtig: 'a',
      ergebnis: 'Rösti verschwand also gleich in den ersten fünf Minuten.' }
  ],
  zeugen: [
    { name: 'Frau Hübscher', rolle: 'Nachbarin', seed: 151, opts: { haar: '#8e8e8e', lang: true, brille: true },
      aussagen: [
        'Ich war den ganzen Nachmittag in meinem Garten.',
        'Ich habe überhaupt keinen Hund gesehen.',
        'Ich habe gestern extra Hundefutter eingekauft, für die Nachbarskatze.'
      ], luege: 2,
      warum: 'Hundefutter für eine Katze? Katzen fressen kein Hundefutter. Und der Einkaufszettel vom Tatort passt genau zu ihrem Einkauf.' },
    { name: 'Luis', rolle: 'Jogger', seed: 163, opts: { haar: '#2b2b2b', lang: false },
      aussagen: [
        'Ich bin um 15:45 am Waldrand vorbeigejoggt.',
        'Da lag der Hund noch in der Sonne und hat gehechelt.',
        'Er hat mir echt leidgetan, aber ich bin weitergelaufen.'
      ], luege: -1 },
    { name: 'Herr Sutter', rolle: 'Förster', seed: 175, opts: { haar: '#7a4a22', lang: false },
      aussagen: [
        'Ich war um 16:00 beim Forsthaus.',
        'Der Wachtmeister war völlig aufgelöst.',
        'Im Wald war kein Hund, ich habe alles abgesucht.'
      ], luege: -1 }
  ],
  verdaechtige: [
    { id: 'v1', name: 'Frau Hübscher', seed: 151, opts: { haar: '#8e8e8e', lang: true, brille: true },
      merkmale: ['Sohle: Wellen', 'Hundeguetzli: ja', 'Um 15:55 im Dorf'] },
    { id: 'v2', name: 'Luis', seed: 163, opts: { haar: '#2b2b2b', lang: false },
      merkmale: ['Sohle: Stollen', 'Hundeguetzli: nein', 'Um 15:55 im Dorf'] },
    { id: 'v3', name: 'Frau Egli', seed: 187, opts: { haar: '#b1442c', lang: true },
      merkmale: ['Sohle: Wellen', 'Hundeguetzli: ja', 'Um 15:55 im Zug'] },
    { id: 'v4', name: 'Herr Sutter', seed: 175, opts: { haar: '#7a4a22', lang: false },
      merkmale: ['Sohle: Wellen', 'Hundeguetzli: nein', 'Um 15:55 im Wald'] }
  ],
  ausschluss: [
    { frage: 'Der Abdruck zeigt eine Wellensohle. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die ein anderes Sohlenmuster haben.',
      raus: ['v2'],
      warum: 'Luis joggt mit Stollensohlen. Die hinterlassen ganz andere Abdrücke.' },
    { frage: 'Am Baum lagen Hundeguetzli-Krümel. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die keine Hundeguetzli dabeihatten.',
      raus: ['v4'],
      warum: 'Herr Sutter hat keine Hundeguetzli dabei – er füttert im Wald grundsätzlich nichts.' },
    { frage: 'Um 15:55 war die Person mit Rösti im Dorf. Wer scheidet aus?',
      hinweis: 'Tippe alle an, die um 15:55 woanders waren.',
      raus: ['v3'],
      warum: 'Frau Egli sass um 15:55 im Zug nach Bern. Das Billett beweist es.' }
  ],
  taeter: 'v1',
  aufloesung: [
    'Frau Hübscher hat Rösti mitgenommen. Sie hat ihn in der prallen Sonne hecheln sehen und gedacht, er sei ausgesetzt worden.',
    'Rösti sitzt wohlauf in ihrem schattigen Garten, mit einem vollen Wassernapf. Sie hat es gut gemeint – aber sie hätte 117 anrufen müssen, statt ihn einfach mitzunehmen.',
    'Wachtmeister Brünnli gibt zu: Zehn Minuten in der prallen Sonne waren auch von ihm ein Fehler. Beide entschuldigen sich. Rösti versteht sowieso nichts davon und will nur spielen.'
  ],
  wusstest: {
    titel: 'Ein Tier in Not gefunden?',
    text: 'Nimm ein fremdes Tier nie einfach mit – die Besitzerin sucht sonst verzweifelt. Melde es der Polizei (117) oder beim Fundbüro der Gemeinde. Steckt das Tier in echter Gefahr, zum Beispiel im heissen Auto, rufst du sofort 117 an.'
  }
}

];

export const RANG_TEXTE = {
  'Anwärter:in': 'Du hast eben angefangen. Ein Fall reicht schon für die Beförderung.',
  'Spürnase': 'Du findest Spuren, die andere übersehen.',
  'Wachtmeister:in': 'Du arbeitest sauber und liest Aussagen genau.',
  'Inspektor:in': 'Du kombinierst wie eine Profi-Ermittlerin.',
  'Chefinspektor:in': 'Alle Fälle gelöst. Bärenmoos schläft ruhig.'
};
