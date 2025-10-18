"use client"
import ProductCard from "@/components/cards/ProductCard"
import { useProducts } from "@/data/products/use-products"


const ProductPage = () => {
    const { products, isLoading, error } = useProducts()
    
    console.log("Products::::::::::Page/tsx::::::::::::", products)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading products...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-lg">Error loading products</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Our Products
                    </h1>
                    <p className="text-gray-600">
                        Discover our amazing collection of products
                    </p>
                </div>

                {/* Products Grid */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <ProductCard showFeatures key={product.name} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            No products found
                        </div>
                    </div>
                )}

                {/* Pagination (if needed) */}
                <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                        <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Previous
                        </button>
                        <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage