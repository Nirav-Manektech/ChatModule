// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMYT9Zwb6HBCWORVALnQdsNPsBQDRKupE",
  authDomain: "chat-app-getstreamio.firebaseapp.com",
  projectId: "chat-app-getstreamio",
  storageBucket: "chat-app-getstreamio.appspot.com",
  messagingSenderId: "655443828892",
  appId: "1:655443828892:web:ac068a10765c17cd618d59",
  measurementId: "G-NC7RGMC1VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging service
export const messaging = getMessaging(app);

export const messagingType = typeof messaging
