import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, useLocation } from "react-router-dom";
import { routers } from "./routers/routers";
import { Provider } from "react-redux";
import { store } from "./store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { login, logout } from "./store/userSlice";
import { UserProvider } from "./store/UserContext";
import VisitorsCounter from "./components/VisitorsCounter/VisitorCounter";

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

// 🔥 Diese kleine Wrapper-Komponente zeigt den Counter nur auf der Startseite
function AppWithCounter() {
  const location = useLocation();
  const isHome = location.pathname === "/"; // проверяем, что находимся на главной

  return (
    <>
      <RouterProvider router={routers} />
      {isHome && <VisitorsCounter />} {/* 👈 показываем только на / */}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <UserProvider>
        <AppWithCounter />
      </UserProvider>
    </Provider>
  </StrictMode>
);
