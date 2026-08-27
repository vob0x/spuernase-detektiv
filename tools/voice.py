#!/usr/bin/env python3
"""Vertont alle Spieltexte mit Gemini TTS und legt sie als MP3 ab.

Aufruf:  python3 tools/voice.py [--nur ID-PRAEFIX] [--neu]
Braucht einen Gemini-API-Schlüssel in der Datei, auf die GEMINI_KEY zeigt
(Vorgabe /tmp/.gk). Der Schlüssel steht nirgends im Projekt.

Warum Gemini und nicht mehr Piper:

* **Lebendigkeit.** Piper kam über einen Tonumfang von 3,64 Halbtönen nicht
  hinaus, Gemini liegt bei 7,12 – im Messlauf über dieselben Sätze. Und das
  ohne Verlust an Verständlichkeit: die Hörprobe fiel bei Piper bei 27 % der
  Aufnahmen durch, bei Gemini bei 8 %.

* **Aussprache.** «Znüni» und «Rösti» sitzen auf Anhieb. Bei Piper brauchte
  es dafür einen Eingriff direkt in der Lautschrift, weil espeak /tsn/ am
  Wortanfang nicht bilden kann. Das Wörterbuch (tools/aussprache.py) bleibt
  liegen, wird hier aber nicht mehr gebraucht.

* **Besetzung.** 30 Stimmen statt eines Sprechers mit acht Färbungen. Welche
  Stimme männlich und welche weiblich ist, steht in keiner Dokumentation und
  ist am Namen nicht zu erkennen – «Puck» klingt nach Kobold und ist ein
  Mann. Die Besetzung unten ist deshalb eingemessen: Grundton **und**
  Formanten, letztere weil im Bereich 150–175 Hz eine hohe Männer- und eine
  tiefe Frauenstimme sonst nicht zu trennen sind.

Was Gemini schlechter kann:

* Es spricht gelegentlich die Regieanweisung mit («Neugierig fragend? Wer hat
  andere Schuhe?»). Jede Aufnahme wird deshalb abgehört und bei Bedarf
  wiederholt – siehe pruefen() weiter unten.
* Es ist ein Vorschaumodell ohne Zusicherung. Ein Neubau in einem Jahr kann
  anders klingen. Die fertigen MP3 sind davon nicht betroffen.

Zwei Messungen halten sich gegenseitig in Schach: tools/hoerprobe.py prüft,
ob man es versteht, tools/lebendigkeit.py, ob es lebt.
"""
import base64, hashlib, json, os, struct, subprocess, sys, time, urllib.error, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from regie import anweisung, text_faerben, situation, REGIEWORTE

ZIEL = "assets/voice"
MODELL = os.environ.get('GEMINI_MODELL', 'gemini-3.1-flash-tts-preview')
SCHLUESSELDATEI = os.environ.get('GEMINI_KEY', '/tmp/.gk')

