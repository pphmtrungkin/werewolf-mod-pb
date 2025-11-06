import PocketBase from "pocketbase";

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export async function loginWithPassword(email, password) {
  return await pb.collection("users").authWithPassword(email, password);
}

export async function registerUser(email, password, passwordConfirm, avatarUrl) {
  return await pb.collection("users").create({
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
    avatarUrl: avatarUrl,
  });
}

export function getCurrentUser() {
  return pb.authStore.model;
}

export function logout() {
  pb.authStore.clear();
}

export default pb;

