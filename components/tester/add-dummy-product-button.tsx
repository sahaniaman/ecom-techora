import { Button } from "../ui/button";

const AddDummyProductButton = () => {
  async function handleAddProduct() {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Product 2",
          description: "Just for testing",
          basePrice: 500,
          brand: "TestBrand",
          category: "MObiles",
          images: ["https://example.com/test.jpg"],
          stock: 10,
          sku: "TEST103",
          features: ["Feature A"],
          specifications: { ram: "4GB" },
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);
    } catch (err) {
      console.error("Error calling API:", err);
    }
  }

  return <Button onClick={handleAddProduct}>Add Product</Button>;
};

export default AddDummyProductButton;
