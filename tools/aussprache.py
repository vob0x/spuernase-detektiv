#!/usr/bin/env python3
"""Aussprachewörterbuch für die Vertonung.

Piper lautet Text über espeak-ng ein. Dessen deutsche Regeln stolpern über
Schweizer Wörter, Lehnwörter und Notrufnummern. Das fällt beim Hören sofort
auf: «Znüni» wird zu «Zett-Nüni», weil espeak das Z als Buchstabennamen liest.

Zwei Ebenen greifen ineinander:

1. TEXT   – ersetzt vor dem Einlauten, wo schon die Schreibweise das Problem
            ist (Notrufnummern ziffernweise, Gender-Doppelpunkt).
2. LAUTE  – ersetzt danach direkt in der Lautschrift. Das ist genauer als jede
            Ersatzschreibweise: «Tsnüni» hätte espeak wieder buchstabiert.

Geprüft wird beides von tools/aussprachetest.py: für jeden Eintrag muss die
falsche Lautfolge verschwunden und die richtige vorhanden sein.
"""
import re
import unicodedata

# ---------------------------------------------------------------- Textebene

TEXT = [
    # Notrufnummern spricht man ziffernweise, nicht als Zahl.
    (r'\b117\b', 'eins eins sieben'),
    (r'\b118\b', 'eins eins acht'),
    (r'\b144\b', 'eins vier vier'),
    # Gender-Doppelpunkt: sonst entsteht eine Pause und «Anwärter in».
    (r'([A-Za-zÄÖÜäöüß]):in\b', r'\1in'),
    (r'([A-Za-zÄÖÜäöüß]):innen\b', r'\1innen'),
    # Halbgeviertstrich zwischen Uhrzeiten als «bis» lesen.
    (r'(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})', r'\1 bis \2'),
]

# ---------------------------------------------------------------- Lautebene
# Reihenfolge zählt: längere Muster zuerst, sonst frisst ein kurzes Muster
# den Anfang eines längeren weg.

LAUTE = [
    # --- Schweizer Wörter ---
    # «Znüni»: espeak liest das Z als Buchstabennamen «Zett».
    ('tsˈɛtnˈyːniː',      'tsnˈyːni'),
    # «Guetzli»: espeak trennt «Gu-etsli» und betont die zweite Silbe.
    ('hˌʊndeːɡuːˈɛtsliː', 'hˈʊndəɡˌuːtsli'),
    ('ɡuːˈɛtsliː',        'ɡˈuːtsli'),
    # «Rösti»: offenes kurzes ö und langes Schluss-i sind beide falsch.
    ('rˈœstɪs',           'rˈøːstis'),
    ('rˈœstiː',           'rˈøːsti'),
    # «Velo» verliert im Kompositum seinen Vokal.
    ('rˈɛnvəlˌoː',        'rˈɛnvˌeːloː'),

    # --- Namen ---
    ('lˈiːviːˌɑː',        'lˈiːvɪa'),          # Livia, nicht «Liwi-Ah»
    ('dˈeːtɛktˌɪvbyːrˌoː', 'detɛktˈiːfbyrˌoː'),  # Betonung auf «-tiv-»

    # --- Deutsche Wörter, die espeak verhaut ---
    # («Fingerabdrücke» stand hier auch einmal – die Hörprobe hat gezeigt,
    #  dass espeaks eigene Lautung besser verstanden wird als die Korrektur.)
    ('fˈɔɾstaʊs',         'fˈɔɾsthˌaʊs'),      # Forsthaus: das h fehlte
    ('kˈɑpuːtsə',         'kapˈuːtsə'),        # Kapuze, Betonung
    ('krˌyːməlspˈuːɾ',    'krˈyːməlʃpˌuːɾ'),   # Krümelspur: s-p statt sch-p
    ('ʃpˌuːrɛnzˈɪçərˌʊŋ', 'ʃpˈuːrənzˌɪçərʊŋ'), # Spurensicherung, Betonung
    ('ɛɾrˈaɪkst',         'ɛɾrˈaɪçst'),        # erreichst: ch war zu k geworden
    ('dˈʊɐks',            'dˈʊɐçs'),           # durchs: ch fehlte ganz

    # --- Englische Lehnwörter ---
    ('ɡəʃprˈaɪt',         'ɡəʃprˈeːt'),        # gesprayt
    ('ʃprˈaɪən',          'ʃprˈeːən'),         # sprayen
    ('jˌɔkt',             'dʒˌɔkt'),           # gejoggt

    # --- Dunkles a: espeak nimmt /ɑː/, im Deutschen ist es /aː/ ---
    ('nˈɔxmɑːl',          'nˈɔxmaːl'),
    ('nˈaxmɪtˌɑːk',       'nˈaxmɪtˌaːk'),
    ('nˈɑːx',             'nˈaːx'),
    ('ʃˈɑːl',             'ʃˈaːl'),
    ('tsˈɑːlt',           'tsˈaːlt'),
]


def text_vorbereiten(t: str) -> str:
    """Schreibweisen glätten, bevor der Text eingelautet wird."""
    for muster, ersatz in TEXT:
        t = re.sub(muster, ersatz, t)
    return t


def laute_korrigieren(p: str) -> str:
    """Falsche Lautfolgen durch richtige ersetzen.

    Zuerst wird zusammengesetzt: espeak liefert das «ch» in einem allein
    stehenden «ich» als c + Cedille-Zeichen statt als ç. Modelle mit kleinem
    Lautbestand kennen das Kombinationszeichen nicht, werfen es weg – und aus
    «ich» wird «ick»."""
    p = unicodedata.normalize('NFC', p)
    for falsch, richtig in LAUTE:
        p = p.replace(falsch, richtig)
    return p


def lauten(phonemizer, text: str):
    """Text -> Liste von Lautzeichen, mit beiden Korrekturstufen."""
    saetze = phonemizer.phonemize("de", text_vorbereiten(text))
    return [list(laute_korrigieren(''.join(s))) for s in saetze]
