/* Fallakten. Alle Personen und Orte sind erfunden.
   Textregel: Einleitung höchstens ein Satz, Aussagen höchstens zwölf Wörter,
   alles Übrige wird gezeigt oder vorgelesen statt geschrieben.
   x/y der Spuren sind Anteile der Szene (0..1). */

export const FAELLE = [

/* ============================ FALL 1 — Schnelleinstieg ============================ */
{
  id: 'f1', nr: 1,
  titel: 'Der Znüni-Kuchen',
  ort: 'Schulhaus Bärenmoos',
  schwierigkeit: 1,
  szene: 'schule',
  bild: 'assets/img/tatort-1.webp',
  licht: 'lupe',
  phasen: ['tatort', 'labor', 'lineup', 'verhaftung'],

  intro: {
    text: 'Der Znüni-Kuchen der 2b ist weg. Such den Tatort ab!',
    fakten: [
      { icon: 'uhr', text: 'Grosse Pause' },
      { icon: 'fenster', text: 'Fenster offen' },
      { icon: 'farbe', text: 'Draussen Regen' }
    ]
  },

  spuren: [
    { id: 's1', icon: 'kruemel', x: 0.26, y: 0.80, name: 'Krümel',
      sagt: 'Eine Krümelspur führt zur Tür.' },
    { id: 's2', icon: 'schuh', x: 0.63, y: 0.85, name: 'Schuhabdruck',
      sagt: 'Ein nasser Abdruck. Das Muster ist gut zu sehen.' },
    { id: 's3', icon: 'zettel', x: 0.89, y: 0.53, name: 'Zettel',
      sagt: 'Im Papierkorb: Ich habe mein Znüni vergessen.' }
  ],

  labor: [
    { typ: 'vergleich', frage: 'Welche Sohle passt zum Abdruck?',
      probe: { art: 'sohle', v: 'zickzack', label: 'Vom Tatort' },
      optionen: [
        { id: 'a', art: 'sohle', v: 'punkte',   label: 'A' },
        { id: 'b', art: 'sohle', v: 'zickzack', label: 'B' },
        { id: 'c', art: 'sohle', v: 'wellen',   label: 'C' },
        { id: 'd', art: 'sohle', v: 'raster',   label: 'D' }
      ],
      richtig: 'b',
      ergebnis: 'Zickzack-Sohle.' }
  ],

  verdaechtige: [
    { id: 'v1', name: 'Nora',  bild: 'nora',  werte: { sohle: 'Punkte',   haar: 'braun' } },
    { id: 'v2', name: 'Ruben', bild: 'ruben', werte: { sohle: 'Zickzack', haar: 'blond' } },
    { id: 'v3', name: 'Livia', bild: 'livia', werte: { sohle: 'Punkte',   haar: 'blond' } }
  ],
  merkmalIcons: { sohle: 'schuh', haar: 'haar' },

  lineup: [
    { feld: 'sohle', icon: 'schuh', label: 'Zickzack',
      frage: 'Wer hat andere Schuhe?',
      raus: ['v1', 'v3'], warum: 'Nora und Livia haben Punkte-Sohlen.' }
  ],

  taeter: 'v2',
  aufloesung: [
    'Ruben hatte sein Znüni vergessen und riesigen Hunger.',
    'Er hat es zugegeben, als du ihm die Spuren gezeigt hast.',
    'Am Freitag backt die Klasse einen neuen Kuchen. Ruben hilft mit.'
  ],
  wusstest: { icon: 'schluessel', titel: 'Notruf 117',
    text: 'Die Polizei erreichst du in der Schweiz unter 117. Feuerwehr 118, Sanität 144.' }
},

/* ============================ FALL 2 — mit Verfolgung ============================ */
{
  id: 'f2', nr: 2,
  titel: 'Das gestohlene Velo',
  ort: 'Bahnhof Bärenmoos',
  schwierigkeit: 2,
  szene: 'bahnhof',
  bild: 'assets/img/tatort-2.webp',
  licht: 'lupe',
  phasen: ['tatort', 'labor', 'verfolgung', 'lineup', 'verhaftung'],

  intro: {
    text: 'Ein rotes Velo ist weg. Im Kies bleiben Spuren zurück.',
    fakten: [
      { icon: 'uhr', text: '16:00 bis 16:30' },
      { icon: 'schluessel', text: 'Schloss durchtrennt' },
      { icon: 'reifen', text: 'Weicher Kies' }
    ]
  },

  spuren: [
    { id: 's1', icon: 'schluessel', x: 0.35, y: 0.83, name: 'Schloss',
      sagt: 'Mit einer Zange durchtrennt. Das war geplant.' },
    { id: 's2', icon: 'reifen', x: 0.62, y: 0.72, name: 'Reifenspur',
      sagt: 'Ein deutliches Profil im Kies.' },
    { id: 's3', icon: 'schuh', x: 0.85, y: 0.84, name: 'Schuhabdruck',
      sagt: 'Vierundzwanzig Zentimeter lang. Das ist Grösse achtunddreissig.' },
    { id: 's4', icon: 'velo', x: 0.16, y: 0.72, name: 'Lacksplitter',
      sagt: 'Roter Lack. Das Velo wurde hastig herausgezogen.' }
  ],

  labor: [
    { typ: 'vergleich', frage: 'Welcher Reifen passt zur Spur?',
      probe: { art: 'reifen', v: 'mountainbike', label: 'Vom Tatort' },
      optionen: [
        { id: 'a', art: 'reifen', v: 'rennvelo',     label: 'Rennvelo' },
        { id: 'b', art: 'reifen', v: 'trottinett',   label: 'Trottinett' },
        { id: 'c', art: 'reifen', v: 'mountainbike', label: 'Mountainbike' },
        { id: 'd', art: 'reifen', v: 'kinderwagen',  label: 'Kinderwagen' }
      ],
      richtig: 'c',
      ergebnis: 'Mountainbike.' },
    { typ: 'messen', frage: 'Wie lang ist der Abdruck?',
      bild: { art: 'lineal', v: 24 },
      optionen: [{ id: 'a', label: '18 cm' }, { id: 'b', label: '24 cm' }, { id: 'c', label: '30 cm' }],
      richtig: 'b',
      ergebnis: 'Vierundzwanzig Zentimeter, also Grösse achtunddreissig.' }
  ],

  verfolgung: {
    text: 'Folge der Mountainbike-Spur!',
    referenz: { art: 'reifen', v: 'mountainbike' },
    schritte: [
      { links: { art: 'reifen', v: 'rennvelo' },   rechts: { art: 'reifen', v: 'mountainbike' }, richtig: 'rechts' },
      { links: { art: 'reifen', v: 'mountainbike' }, rechts: { art: 'reifen', v: 'trottinett' }, richtig: 'links' },
      { links: { art: 'reifen', v: 'kinderwagen' }, rechts: { art: 'reifen', v: 'mountainbike' }, richtig: 'rechts' }
    ],
    ziel: 'Die Spur endet im Wald hinter dem Bahnhof.'
  },

  verdaechtige: [
    { id: 'v1', name: 'Timo',  bild: 'timo',  werte: { velo: 'Mountainbike', schuh: '38' } },
    { id: 'v2', name: 'Mira',  bild: 'mira',  werte: { velo: 'Rennvelo',     schuh: '36' } },
    { id: 'v3', name: 'Aaron', bild: 'aaron', werte: { velo: 'Trottinett',   schuh: '38' } },
    { id: 'v4', name: 'Nina',  bild: 'nina',  werte: { velo: 'Mountainbike', schuh: '40' } }
  ],
  merkmalIcons: { velo: 'velo', schuh: 'schuh' },

  lineup: [
    { feld: 'velo', icon: 'reifen', label: 'Mountainbike',
      frage: 'Wer fährt etwas anderes?',
      raus: ['v2', 'v3'], warum: 'Mira fährt Rennvelo, Aaron Trottinett.' },
    { feld: 'schuh', icon: 'schuh', label: '38',
      frage: 'Wer hat eine andere Grösse?',
      raus: ['v4'], warum: 'Nina trägt Grösse vierzig.' }
  ],

  taeter: 'v1',
  aufloesung: [
    'Timo hat das Velo genommen. Seines war kaputt.',
    'Es steht unbeschädigt im Wald. Timo bringt es zurück.',
    'Ausleihen ohne Fragen ist Diebstahl. Auch wenn man zurückgeben will.'
  ],
  wusstest: { icon: 'velo', titel: 'Rahmennummer',
    text: 'Jedes Velo hat eine eingeprägte Rahmennummer. Schreib sie auf und mach ein Foto. Damit findet die Polizei dein Velo wieder.' }
},

/* ============================ FALL 3 — mit Zeitstrahl ============================ */
{
  id: 'f3', nr: 3,
  titel: 'Farbe am Gemeindehaus',
  ort: 'Dorfplatz Bärenmoos',
  schwierigkeit: 3,
  szene: 'gemeindehaus',
  bild: 'assets/img/tatort-3.webp',
  licht: 'lupe',
  phasen: ['tatort', 'zeitstrahl', 'zeugen', 'lineup', 'verhaftung'],

  intro: {
    text: 'Grüne Farbe am Gemeindehaus. Wer war zur Tatzeit hier?',
    fakten: [
      { icon: 'uhr', text: '14 bis 15 Uhr' },
      { icon: 'farbe', text: 'Farbe noch feucht' },
      { icon: 'zettel', text: 'Zettel mit Skizze' }
    ]
  },

  spuren: [
    { id: 's1', icon: 'farbe', x: 0.46, y: 0.69, name: 'Farbtropfen',
      sagt: 'Noch klebrig. Die Tat ist erst wenige Stunden her.' },
    { id: 's2', icon: 'handschuh', x: 0.82, y: 0.55, name: 'Handschuh',
      sagt: 'Innen grüne Farbe. Deshalb keine Fingerabdrücke.' },
    { id: 's3', icon: 'zettel', x: 0.30, y: 0.84, name: 'Notizzettel',
      sagt: 'Eine Skizze des Zeichens. Die Schrift neigt sich nach links.' },
    { id: 's4', icon: 'glas', x: 0.13, y: 0.62, name: 'Spraydose',
      sagt: 'Leer. Die Farbe heisst Moosgrün.' }
  ],

  zeitstrahl: {
    text: 'Wer war um die Tatzeit nicht am Dorfplatz?',
    von: 12.5, bis: 16, tatVon: 14, tatBis: 15,
    balken: [
      { id: 'v1', name: 'Kevin', von: 14.3, bis: 15.2 },
      { id: 'v2', name: 'Jill',  von: 13.2, bis: 15.7 },
      { id: 'v3', name: 'Dario', von: 14.5, bis: 15.3 },
      { id: 'v4', name: 'Enia',  von: 12.7, bis: 13.8 }
    ],
    raus: ['v4'],
    warum: 'Enia ging schon um Viertel vor zwei. Sie war nicht mehr da.'
  },

  zeugen: [
    { name: 'Frau Odermatt', rolle: 'Bäckerei', bild: 'odermatt',
      aussagen: [
        'Ich habe um halb drei den Laden geschlossen.',
        'Da stand jemand mit einer Kapuze an der Wand.',
        'Das Gesicht habe ich nicht gesehen.'
      ], luege: -1 },
    { name: 'Kevin', rolle: 'Nachbar', bild: 'kevin',
      aussagen: [
        'Ich war den ganzen Nachmittag im Hallenbad.',
        'Um Viertel vor drei war ich schon zu Hause.',
        'Von der Farbe habe ich erst am Abend gehört.'
      ], luege: 1,
      warum: 'Den ganzen Nachmittag im Hallenbad und um Viertel vor drei zu Hause? Beides zusammen geht nicht.' },
    { name: 'Herr Frei', rolle: 'Brunnenmeister', bild: 'frei',
      aussagen: [
        'Um drei habe ich den Brunnen kontrolliert.',
        'Die Farbe war schon dran und noch nass.',
        'Hinter dem Brunnen lag eine leere Dose.'
      ], luege: -1 }
  ],

  verdaechtige: [
    { id: 'v1', name: 'Kevin', bild: 'kevin', werte: { schrift: 'links',  farbe: 'Moosgrün' } },
    { id: 'v2', name: 'Jill',  bild: 'jill',  werte: { schrift: 'rechts', farbe: 'Moosgrün' } },
    { id: 'v3', name: 'Dario', bild: 'dario', werte: { schrift: 'links',  farbe: 'Tannengrün' } },
    { id: 'v4', name: 'Enia',  bild: 'enia',  werte: { schrift: 'links',  farbe: 'Moosgrün' } }
  ],
  merkmalIcons: { schrift: 'zettel', farbe: 'farbe' },

  lineup: [
    { feld: 'schrift', icon: 'zettel', label: 'links',
      frage: 'Wer schreibt anders?',
      raus: ['v2'], warum: 'Jill schreibt nach rechts geneigt.' },
    { feld: 'farbe', icon: 'farbe', label: 'Moosgrün',
      frage: 'Wer hat eine andere Farbe?',
      raus: ['v3'], warum: 'Dario hat nur Tannengrün. Das ist dunkler.' }
  ],

  taeter: 'v1',
  aufloesung: [
    'Kevin hat gesprayt. Er hat sich selbst widersprochen.',
    'Er putzt die Wand mit dem Hauswart und zahlt die Farbe.',
    'Beim Jugendtreff gibt es eine Wand, an der man sprayen darf.'
  ],
  wusstest: { icon: 'stempel', titel: 'Kantonspolizei',
    text: 'In der Schweiz ist die Polizei Sache der Kantone. Grössere Städte haben zusätzlich eine eigene Stadtpolizei.' }
},

/* ============================ FALL 4 — im Dunkeln ============================ */
{
  id: 'f4', nr: 4,
  titel: 'Das goldene Murmeltier',
  ort: 'Heimatmuseum',
  schwierigkeit: 4,
  szene: 'museum',
  bild: 'assets/img/tatort-4.webp',
  licht: 'taschenlampe',
  phasen: ['tatort', 'labor', 'zeugen', 'lineup', 'verhaftung'],

  intro: {
    text: 'Nachts im Museum: Die Vitrine ist leer. Nimm die Taschenlampe.',
    fakten: [
      { icon: 'uhr', text: 'Alarm um 03:10' },
      { icon: 'schluessel', text: 'Vier haben Schlüssel' },
      { icon: 'glas', text: 'Vitrine aufgeschlossen' }
    ]
  },

  spuren: [
    { id: 's1', icon: 'fenster', x: 0.16, y: 0.26, name: 'Fenster',
      sagt: 'Von innen geöffnet. Der Täter war schon im Haus.' },
    { id: 's2', icon: 'leiter', x: 0.89, y: 0.36, name: 'Leiter',
      sagt: 'Die Abdrücke draussen sind erst nachher entstanden.' },
    { id: 's3', icon: 'haar', x: 0.30, y: 0.44, name: 'Wollfaser',
      sagt: 'Rot und wellig. Wie von einem gestrickten Schal.' },
    { id: 's4', icon: 'fingerabdruck', x: 0.53, y: 0.35, name: 'Fingerabdruck',
      sagt: 'Auf der Vitrine. Ein Wirbelmuster.' },
    { id: 's5', icon: 'schluessel', x: 0.68, y: 0.52, name: 'Schlüssel',
      sagt: 'Steckt noch im Schloss. Jemand hatte es eilig.' }
  ],

  labor: [
    { typ: 'vergleich', frage: 'Welcher Abdruck ist ein Wirbel?',
      probe: { art: 'fingerabdruck', v: 'wirbel', label: 'Von der Vitrine' },
      optionen: [
        { id: 'a', art: 'fingerabdruck', v: 'bogen',    label: 'A' },
        { id: 'b', art: 'fingerabdruck', v: 'schleife', label: 'B' },
        { id: 'c', art: 'fingerabdruck', v: 'wirbel',   label: 'C' },
        { id: 'd', art: 'fingerabdruck', v: 'doppel',   label: 'D' }
      ],
      richtig: 'c',
      ergebnis: 'Ein Wirbel.' },
    { typ: 'vergleich', frage: 'Welche Faser passt?',
      probe: { art: 'faser', v: ['#c0392b', true], label: 'Vom Rahmen' },
      optionen: [
        { id: 'a', art: 'faser', v: ['#c0392b', false], label: 'A' },
        { id: 'b', art: 'faser', v: ['#2c5fa8', true],  label: 'B' },
        { id: 'c', art: 'faser', v: ['#c0392b', true],  label: 'C' },
        { id: 'd', art: 'faser', v: ['#8e8e8e', true],  label: 'D' }
      ],
      richtig: 'c',
      ergebnis: 'Rote, wellige Wolle.' }
  ],

  zeugen: [
    { name: 'Frau Rüegg', rolle: 'Museumsleitung', bild: 'rueegg',
      aussagen: [
        'Ich habe um sechs abgeschlossen.',
        'Das Murmeltier war in der Vitrine.',
        'Der Alarm hat mich um zehn nach drei geweckt.'
      ], luege: -1 },
    { name: 'Herr Kunz', rolle: 'Nachtwächter', bild: 'kunz',
      aussagen: [
        'Ich mache jede Stunde eine Runde.',
        'Um drei war noch alles in Ordnung.',
        'Der Täter kam mit der Leiter durchs Fenster.'
      ], luege: 2,
      warum: 'Das Fenster wurde von innen geöffnet. Eingestiegen ist niemand.' },
    { name: 'Frau Beeler', rolle: 'Restauratorin', bild: 'beeler',
      aussagen: [
        'Ich habe bis acht im Depot gearbeitet.',
        'Mein roter Schal hängt seit Wochen im Büro.',
        'Ich habe niemanden mehr gesehen.'
      ], luege: -1 }
  ],

  verdaechtige: [
    { id: 'v1', name: 'Herr Kunz',   bild: 'kunz',   werte: { abdruck: 'Wirbel', wolle: 'rot',  schluessel: 'ja' } },
    { id: 'v2', name: 'Frau Rüegg',  bild: 'rueegg', werte: { abdruck: 'Bogen',  wolle: 'rot',  schluessel: 'ja' } },
    { id: 'v3', name: 'Frau Beeler', bild: 'beeler', werte: { abdruck: 'Wirbel', wolle: 'rot',  schluessel: 'nein' } },
    { id: 'v4', name: 'Herr Ammann', bild: 'ammann', werte: { abdruck: 'Wirbel', wolle: 'nein', schluessel: 'ja' } }
  ],
  merkmalIcons: { abdruck: 'fingerabdruck', wolle: 'haar', schluessel: 'schluessel' },

  lineup: [
    { feld: 'abdruck', icon: 'fingerabdruck', label: 'Wirbel',
      frage: 'Wer hat ein anderes Muster?',
      raus: ['v2'], warum: 'Frau Rüegg hat einen Bogen.' },
    { feld: 'wolle', icon: 'haar', label: 'rot',
      frage: 'Wer hat keine rote Wolle?',
      raus: ['v4'], warum: 'Herr Ammann besitzt nichts aus roter Wolle.' },
    { feld: 'schluessel', icon: 'schluessel', label: 'ja',
      frage: 'Wer hat keinen Schlüssel?',
      raus: ['v3'], warum: 'Frau Beeler hätte die Vitrine aufbrechen müssen.' }
  ],

  taeter: 'v1',
  aufloesung: [
    'Herr Kunz hat die Leiter erst nachher ans Fenster gestellt.',
    'Er dachte, das Museum wolle das Murmeltier verkaufen.',
    'Es bleibt im Museum. Eine gute Absicht bleibt trotzdem Diebstahl.'
  ],
  wusstest: { icon: 'handschuh', titel: 'Weisse Anzüge',
    text: 'Die Spurensicherung trägt Anzug, Handschuhe und Maske, damit sie keine eigenen Haare und Fingerabdrücke am Tatort hinterlässt.' }
},

/* ============================ FALL 5 — Finale ============================ */
{
  id: 'f5', nr: 5,
  titel: 'Wo ist Rösti?',
  ort: 'Waldrand',
  schwierigkeit: 5,
  szene: 'wald',
  bild: 'assets/img/tatort-5.webp',
  licht: 'lupe',
  phasen: ['tatort', 'verfolgung', 'labor', 'zeugen', 'lineup', 'verhaftung'],

  intro: {
    text: 'Rösti ist weg. Die Leine hängt leer am Baum.',
    fakten: [
      { icon: 'uhr', text: 'Zehn Minuten allein' },
      { icon: 'farbe', text: '31 Grad, pralle Sonne' },
      { icon: 'kruemel', text: 'Geht mit, wer Guetzli hat' }
    ]
  },

  spuren: [
    { id: 's1', icon: 'pfote', x: 0.42, y: 0.80, name: 'Pfotenabdruck',
      sagt: 'Die Spur führt zum Dorf, nicht in den Wald.' },
    { id: 's2', icon: 'schluessel', x: 0.30, y: 0.42, name: 'Die Leine',
      sagt: 'Nicht zerrissen. Jemand hat den Karabiner geöffnet.' },
    { id: 's3', icon: 'kruemel', x: 0.20, y: 0.68, name: 'Guetzli-Krümel',
      sagt: 'Hundeguetzli. Die Person kennt sich mit Hunden aus.' },
    { id: 's4', icon: 'schuh', x: 0.60, y: 0.853, name: 'Schuhabdruck',
      sagt: 'Ein Wellenmuster im weichen Boden.' }
  ],

  verfolgung: {
    text: 'Folge Röstis Pfoten!',
    referenz: { art: 'tierspur', v: 'hundGross' },
    schritte: [
      { links: { art: 'tierspur', v: 'hundGross' }, rechts: { art: 'tierspur', v: 'katze' },     richtig: 'links' },
      { links: { art: 'tierspur', v: 'vogel' },     rechts: { art: 'tierspur', v: 'hundGross' }, richtig: 'rechts' },
      { links: { art: 'tierspur', v: 'hundKlein' }, rechts: { art: 'tierspur', v: 'hundGross' }, richtig: 'rechts' }
    ],
    ziel: 'Die Pfoten führen bis zu einem Gartentor im Dorf.'
  },

  labor: [
    { typ: 'vergleich', frage: 'Welche Sohle passt zum Abdruck?',
      probe: { art: 'sohle', v: 'wellen', label: 'Vom Waldrand' },
      optionen: [
        { id: 'a', art: 'sohle', v: 'stollen',  label: 'A' },
        { id: 'b', art: 'sohle', v: 'wellen',   label: 'B' },
        { id: 'c', art: 'sohle', v: 'zickzack', label: 'C' },
        { id: 'd', art: 'sohle', v: 'raster',   label: 'D' }
      ],
      richtig: 'b',
      ergebnis: 'Wellensohle.' }
  ],

  zeugen: [
    { name: 'Frau Hübscher', rolle: 'Nachbarin', bild: 'huebscher',
      aussagen: [
        'Ich war den ganzen Nachmittag im Garten.',
        'Einen Hund habe ich überhaupt nicht gesehen.',
        'Gestern habe ich Hundefutter gekauft, für die Nachbarskatze.'
      ], luege: 2,
      warum: 'Hundefutter für eine Katze? Katzen fressen kein Hundefutter.' },
    { name: 'Luis', rolle: 'Jogger', bild: 'luis',
      aussagen: [
        'Ich bin um Viertel vor vier vorbeigejoggt.',
        'Der Hund lag in der Sonne und hat gehechelt.',
        'Er hat mir leidgetan, aber ich bin weitergelaufen.'
      ], luege: -1 },
    { name: 'Herr Sutter', rolle: 'Förster', bild: 'sutter',
      aussagen: [
        'Um vier war ich beim Forsthaus.',
        'Der Wachtmeister war völlig aufgelöst.',
        'Im Wald war kein Hund. Ich habe alles abgesucht.'
      ], luege: -1 }
  ],

  verdaechtige: [
    { id: 'v1', name: 'Frau Hübscher', bild: 'huebscher', werte: { sohle: 'Wellen',  guetzli: 'ja',   ort: 'Dorf' } },
    { id: 'v2', name: 'Luis',          bild: 'luis',      werte: { sohle: 'Stollen', guetzli: 'nein', ort: 'Dorf' } },
    { id: 'v3', name: 'Frau Egli',     bild: 'egli',      werte: { sohle: 'Wellen',  guetzli: 'ja',   ort: 'Zug' } },
    { id: 'v4', name: 'Herr Sutter',   bild: 'sutter',    werte: { sohle: 'Wellen',  guetzli: 'nein', ort: 'Wald' } }
  ],
  merkmalIcons: { sohle: 'schuh', guetzli: 'kruemel', ort: 'pfote' },

  lineup: [
    { feld: 'sohle', icon: 'schuh', label: 'Wellen',
      frage: 'Wer hat andere Schuhe?',
      raus: ['v2'], warum: 'Luis joggt mit Stollensohlen.' },
    { feld: 'guetzli', icon: 'kruemel', label: 'ja',
      frage: 'Wer hatte keine Guetzli dabei?',
      raus: ['v4'], warum: 'Herr Sutter füttert im Wald grundsätzlich nichts.' },
    { feld: 'ort', icon: 'pfote', label: 'Dorf',
      frage: 'Wer war nicht im Dorf?',
      raus: ['v3'], warum: 'Frau Egli sass im Zug nach Bern.' }
  ],

  taeter: 'v1',
  aufloesung: [
    'Frau Hübscher hat Rösti mitgenommen. Er lag in der prallen Sonne.',
    'Er sitzt wohlauf in ihrem Garten, mit vollem Wassernapf.',
    'Sie hätte 117 anrufen müssen, statt ihn einfach mitzunehmen.'
  ],
  wusstest: { icon: 'pfote', titel: 'Tier in Not',
    text: 'Nimm ein fremdes Tier nie einfach mit. Melde es der Polizei unter 117 oder beim Fundbüro.' }
}

];

export const RANG_TEXTE = {
  'Anwärter:in': 'Ein Fall reicht schon für die Beförderung.',
  'Spürnase': 'Du findest Spuren, die andere übersehen.',
  'Wachtmeister:in': 'Du arbeitest sauber und liest Aussagen genau.',
  'Inspektor:in': 'Du kombinierst wie eine Profi-Ermittlerin.',
  'Chefinspektor:in': 'Alle Fälle gelöst. Bärenmoos schläft ruhig.'
};
