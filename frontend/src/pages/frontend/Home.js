import Banner from '../../components/Banner';
import ProductNew from '../../components/ProductNew';
import ProductSale from '../../components/ProductSale';
import ProductView from '../../components/ProductView';
import PostNew from '../../components/PostNew';

const Home = () => {
    return (
        <>
            <Banner />
            <main>
                <div className="mainproductnew">
                    <ProductNew />
                    <ProductSale />
                    <ProductView />
                </div>
                <div className="postnew">
                    <PostNew />
                </div>
            </main>
        </>
    );
}
export default Home;