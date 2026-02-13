import { Capacitor } from "@capacitor/core";
import { FirebaseAnalytics } from "@capacitor-firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as webLogEvent } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

let analytics: any;
let auth: ReturnType<typeof getAuth> | null = null;

if (Capacitor.getPlatform() === "web") {
  const app = initializeApp({
    apiKey: "AIzaSyBLkMv2N_cnG6q-9spUj01wvxRnfWSr6XY",
    authDomain: "cookie-brasil.firebaseapp.com",
    projectId: "cookie-brasil",
    storageBucket: "cookie-brasil.appspot.com",
    messagingSenderId: "202105498916",
    appId: "1:202105498916:web:d161e68c42e66c8f8997b1",
    measurementId: "G-6KZE06S4SF",
  });

  analytics = getAnalytics(app);
  auth = getAuth(app);
}

async function LogEvent(
  name: string,
  params?: Record<string, any>,
): Promise<void> {
  if (import.meta.env.DEV) {
    console.log("[Analytics] event:", name);
  }

  if (Capacitor.getPlatform() === "web" && analytics) {
    await webLogEvent(analytics, name, params || {});
  } else {
    await FirebaseAnalytics.logEvent({ name, params: params || {} });
  }
}

/**
 * Login com Google (web e apk nativo)
 */
async function signInWithGoogle(): Promise<any> {
  if (Capacitor.getPlatform() === "web") {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }
  const result = await FirebaseAuthentication.signInWithGoogle();
  const credential = GoogleAuthProvider.credential(result.credential?.idToken);
  const userCredential = await auth.signInWithCredential(credential);
  return userCredential.user;
}

export { LogEvent, signInWithGoogle };
