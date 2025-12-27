import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";


export const useProductStore = create((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axiosInstance.post("/api/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},
	fetchProductsByName: async (name) => {
		try {
			const res = await axiosInstance.get(`/api/products/search?name=${encodeURIComponent(name)}`);
			set({ products: res.data.products }); // ✅ FIXED: Access the array inside response
		} catch (error) {
			toast.error("Failed to load products");
		}
	},


	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axiosInstance.get(".api/products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
		  const res = await axiosInstance.get(`/api/products/category/${encodeURIComponent(category)}`);
		  set({ products: res.data, loading: false });
		} catch (err) {
		  console.error("Failed to fetch category products", err);
		  set({ products: [], loading: false });
		}
	  },
	  
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axiosInstance.delete(`/api/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axiosInstance.patch(`/api/products/${productId}`);
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axiosInstance.get("/api/products/featured");
			set({ products: response.data, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));