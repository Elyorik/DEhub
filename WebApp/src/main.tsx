import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { routers } from "./routers/routers";
import { Provider } from "react-redux";
import { store } from "./store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { login, logout } from "./store/userSlice";

// 🔑 Firebase observer sorgt dafür, dass User nach Reload eingeloggt bleibt
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    store.dispatch(
      login({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email || "",
      })
    );
  } else {
    store.dispatch(logout());
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={routers} />
    </Provider>
  </StrictMode>
);
