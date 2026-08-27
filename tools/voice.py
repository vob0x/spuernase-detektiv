#!/usr/bin/env python3
"""Vertont alle Spieltexte mit Piper und legt sie als MP3 ab.
Aufruf:  python3 tools/voice.py [--nur ID-Praefix]"""
import json, os, subprocess, sys, hashlib

STIMMEN = "/home/claude/voices"
THOR = f"{STIMMEN}/de_DE-thorsten-high.onnx"
MLS  = f"{STIMMEN}/de_DE-mls-medium.onnx"
ZIEL = "assets/voice"

# Rolle -> (Modell, Sprecher-ID, Tonhoehe, Tempo)
CAST = {
    'erzaehler':  (THOR, None, 1.00, 1.00),
    'zaugg':      (MLS,   22, 1.00, 1.00),
    'livia':      (MLS,   15, 1.12, 1.00),
    'ruben':      (MLS,  140, 1.16, 1.02),
    'nora':       (MLS,  120, 1.10, 1.00),
    'baertschi':  (MLS,   31, 1.00, 0.98),
    'steiner':    (MLS,   55, 1.00, 1.00),
    'selina':     (MLS,   15, 1.08, 1.00),
    'timo':       (MLS,  140, 1.12, 1.02),
    'mira':       (MLS,   40, 1.06, 1.00),
    'aaron':      (MLS,   70, 1.12, 1.02),
    'nina':       (MLS,  120, 1.04, 1.00),
    'odermatt':   (MLS,   40, 1.00, 1.00),
    'kevin':      (MLS,   70, 1.04, 1.00),
    'frei':       (MLS,   88, 1.00, 0.98),
    'jill':       (MLS,   15, 1.00, 1.00),
    'dario':      (MLS,  140, 1.06, 1.00),
    'enia':       (MLS,  120, 1.00, 1.00),
    'rueegg':     (MLS,   31, 1.00, 1.00),
    'kunz':       (MLS,  101, 1.00, 0.98),
    'beeler':     (MLS,   40, 1.00, 1.00),
    'ammann':     (MLS,   22, 1.00, 1.00),
    'huebscher':  (MLS,   31, 0.97, 0.95),
    'luis':       (MLS,   70, 1.00, 1.04),
    'sutter':     (MLS,   88, 1.00, 0.97),
    'egli':       (MLS,  120, 1.00, 1.00),
}

def zeilen():
    faelle = json.load(open('/tmp/cases.json'))
    L = []
    def add(i, t, r='erzaehler'):
        t = ' '.join(str(t).split())
        if t: L.append((i, t, r))

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
        'g-hinweis-oben': 'Rösti bellt. Schau weiter oben.',
        'g-hinweis-unten': 'Rösti bellt. Schau weiter unten.',
        'g-hinweis-links': 'Rösti bellt. Schau nach links.',
        'g-hinweis-rechts': 'Rösti bellt. Schau nach rechts.',
        'g-zeuge': 'Eine Aussage kann nicht stimmen. Welche?',
        'g-erwischt': 'Erwischt.',
        'g-weiter': 'Weiter geht es.',
    }
    for i, t in global_.items():
        add(i, t)
    return L

def bauen(nur=None):
    os.makedirs(ZIEL, exist_ok=True)
    L = zeilen()
    if nur:
        L = [x for x in L if x[0].startswith(nur)]
    stand = {}
    if os.path.exists('tools/voice.lock'):
        stand = json.load(open('tools/voice.lock'))
    neu = 0
    for i, (vid, text, rolle) in enumerate(L):
        modell, spk, hoehe, tempo = CAST.get(rolle, CAST['erzaehler'])
        sig = hashlib.sha1(f"{text}|{rolle}|{modell}|{spk}|{hoehe}|{tempo}".encode()).hexdigest()[:12]
        ziel = f"{ZIEL}/{vid}.mp3"
        if stand.get(vid) == sig and os.path.exists(ziel):
            continue
        cmd = ['piper', '-m', modell, '-f', '/tmp/_v.wav']
        if spk is not None:
            cmd += ['-s', str(spk)]
        subprocess.run(cmd, input=text.encode(), stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL, check=True)
        af = []
        if abs(hoehe - 1.0) > 0.001:
            af.append(f"asetrate=22050*{hoehe},aresample=22050,atempo={round(1/hoehe,4)}")
        if abs(tempo - 1.0) > 0.001:
            af.append(f"atempo={tempo}")
        af.append("highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11")
        # MP3, nicht AAC: MP3 spielt jedes Ziel-Geraet und jeder Browser ab,
        # AAC fehlt in quelloffenen Chromium-Builds und laesst sich hier nicht pruefen.
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/_v.wav',
                        '-af', ','.join(af), '-c:a', 'libmp3lame', '-b:a', '48k',
                        '-ar', '24000', '-ac', '1', ziel], check=True)
        stand[vid] = sig
        neu += 1
        if neu % 15 == 0:
            print(f"  {neu} vertont ...", flush=True)
    json.dump(stand, open('tools/voice.lock', 'w'), indent=0)

    ids = sorted(x[0] for x in zeilen())
    with open('js/voice-liste.js', 'w', encoding='utf-8') as fh:
        fh.write("/* Erzeugt von tools/voice.py. Nicht von Hand ändern. */\n")
        fh.write("export const STIMMEN = " + json.dumps(ids, ensure_ascii=False, indent=0) + ";\n")
    groesse = sum(os.path.getsize(f"{ZIEL}/{x}") for x in os.listdir(ZIEL))
    print(f"fertig: {len(ids)} Aufnahmen, {neu} neu, {groesse//1024} KB gesamt")

if __name__ == '__main__':
    nur = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--nur' else None
    bauen(nur)
