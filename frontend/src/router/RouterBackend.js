import Dashboard from "../pages/backend/Dashboar";
import CategoryList from "../pages/backend/Category/List";
import CategoryCreate from "../pages/backend/Category/Create";
import CategoryUpdate from "../pages/backend/Category/Update";
import CategoryTrashList from "../pages/backend/Category/Trash";
import CategoryDetail from "../pages/backend/Category/Detail";
import ProductCreate from "../pages/backend/Product/Create";
import ProductList from "../pages/backend/Product/List";
import ProductUpdate from "../pages/backend/Product/Update";
import ProductDetail from "../pages/backend/Product/Detail";
import ProductTrashList from "../pages/backend/Product/Trash";
import BannerCreate from "../pages/backend/Banner/Create";
import BannerList from "../pages/backend/Banner/List";
import BannerUpdate from "../pages/backend/Banner/Update";
import BannerDetail from "../pages/backend/Banner/Detail";
import BannerTrash from "../pages/backend/Banner/Trash";
import TopicCreate from "../pages/backend/Topic/Create";
import TopicList from "../pages/backend/Topic/List";
import TopicUpdate from "../pages/backend/Topic/Update";
import TopicDetail from "../pages/backend/Topic/Detail";
import TopicTrashList from "../pages/backend/Topic/Trash";
import PostCreate from "../pages/backend/Post/Create";
import PostList from "../pages/backend/Post/List";
import PostTrashList from "../pages/backend/Post/Trash";
import PostDetail from "../pages/backend/Post/Detail";
import PostUpdate from "../pages/backend/Post/Update";
import UserList from "../pages/backend/User/List";
import UserCreate from "../pages/backend/User/Create";
import UserUpdate from "../pages/backend/User/Update";
import UserDetail from "../pages/backend/User/Detail";
import UserTrash from "../pages/backend/User/Trash";
import OrderList from "../pages/backend/Order/List";
import ContactList from "../pages/backend/Contact/List";
import ContactTrash from "../pages/backend/Contact/Trash";
import ContactDetail from "../pages/backend/Contact/Detail";
import OrderDetail from "../pages/backend/Order/Detail";

const RouterBackend = [
    // Dashboard
    { path: '/admin', element: <Dashboard /> },

    // Category
    { path: '/admin/category', element: <CategoryList /> },
    { path: '/admin/category/create', element: <CategoryCreate /> },
    { path: '/admin/category/update/:id', element: <CategoryUpdate /> },
    { path: '/admin/category/trash', element: <CategoryTrashList /> },
    { path: '/admin/category/detail/:id', element: <CategoryDetail /> },

    // Product
    { path: '/admin/product/create', element: <ProductCreate /> },
    { path: '/admin/product', element: <ProductList /> },
    { path: '/admin/product/update/:id', element: <ProductUpdate /> },
    { path: '/admin/product/detail/:id', element: <ProductDetail /> },
    { path: '/admin/product/trash', element: <ProductTrashList /> },

    // Banner
    { path: '/admin/banner/create', element: <BannerCreate /> },
    { path: '/admin/banner', element: <BannerList /> },
    { path: '/admin/banner/update/:id', element: <BannerUpdate /> },
    { path: '/admin/banner/detail/:id', element: <BannerDetail /> },
    { path: '/admin/banner/trash', element: <BannerTrash /> },

    // Topic
    { path: '/admin/topic/create', element: <TopicCreate /> },
    { path: '/admin/topic', element: <TopicList /> },
    { path: '/admin/topic/update/:id', element: <TopicUpdate /> },
    { path: '/admin/topic/detail/:id', element: <TopicDetail /> },
    { path: '/admin/topic/trash', element: <TopicTrashList /> },

    // Post
    { path: '/admin/post/create', element: <PostCreate /> },
    { path: '/admin/post', element: <PostList /> },
    { path: '/admin/post/trash', element: <PostTrashList /> },
    { path: '/admin/post/detail/:id', element: <PostDetail /> },
    { path: '/admin/post/update/:id', element: <PostUpdate /> },

    // User
    { path: '/admin/user', element: <UserList /> },
    { path: '/admin/user/create', element: <UserCreate /> },
    { path: '/admin/user/update/:id', element: <UserUpdate /> },
    { path: '/admin/user/detail/:id', element: <UserDetail /> },
    { path: '/admin/user/trash', element: <UserTrash /> },

    // Contact
    { path: '/admin/contact', element: <ContactList /> },
    { path: '/admin/contact/trash', element: <ContactTrash /> },
    { path: '/admin/contact/detail/:id', element: <ContactDetail /> },

    // Order
    { path: '/admin/order', element: <OrderList /> },
    { path: '/admin/order/detail/:id', element: <OrderDetail /> },

];
export default RouterBackend