# Rolle -> Gemini-Stimme.
#
# Eingemessen, nicht nach Namen geraten: derselbe neutrale Satz durch alle 30
# Stimmen, danach Grundton und Formanten gemessen. Die Formanten entscheiden
# im Grenzbereich, weil sie die Länge des Ansatzrohrs zeigen und nicht von der
# Tonhöhe abhängen. Ergebnis: 14 männlich, 15 weiblich, 1 Grenzfall.
#
#   Stimme          Grundton   F3     Lage
#   Iapetus            126    2746    männlich   – Erzähler, klar
#   Rasalgethi         139    2746    männlich
#   Algenib            129    2508    männlich   – rau
#   Alnilam            110    2713    männlich   – fest
#   Gacrux             152    2958    weiblich   – reif
#   Kore               171    2909    weiblich   – fest
#   Callirrhoe         169    2951    weiblich   – gelassen
#   Vindemiatrix       163    2880    weiblich   – sanft
#   Fenrir             193    3032    weiblich   – aufgeregt
#   Leda               181    3057    weiblich   – jugendlich
#
# Gemini hat keine Kinderstimmen. Für Kevin und Luis übernimmt eine helle
# Stimme die Rolle und bekommt das Alter als Regieanweisung mit (regie.FIGUR);
# das ist beim Synchronisieren von Kinderrollen das übliche Vorgehen.
CAST = {
    'erzaehler':  'Iapetus',       # trägt 108 der 135 Zeilen

    # Erwachsene Frauen
    'odermatt':   'Gacrux',        # Ladenbesitzerin, reif
    'rueegg':     'Kore',
    'beeler':     'Callirrhoe',
    'huebscher':  'Vindemiatrix',
    'egli':       'Achernar',

    # Erwachsene Männer
    'frei':       'Rasalgethi',
    'kunz':       'Alnilam',
    'sutter':     'Algenib',       # Förster, raue Stimme
    'ammann':     'Umbriel',

    # Jungen – helle Stimme plus Altersanweisung
    'kevin':      'Fenrir',
    'luis':       'Leda',
    'ruben':      'Zephyr',
    'timo':       'Sulafat',
    'dario':      'Despina',
    'aaron':      'Autonoe',

    # Mädchen
    'nina':       'Erinome',
    'jill':       'Aoede',
    'enia':       'Laomedeia',
    'nora':       'Schedar',
    'livia':      'Achernar',
    'selina':     'Kore',
    'mira':       'Callirrhoe',
    'baertschi':  'Gacrux',
    'steiner':    'Vindemiatrix',
    'zaugg':      'Charon',
}

_schluessel = None


def schluessel():
    global _schluessel
    if _schluessel is None:
        if not os.path.exists(SCHLUESSELDATEI):
            sys.exit(f"Kein Gemini-Schlüssel unter {SCHLUESSELDATEI}. "
                     f"Pfad über GEMINI_KEY setzen.")
        _schluessel = open(SCHLUESSELDATEI).read().strip()
    return _schluessel


