import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Filament, Product, Order, Print } from '@/types';

// ========================
// FILAMENTS
// ========================

export const addFilament = async (filament: Omit<Filament, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'filaments'), {
    ...filament,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateFilament = async (id: string, filament: Partial<Filament>) => {
  await updateDoc(doc(db, 'filaments', id), filament);
};

export const deleteFilament = async (id: string) => {
  await deleteDoc(doc(db, 'filaments', id));
};

export const getFilaments = async (): Promise<Filament[]> => {
  const snapshot = await getDocs(collection(db, 'filaments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Filament));
};

// ========================
// PRODUCTS
// ========================

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'is3d'>) => {
  const is3d = product.sku.toUpperCase().includes('3D');
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    is3d,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const is3d = product.sku ? product.sku.toUpperCase().includes('3D') : undefined;
  await updateDoc(doc(db, 'products', id), {
    ...product,
    ...(is3d !== undefined && { is3d }),
  });
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

// ========================
// ORDERS
// ========================

export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    status: order.status || 'afazer',
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  await updateDoc(doc(db, 'orders', id), order);
};

export const deleteOrder = async (id: string) => {
  await deleteDoc(doc(db, 'orders', id));
};

export const getOrders = async (): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

// ========================
// PRINTS
// ========================

export const addPrint = async (print: Omit<Print, 'id' | 'createdAt' | 'custoEnergia'>) => {
  // Calcula custo de energia
  const tempoHoras = print.tempoMin / 60;
  const energiaKwh = 0.2 * tempoHoras;
  const custoEnergia = energiaKwh * 0.95;

  const docRef = await addDoc(collection(db, 'prints'), {
    ...print,
    custoEnergia,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const deletePrint = async (id: string) => {
  await deleteDoc(doc(db, 'prints', id));
};

export const getPrints = async (): Promise<Print[]> => {
  const snapshot = await getDocs(collection(db, 'prints'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Print));
};
