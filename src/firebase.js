import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import firebaseConfig from './config/firebaseConfig';

// Inicializar Firebase con tu configuración
const app = initializeApp(firebaseConfig);

// Exportar la base de datos
export const db = getFirestore(app);
export const auth = getAuth(app);
