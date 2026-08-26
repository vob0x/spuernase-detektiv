/* Fortschritt lokal im Browser. Kein Konto, keine Übertragung. */

const KEY = 'spuernase.v1';

const RAENGE = [
  { min: 0,  name: 'Anwärter:in',      icon: 'lupe' },
  { min: 2,  name: 'Spürnase',         icon: 'pfote' },
  { min: 5,  name: 'Wachtmeister:in',  icon: 'zettel' },
  { min: 9,  name: 'Inspektor:in',     icon: 'fingerabdruck' },
  { min: 13, name: 'Chefinspektor:in', icon: 'stempel' }
];

const leer = () => ({ sterne: {}, ton: true, musik: false, gesehen: false });

let data = leer();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = Object.assign(leer(), JSON.parse(raw));
  } catch (e) { data = leer(); }
  return data;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}

export function get() { return data; }

export function sterneFuer(id) { return data.sterne[id] || 0; }

export function setSterne(id, n) {
  if (n > (data.sterne[id] || 0)) { data.sterne[id] = n; save(); return true; }
  return false;
}

export function gesamtSterne() {
  return Object.values(data.sterne).reduce((a, b) => a + b, 0);
}

export function geloest(id) { return (data.sterne[id] || 0) > 0; }

export function rang() {
  const s = gesamtSterne();
  let r = RAENGE[0];
  for (const x of RAENGE) if (s >= x.min) r = x;
  return r;
}

export function naechsterRang() {
  const s = gesamtSterne();
  return RAENGE.find(x => s < x.min) || null;
}

export function setTon(v) { data.ton = !!v; save(); }
export function setMusikPref(v) { data.musik = !!v; save(); }
export function setGesehen() { data.gesehen = true; save(); }

export function reset() { data = leer(); save(); }