def sprechen(text, stimme, regie):
    """Eine Zeile synthetisieren. Gibt (PCM-Bytes, Abtastrate) zurück."""
    koerper = json.dumps({
        "contents": [{"parts": [{"text": f'{regie}: "{text}"'}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": stimme}}},
        },
    }).encode()
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{MODELL}:generateContent?key={schluessel()}",
        data=koerper, headers={'Content-Type': 'application/json'})
    d = json.load(urllib.request.urlopen(req, timeout=180))
    teil = d['candidates'][0]['content']['parts'][0]['inlineData']
    rate = 24000
    for stueck in teil['mimeType'].split(';'):
        if stueck.strip().startswith('rate='):
            rate = int(stueck.strip()[5:])
    return base64.b64decode(teil['data']), rate


def wav_schreiben(pfad, pcm, rate):
    with open(pfad, 'wb') as f:
        f.write(b'RIFF' + struct.pack('<I', 36 + len(pcm)) + b'WAVEfmt ')
        f.write(struct.pack('<IHHIIHH', 16, 1, 1, rate, rate * 2, 2, 16))
        f.write(b'data' + struct.pack('<I', len(pcm)) + pcm)


_erkenner = None


def pruefen(pfad, sollte):
    """Hört die frische Aufnahme ab. Liefert (Güte 0..1, gehört).

    Der eine Fehler, den Gemini regelmässig macht, ist die mitgesprochene
    Regieanweisung. Den fängt kein Blick auf die Datei, nur das Zuhören.
    """
    global _erkenner
    import difflib
    from hoerprobe import worte
    if _erkenner is None:
        from faster_whisper import WhisperModel
        _erkenner = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = _erkenner.transcribe(pfad, language="de", beam_size=5)
    gehoert = " ".join(s.text.strip() for s in segs)
    fremd = set(worte(gehoert)) - set(worte(sollte))
    if fremd & REGIEWORTE:
        return 0.0, f"Regie mitgesprochen: {gehoert}"

    # Zwei Masse, weil sie verschiedene Fehler sehen.
    #
    # Wortweise ist streng, straft aber die Tokenisierung des Erkenners ab:
    # «Zickzack-Sohle» kommt als «Zick zack Sohle» zurück – wortweise ein
    # Totalausfall, gesprochen völlig richtig.
    #
    # Buchstabenweise ist umgekehrt zu milde: «Röstis» gegen «Rustys» sind
    # 0,88, obwohl der Hund falsch heisst.
    #
    # Deshalb gilt eine Aufnahme nur als sauber, wenn eines der beiden Masse
    # deutlich hoch liegt – 0,85 wortweise oder 0,97 buchstabenweise. Sonst
    # wird wiederholt und am Ende der beste Versuch behalten.
    wort = difflib.SequenceMatcher(None, worte(sollte), worte(gehoert)).ratio()
    zeichen = difflib.SequenceMatcher(None, "".join(worte(sollte)),
                                      "".join(worte(gehoert))).ratio()
    if wort >= 0.85 or zeichen >= 0.97:
        return 1.0, gehoert
    return max(wort, zeichen) * 0.9, f"({wort:.2f}/{zeichen:.2f}): {gehoert}"


def faelle_lesen():
    """Die Fallakten aus js/cases.js holen – ohne Umweg über eine Datei,
    die jemand von Hand aktuell halten müsste."""
    js = ("import('./js/cases.js').then(m => "
          "console.log(JSON.stringify(m.FAELLE)))")
    out = subprocess.run(['node', '--input-type=module', '-e', js],
                         capture_output=True, cwd=os.getcwd(), check=True)
    return json.loads(out.stdout.decode('utf-8'))


def zeilen():
    faelle = faelle_lesen()
    L = []

    def add(i, t, r='erzaehler'):
        t = ' '.join(str(t).split())
        if t:
            L.append((i, t, r))

    for f in faelle:
        p = f['id']
        add(f"{p}-intro", f['intro']['text'])
        for s in f['spuren']:
            add(f"{p}-{s['id']}", s['sagt'])
        for k, l in enumerate(f.get('labor', [])):
            add(f"{p}-lab{k}-f", l['frage'])
            add(f"{p}-lab{k}-e", l['ergebnis'])
        if f.get('verfolgung'):
            add(f"{p}-verf-f", f['verfolgung']['text'])
            add(f"{p}-verf-z", f['verfolgung']['ziel'])
        if f.get('zeitstrahl'):
            add(f"{p}-zeit-f", f['zeitstrahl']['text'])
            add(f"{p}-zeit-w", f['zeitstrahl']['warum'])
        for zi, z in enumerate(f.get('zeugen', [])):
            for ai, a in enumerate(z['aussagen']):
                add(f"{p}-z{zi}-a{ai}", a, z['bild'])
            if z.get('warum'):
                add(f"{p}-z{zi}-w", z['warum'])
        for li, l in enumerate(f.get('lineup', [])):
            add(f"{p}-lin{li}-f", l['frage'])
            add(f"{p}-lin{li}-w", l['warum'])
        for ai, a in enumerate(f['aufloesung']):
            add(f"{p}-auf{ai}", a)
        add(f"{p}-wusst", f['wusstest']['titel'] + '. ' + f['wusstest']['text'])

    global_ = {
        'g-willkommen': 'Willkommen im Detektivbüro Bärenmoos. Wähle einen Fall.',
        'g-quer': 'Dreh dein Gerät quer.',
        'g-tatort': 'Zieh die Lupe über das Bild und such nach Spuren.',
        'g-dunkel': 'Es ist dunkel. Leuchte mit der Taschenlampe.',
        'g-alle': 'Alle Spuren gesichert. Ab ins Labor.',
        'g-richtig': 'Genau richtig.',
        'g-falsch': 'Nicht ganz. Schau nochmal.',
        'g-fastfalsch': 'Die Person passt zur Spur. Probier eine andere.',
        'g-lineup': 'Wer nicht passt, tritt zurück.',
        'g-verhaften': 'Wer bleibt übrig? Tippe die Person an.',
        'g-verhaftet': 'Fall gelöst. Sehr gute Arbeit.',
        'g-drei': 'Drei Sterne. Kein einziger Fehler.',
        'g-befoerdert': 'Du wirst befördert.',
        'g-hinweis-oben': 'Hörst du Rösti? Schau weiter oben.',
        'g-hinweis-unten': 'Hörst du Rösti? Schau weiter unten.',
        'g-hinweis-links': 'Hörst du Rösti? Schau nach links.',
        'g-hinweis-rechts': 'Hörst du Rösti? Schau nach rechts.',
        'g-zeuge': 'Eine Aussage kann nicht stimmen. Welche?',
        'g-erwischt': 'Erwischt.',
        'g-weiter': 'Weiter geht es.',
    }
    for i, t in global_.items():
        add(i, t)
    return L


# ------------------------------------------------------------ Synthese

_modelle = {}


def bauen(nur=None, alles_neu=False):
    os.makedirs(ZIEL, exist_ok=True)
    L = zeilen()
    if nur:
        L = [x for x in L if x[0].startswith(nur)]

    sperre = 'tools/voice.lock'
    stand = json.load(open(sperre)) if os.path.exists(sperre) and not alles_neu else {}

    neu = wiederholt = aufgegeben = offen = 0
    for vid, text, rolle in L:
        stimme = CAST.get(rolle, CAST['erzaehler'])
        regie = anweisung(vid, rolle)
        gesprochen = text_faerben(vid, text)
        sig = hashlib.sha1(
            f"{gesprochen}|{rolle}|{stimme}|{regie}|{MODELL}|g1".encode()).hexdigest()[:12]
        ziel = f"{ZIEL}/{vid}.mp3"
        if stand.get(vid) == sig and os.path.exists(ziel):
            continue

        # Bis zu vier Anläufe. Gemini ist nicht deterministisch: dieselbe Zeile
        # kam im Messlauf einmal als «Wellenzule» und einmal als «Wellensohle»
        # zurück. Der beste Versuch wird behalten, nicht der letzte – sonst
        # verschlechtert eine Wiederholung das Ergebnis.
        beste, bester_text = 0.0, None
        for versuch in range(4):
            try:
                pcm, rate = sprechen(gesprochen, stimme, regie)
            except Exception as e:
                print(f"  ! {vid}: {type(e).__name__}, Anlauf {versuch + 1}", flush=True)
                time.sleep(4)
                continue
            wav_schreiben('/tmp/_v.wav', pcm, rate)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/_v.wav',
                            '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11',
                            '-c:a', 'libmp3lame', '-b:a', '64k',
                            '-ar', '22050', '-ac', '1', '/tmp/_v.mp3'], check=True)
            guete, was = pruefen('/tmp/_v.mp3', gesprochen)
            if guete > beste:
                beste, bester_text = guete, was
                subprocess.run(['cp', '/tmp/_v.mp3', ziel], check=True)
            if guete >= 1.0:
                break
            wiederholt += 1
            print(f"  ~ {vid}: {was}", flush=True)

        if bester_text is None:
            aufgegeben += 1
            print(f"  ✗ {vid}: keine Antwort erhalten", flush=True)
        else:
            stand[vid] = sig
            neu += 1
            if beste < 1.0:
                offen += 1
                print(f"  · {vid} bleibt auffällig {bester_text}", flush=True)

        if neu and neu % 15 == 0:
            print(f"  {neu} vertont ...", flush=True)

    json.dump(stand, open(sperre, 'w'), indent=0)

    ids = sorted(x[0] for x in zeilen())
    with open('js/voice-liste.js', 'w', encoding='utf-8') as fh:
        fh.write("/* Erzeugt von tools/voice.py. Nicht von Hand ändern. */\n")
        fh.write("export const STIMMEN = " + json.dumps(ids, ensure_ascii=False, indent=0) + ";\n")
    groesse = sum(os.path.getsize(f"{ZIEL}/{x}") for x in os.listdir(ZIEL))
    print(f"fertig: {len(ids)} Aufnahmen, {neu} neu, {wiederholt} Wiederholungen, "
          f"{offen} bleiben auffällig, {aufgegeben} ohne Antwort, "
          f"{groesse // 1024} KB gesamt")
    return aufgegeben


if __name__ == '__main__':
    a = sys.argv[1:]
    nur = a[a.index('--nur') + 1] if '--nur' in a else None
    sys.exit(1 if bauen(nur, alles_neu='--neu' in a) else 0)
