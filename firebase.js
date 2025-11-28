// firebase.js
// SDK via CDN – ideal para GitHub Pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do Firebase da sua aplicação
const firebaseConfig = {
  apiKey: "AIzaSyBQ-3TW0z2K7M3eSar21e8evWnJCRk9NBw",
  authDomain: "dados-controle-de-filamento.firebaseapp.com",
  projectId: "dados-controle-de-filamento",
  storageBucket: "dados-controle-de-filamento.firebasestorage.app",
  messagingSenderId: "72506766646",
  appId: "1:72506766646:web:77c16bb0c3a1990b0fcef97",
  measurementId: "G-JPG9NEHP9K"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Exporta as instâncias para usar em outros arquivos
export { app, db };
