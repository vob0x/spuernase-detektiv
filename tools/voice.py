#!/usr/bin/env python3
"""Vertont alle Spieltexte mit Piper und legt sie als MP3 ab.

Aufruf:  python3 tools/voice.py [--nur ID-PRAEFIX] [--neu]

Warum es so gebaut ist, wie es gebaut ist:

* **Aussprache.** espeak-ng, das Piper zum Einlauten benutzt, stolpert über
  Schweizer Wörter. «Znüni» wurde zu «Zett-Nüni». Deshalb läuft jeder Text
  durch tools/aussprache.py – erst über eine Textregel, dann über eine
  Korrektur direkt in der Lautschrift. Geprüft von tools/aussprachetest.py.

* **Stimmen.** Für Deutsch gibt es bei Piper genau eine wirklich gute Stimme
  (thorsten-high) und eine brauchbare weibliche (eva_k). Das früher benutzte
  Modell mls-medium hat 236 Sprecher, aber schlechte Qualität: im Hörtest
  wurden 81 % der Figurenzeilen nicht mehr verstanden. Es ist ersetzt.

* **Tonhöhe.** Verschiebungen laufen über rubberband mit erhaltenen Formanten.
  Die alte Methode (asetrate) verschob die Formanten mit und klang gepresst;
  im Messlauf fiel die Verständlichkeit dabei von 1,00 auf 0,88.

* **Lebendigkeit.** Wer nur auf Verständlichkeit optimiert, landet bei einer
  flachen Stimme – die ist am leichtesten zu erkennen. Deshalb bekommt jede
  Zeile eine Regieanweisung (tools/regie.py): Färbung, Tempo, Lautheit und
  Tonhöhe richten sich danach, was gerade passiert. Gemessen mit
  tools/lebendigkeit.py.

Zwei Messungen halten sich gegenseitig in Schach: tools/hoerprobe.py prüft,
ob man es versteht, tools/lebendigkeit.py, ob es lebt.
"""
import hashlib, json, os, subprocess, sys, wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aussprache import text_vorbereiten, laute_korrigieren
from regie import anweisung, text_faerben, situation

STIMMEN = "/home/claude/voices"
HIGH = f"{STIMMEN}/de_DE-thorsten-high.onnx"           # männlich, beste Qualität
EMO  = f"{STIMMEN}/de_DE-thorsten_emotional-medium.onnx"  # derselbe Sprecher, 8 Färbungen
EVA  = f"{STIMMEN}/de_DE-eva_k-x_low.onnx"             # weiblich, x_low – ungenutzt
ZIEL = "assets/voice"

# Färbungen des emotional-Modells
AMUSED, ANGRY, DISGUSTED, DRUNK, NEUTRAL, SLEEPY, SURPRISED, WHISPER = range(8)

# Rolle -> (Modell, Sprecher, Tonhöhe)
#
# Ausgewählt mit einem Messlauf: derselbe Satz durch jede Einstellung, danach
# von einem Spracherkenner abgehört. Über fünf kurze Zeugensätze gemittelt:
#
#   emo amused +12 %  0,97      high roh          0,82
#   emo surprised     0,93      eva_k +/- 4 %     0,76
#   emo neutral       0,92      eva_k roh         0,76
#   emo sleepy        0,91      eva_k Tempo 0,95  0,70
#   high  -6 %        0,89      mls-medium        0,72
#
# Daraus drei Regeln:
#   * eva_k (Qualitätsstufe x_low) trägt keine Rolle mehr – zu unsauber.
#   * Tempoänderungen kosten immer Verständlichkeit und entfallen ganz.
#   * Tonhöhe nur über rubberband mit erhaltenen Formanten, höchstens 18 %.
#
# Die Figuren klingen damit alle nach demselben Sprecher in verschiedenen
# Färbungen. Für Deutsch gibt es bei Piper keine zweite gute Stimme; wer echte
# Vielfalt will, muss die 135 Zeilen von Menschen einsprechen lassen.
CAST = {
    # Der Erzähler läuft über das Färbungsmodell, nicht über thorsten-high:
    # nur so lässt sich der Tonfall je Situation wechseln. Die Färbung setzt
    # nicht die Besetzung, sondern die Regie (tools/regie.py) pro Zeile.
    'erzaehler':  (EMO,  None,      1.00),

    # Frauen – helle Färbung, unterschiedlich hoch
    'odermatt':   (EMO,  AMUSED,    1.08),
    'rueegg':     (EMO,  AMUSED,    1.10),
    'beeler':     (EMO,  AMUSED,    1.12),
    'huebscher':  (EMO,  AMUSED,    1.06),
    'egli':       (EMO,  AMUSED,    1.13),
    'nina':       (EMO,  AMUSED,    1.11),
    'jill':       (EMO,  AMUSED,    1.15),
    'enia':       (EMO,  AMUSED,    1.09),
    'nora':       (EMO,  AMUSED,    1.14),
    'livia':      (EMO,  AMUSED,    1.16),
    'selina':     (EMO,  AMUSED,    1.12),
    'mira':       (EMO,  AMUSED,    1.07),
    'baertschi':  (EMO,  NEUTRAL,   1.05),
    'steiner':    (EMO,  SURPRISED, 1.04),
    'ammann':     (EMO,  NEUTRAL,   1.02),

    # Männer – dunkler, über Färbung unterschieden
    'kunz':       (HIGH, None,      0.94),
    'sutter':     (EMO,  SLEEPY,    0.96),
    'frei':       (EMO,  NEUTRAL,   0.97),
    'zaugg':      (EMO,  SURPRISED, 0.98),

    # Kinder – höchste geprüfte Anhebung
    'kevin':      (EMO,  AMUSED,    1.17),
    'luis':       (EMO,  AMUSED,    1.18),
    'ruben':      (EMO,  AMUSED,    1.16),
    'timo':       (EMO,  AMUSED,    1.18),
    'dario':      (EMO,  AMUSED,    1.15),
    'aaron':      (EMO,  AMUSED,    1.17),
}


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


