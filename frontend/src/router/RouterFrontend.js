import OrderSuccess from "../components/OrderSuccess";
import AccountInfo from "../pages/frontend/AccountInfo";
import AllPosts from "../pages/frontend/AllPosts";
import Cart from "../pages/frontend/Cart";
import Checkout from "../pages/frontend/Checkout";
import Contact from "../pages/frontend/Contact";
import Home from "../pages/frontend/Home";
import PostDetail from "../pages/frontend/PostDetail";
import ProductAll from "../pages/frontend/ProductAll";
import ProductCategory from "../pages/frontend/ProductCategory";
import ProductDetail from "../pages/frontend/ProductDetail";
import ProductSearch from "../pages/frontend/ProductSearch";
import Register from "../pages/frontend/Register";
import UserOrders from "../pages/frontend/UserOrderDetail";

const RouterFrontend = [
    // Trang chủ
    { path: '/', element: <Home /> },
    { path: '/tat-ca-san-pham', element: <ProductAll /> },
    { path: '/danh-muc-san-pham/:categoryId', element: <ProductCategory /> },
    { path: '/tim-kiem-san-pham', element: <ProductSearch /> },
    { path: '/chi-tiet-san-pham/:id', element: <ProductDetail /> },
    { path: '/dang-ky-tai-khoan', element: <Register /> },
    { path: '/gio-hang', element: <Cart /> },
    { path: "/thanh-toan", element: <Checkout /> },
    { path: "/dat-hang-thanh-cong/:id", element: <OrderSuccess /> },
    { path: "/thong-tin-tai-khoan", element: <AccountInfo /> },
    { path: "/tat-ca-bai-viet", element: <AllPosts /> },
    { path: "/post/:id", element: <PostDetail /> },
    { path: "/lien-he", element: <Contact /> },
    { path: "/don-hang/:id", element: <UserOrders /> },

];

export default RouterFrontend;