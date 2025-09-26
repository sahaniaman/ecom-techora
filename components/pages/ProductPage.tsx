import ProductCard from "@/components/cards/ProductCard"
import type { Product } from "@/types/product"

const ProductPage = ({products}:{  products: Product[]}) => {
  return (
    <div className="grid grid-cols-5">
      {products.map((product)=>(
        <ProductCard product={product} key={product.id}/>
      ))}
    </div>
  )
}

export default ProductPage
