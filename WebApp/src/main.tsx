import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routers } from "./routers/routers";
import { Provider } from "react-redux";
import { store } from "./store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { login, logout } from "./store/userSlice";
import { UserProvider } from "./store/UserContext";
import VisitorsCounter from "./components/VisitorsCounter/VisitorCounter";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

// ⚡ Создаём обёртку вокруг RouterProvider, чтобы можно было использовать useLocation
import { BrowserRouter } from "react-router-dom";

function AppWrapper() {
  const location = useLocation();
  const [isHome, setIsHome] = useState(location.pathname === "/");

  useEffect(() => {
    setIsHome(location.pathname === "/");
  }, [location]);

  return (
    <>
      {/* Основной роутер */}
      <RouterProvider router={routers} />
      {/* Показать счетчик только на главной */}
      {isHome && <VisitorsCounter />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <UserProvider>
        {/* ✅ Теперь useLocation работает, потому что мы оборачиваем всё в BrowserRouter */}
        <BrowserRouter>
          <AppWrapper />
        </BrowserRouter>
      </UserProvider>
    </Provider>
  </StrictMode>
);
