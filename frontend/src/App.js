
import { Navigate, useRoutes } from "react-router-dom";
import LayoutFrontend from "./layouts/frontend";
import RouterFrontend from "./router/RouterFrontend.js";
import LayoutBackend from "./layouts/backend";
import RouterBackend from "./router/RouterBackend";
import AdminLogin from "./pages/backend/User/AdminLogin.js";

function App() {
    const isAuthenticated = localStorage.getItem("admin_token");
    let element = useRoutes([
        {
            path: '/',
            element: <LayoutFrontend />,
            children: RouterFrontend,
        },
        {
            path: "/admin",
            element: isAuthenticated ? <LayoutBackend /> : <Navigate to="/login" />,
            children: RouterBackend,
          },
          {
            path: "/login",
            element: <AdminLogin />,
          },
    ]);

    return element;
}

export default App;

