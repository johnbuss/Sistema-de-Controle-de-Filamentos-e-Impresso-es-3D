// firestore.js
// módulo leve para salvar/carregar o "state" inteiro como 1 documento no Firestore
import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const STATE_COLLECTION = "state";
const STATE_DOC = "main";

/**
 * Tenta carregar o state completo do Firestore.
 * Retorna objeto { filaments, products, orders, prints } ou null se falhar.
 */
export async function loadStateFromRemote() {
  try {
    const ref = doc(db, STATE_COLLECTION, STATE_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    // normaliza: garante arrays
    return {
      filaments: Array.isArray(data.filaments) ? data.filaments : [],
      products:  Array.isArray(data.products)  ? data.products  : [],
      orders:    Array.isArray(data.orders)    ? data.orders    : [],
      prints:    Array.isArray(data.prints)    ? data.prints    : []
    };
  } catch (e) {
    console.warn("loadStateFromRemote failed:", e);
    return null;
  }
}

/**
 * Salva o "state" inteiro no Firestore (substitui).
 * Recebe o objeto state completo.
 */
export async function saveStateToRemote(state) {
  try {
    const ref = doc(db, STATE_COLLECTION, STATE_DOC);
    // grava como objeto - removemos funções/protótipos caso existam
    const payload = {
      filaments: Array.isArray(state.filaments) ? state.filaments : [],
      products:  Array.isArray(state.products)  ? state.products  : [],
      orders:    Array.isArray(state.orders)    ? state.orders    : [],
      prints:    Array.isArray(state.prints)    ? state.prints    : [],
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, payload, { merge: true });
    return true;
  } catch (e) {
    console.warn("saveStateToRemote failed:", e);
    return false;
  }
}