def modell(pfad):
    if pfad not in _modelle:
        from piper import PiperVoice
        _modelle[pfad] = PiperVoice.load(pfad)
    return _modelle[pfad]


def sprechen(V, text, sprecher, tempo=1.0, rhythmus=1.0, ausdruck=None):
    """Text einlauten, Aussprache korrigieren, Audio erzeugen.

    tempo   – length_scale, grösser heisst langsamer.
    rhythmus – noise_w_scale, grösser heisst ungleichmässigere Silbenlängen.
               Beides kommt aus der Regieanweisung für diese Zeile."""
    from piper import SynthesisConfig
    cfg = SynthesisConfig(normalize_audio=True, speaker_id=sprecher,
                          length_scale=tempo, noise_w_scale=rhythmus,
                          noise_scale=ausdruck)

    saetze = V.phonemize(text_vorbereiten(text))
    stuecke = []
    for laute in saetze:
        laute = list(laute_korrigieren(''.join(laute)))
        if not laute:
            continue
        ids = V.phonemes_to_ids(laute)
        a = V.phoneme_ids_to_audio(ids, cfg)
        if isinstance(a, tuple):
            a = a[0]
        stuecke.append(np.asarray(a, dtype=np.float32))
        stuecke.append(np.zeros(int(V.config.sample_rate * 0.12), dtype=np.float32))
    if not stuecke:
        return np.zeros(1, dtype=np.float32)
    return np.concatenate(stuecke)


def wav_schreiben(pfad, audio, rate):
    x = np.clip(audio, -1, 1)
    if np.max(np.abs(x)) > 1e-6:
        x = x / np.max(np.abs(x)) * 0.97
    with wave.open(pfad, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def bauen(nur=None, alles_neu=False):
    os.makedirs(ZIEL, exist_ok=True)
    L = zeilen()
    if nur:
        L = [x for x in L if x[0].startswith(nur)]

    stand = {}
    sperre = 'tools/voice.lock'
    if os.path.exists(sperre) and not alles_neu:
        stand = json.load(open(sperre))

    neu = 0
    for vid, text, rolle in L:
        mod, spk, hoehe = CAST.get(rolle, CAST['erzaehler'])
        sig = hashlib.sha1(
            f"{text}|{rolle}|{mod}|{spk}|{hoehe}|{anweisung(vid, rolle)}|v9".encode()).hexdigest()[:12]
        ziel = f"{ZIEL}/{vid}.mp3"
        if stand.get(vid) == sig and os.path.exists(ziel):
            continue

        faerbung, tempo, laut, hoehe_r, rhythmus, ausdruck = anweisung(vid, rolle)
        # Rollen mit eigener Färbung behalten sie – sonst klänge jede Figur
        # in jeder Situation anders und wäre nicht mehr wiederzuerkennen.
        sprecher = spk if spk is not None else (faerbung if mod == EMO else None)

        V = modell(mod)
        audio = sprechen(V, text_faerben(vid, text), sprecher, tempo, rhythmus, ausdruck)
        wav_schreiben('/tmp/_v.wav', audio, V.config.sample_rate)

        af = []
        gesamt = hoehe * hoehe_r
        if abs(gesamt - 1.0) > 0.001:
            # Formanten bleiben stehen: die Stimme wird höher, nicht gepresst.
            af.append(f"rubberband=pitch={gesamt:.4f}:formant=preserved")
        af.append(f"highpass=f=70,loudnorm=I={laut}:TP=-1.5:LRA=11")

        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/_v.wav',
                        '-af', ','.join(af), '-c:a', 'libmp3lame', '-b:a', '64k',
                        '-ar', '22050', '-ac', '1', ziel], check=True)
        stand[vid] = sig
        neu += 1
        if neu % 15 == 0:
            print(f"  {neu} vertont ...", flush=True)

    json.dump(stand, open(sperre, 'w'), indent=0)

    ids = sorted(x[0] for x in zeilen())
    with open('js/voice-liste.js', 'w', encoding='utf-8') as fh:
        fh.write("/* Erzeugt von tools/voice.py. Nicht von Hand ändern. */\n")
        fh.write("export const STIMMEN = " + json.dumps(ids, ensure_ascii=False, indent=0) + ";\n")
    groesse = sum(os.path.getsize(f"{ZIEL}/{x}") for x in os.listdir(ZIEL))
    print(f"fertig: {len(ids)} Aufnahmen, {neu} neu, {groesse // 1024} KB gesamt")


if __name__ == '__main__':
    a = sys.argv[1:]
    nur = a[a.index('--nur') + 1] if '--nur' in a else None
    bauen(nur, alles_neu='--neu' in a)
