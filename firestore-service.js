// firestore-service.js
import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// CHAVES DE CACHE LOCAL
export const LOCAL_CACHE_KEY = "productionSystem_v4_seeded";
export const SYNC_QUEUE_KEY = "productionSystem_syncQueue_v1";

// ------------------------
//  MANIPULAÇÃO DA FILA
// ------------------------

function readQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao ler fila:", e);
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Erro ao salvar fila:", e);
  }
}

/**
 * Adiciona operação na fila
 * op = { type: "set"|"delete", collection, id, data? }
 */
export function pushOp(op) {
  const queue = readQueue();
  queue.push(op);
  writeQueue(queue);
}

/**
 * Tenta executar todas as operações pendentes
 */
export async function flushQueue() {
  const queue = readQueue();
  if (!queue.length) return;

  const pending = [];

  for (const op of queue) {
    try {
      if (op.type === "set") {
        await setDoc(doc(db, op.collection, op.id), op.data, { merge: true });
      } else if (op.type === "delete") {
        await deleteDoc(doc(db, op.collection, op.id));
      }
      // sucesso → não volta para fila
    } catch (e) {
      console.warn("Falhou operação, mantendo na fila:", op, e);
      pending.push(op);
    }
  }

  writeQueue(pending);
}

// ------------------------
//  CARREGAR TODAS AS COLEÇÕES
// ------------------------

export async function loadAllFromFirestore() {
  const out = {
    filaments: [],
    products: [],
    orders: [],
    prints: []
  };

  try {
    const snapF = await getDocs(collection(db, "filaments"));
    snapF.forEach(d => out.filaments.push({ id: d.id, ...d.data() }));

    const snapP = await getDocs(collection(db, "products"));
    snapP.forEach(d => out.products.push({ id: d.id, ...d.data() }));

    const snapO = await getDocs(collection(db, "orders"));
    snapO.forEach(d => out.orders.push({ id: d.id, ...d.data() }));

    const snapR = await getDocs(collection(db, "prints"));
    snapR.forEach(d => out.prints.push({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("Erro ao carregar do Firestore:", e);
  }

  return out;
}

// ------------------------
//  SALVAR COLEÇÕES DO STATE
// ------------------------

export async function saveCollectionFromState(collectionName, arr) {
  for (const item of arr) {
    const id = item.id || (Date.now().toString(36) + Math.random().toString(36).slice(2));
    const data = { ...item };
    delete data.id;

    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (e) {
      // salva na fila offline
      pushOp({ type: "set", collection: collectionName, id, data });
    }
  }
}

// ------------------------
//  DELETAR DO FIRESTORE
// ------------------------

export async function deleteDocRemote(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (e) {
    // se offline → fila
    pushOp({ type: "delete", collection: collectionName, id });
  }
}
