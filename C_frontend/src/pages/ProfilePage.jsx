import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  ShoppingBag, 
  Clock, 
  Shield, 
  Edit,
  Package2,
  Star,
  MessageSquare,
  Eye,
  Calendar,
  Award,
  Camera,
  House
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../lib/axios";
import ReviewFormModal from "../components/ReviewFromModal";
import AddressForm from "./AddressForm";
import { useAddress } from "../context/AddressContext";


const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { fetchDefaultAddress } = useAddress();

  useEffect(() => {
  if (activeTab === "location" && user) {
    fetchAddresses();
  }
}, [activeTab, user]);


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await axiosInstance.get("/api/orders/my-orders");
      setOrders(ordersResponse.data || []);

      // Fetch user reviews
      const reviewsResponse = await axiosInstance.get("/api/reviews/my-reviews");
      setReviews(reviewsResponse.data?.data?.reviews || []);

      // Fetch reviewable products
      const reviewableResponse = await axiosInstance.get("/api/reviews/reviewable");
      setReviewableProducts(reviewableResponse.data?.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setReviewLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleWriteReview = (product, orderId) => {
    setSelectedProduct(product);
    setSelectedOrder(orderId);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setReviewableProducts(prev => 
      prev.filter(item => 
        !(item.product._id === newReview.product._id && item.orderId === newReview.order)
      )
    );
    fetchData(); // Refresh data
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const fetchAddresses = async () => {
  try {
    setAddressLoading(true);
    const res = await axiosInstance.get("/api/address", {
      withCredentials: true,
    });
    setAddresses(res.data || []);
  } catch (err) {
    console.error("Failed to fetch addresses", err);
  } finally {
    setAddressLoading(false);
  }
  };
  const setDefaultAddress = async (id) => {
  await axiosInstance.patch(
    `/api/address/${id}/default`,
    {},
    { withCredentials: true }
  );
  await fetchAddresses();       
  await fetchDefaultAddress();  
};
  const deleteAddress = async (id, isDefault) => {
  if (isDefault) {
    alert("Please set another address as default before deleting this one.");
    return;
  }

  if (!window.confirm("Delete this address?")) return;

  await axiosInstance.delete(`/api/address/${id}`, {
    withCredentials: true,
  });

  fetchAddresses();
};


  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <User size={40} />
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Shield className="h-4 w-4 text-gray-500 mr-1" />
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === "admin" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {user.role === "admin" ? "Administrator" : "Customer"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-col md:flex-row items-center gap-3">
                {user.role === "admin" && (
                  <Link 
                    to="/admin"
                    className="w-full md:w-auto bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Package2 className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'orders' 
                  ? 'text-amber-600 border-b-2 border-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'reviews' 
                  ? 'text-amber-600 border-b-2 border-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              My Reviews
            </button>
            <button
              onClick={() => setActiveTab('reviewable')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'reviewable' 
                  ? 'text-amber-600 border-b-2 border-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit className="h-4 w-4" />
              Write Reviews
              {reviewableProducts.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {reviewableProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'account' 
                  ? 'text-amber-600 border-b-2 border-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="h-4 w-4" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'location' 
                  ? 'text-amber-600 border-b-2 border-amber-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <House className="h-4 w-4" />
              My Addresses
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">My Orders</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-md p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {order.products?.length || 0} {order.products?.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-gray-500 mb-4">When you place an order, it will appear here</p>
                  <Link 
                    to="/" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">My Reviews</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-1" />
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} written
                </div>
              </div>
              
              {reviewLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden mr-3">
                              {review.product?.image ? (
                                <img 
                                  src={review.product.image} 
                                  alt={review.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Camera className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{review.product?.name}</h3>
                              <div className="flex items-center mt-1">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-gray-600">
                                  {review.rating} star{review.rating !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          
                          {review.images && review.images.length > 0 && (
                            <div className="flex space-x-2 mb-2">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review ${index + 1}`}
                                  className="h-16 w-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                            {review.verified && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600">Verified Purchase</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                  <p className="text-gray-500">Your product reviews will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Reviewable Products Tab */}
          {activeTab === 'reviewable' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Products You Can Review</h2>
              <p className="text-gray-600 mb-6">
                Write reviews for products from your delivered orders to help other customers.
              </p>
              
              {reviewableProducts.length > 0 ? (
                <div className="space-y-4">
                  {reviewableProducts.map((item) => (
                    <div key={`${item.orderId}-${item.product._id}`} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
                            {item.product.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Camera className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">₹{item.product.price}</p>
                            <p className="text-xs text-gray-500">
                              Delivered on {new Date(item.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleWriteReview(item.product, item.orderId)}
                          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Write Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products to review</h3>
                  <p className="text-gray-500">
                    Products from delivered orders that you haven't reviewed yet will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Account Information</h2>
                  <button className="text-amber-600 hover:text-amber-800">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">April 2025</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <ShoppingBag className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Total Orders</span>
                    </div>
                    <span className="font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                      <span>Reviews Written</span>
                    </div>
                    <span className="font-semibold">{reviews.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Edit className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Pending Reviews</span>
                    </div>
                    <span className="font-semibold">{reviewableProducts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/*Address Tab */}
          {activeTab === "location" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">My Addresses</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="bg-amber-600 text-white px-4 py-2 rounded"
                >
                  + Add Address
                </button>
              </div>

              {addressLoading ? (
                <p>Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="text-gray-500">No addresses saved.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`border rounded-lg p-4 ${
                        addr.isDefault ? "border-amber-500 bg-amber-50" : ""
                      }`}
                    >
                      <p className="font-medium">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipcode}
                      </p>
                      <p className="text-sm">{addr.country}</p>
                      <p className="text-sm">📞 {addr.phone}</p>

                      <div className="flex gap-3 mt-3 text-sm">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr._id)}
                            className="text-amber-600"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setShowAddressForm(true);
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAddress(addr._id, addr.isDefault)}
                          className="text-red-600"
                        >
                          Delete
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showAddressForm && (
            <AddressForm
              initialData={editingAddress}
              onClose={() => setShowAddressForm(false)}
              onSaved={fetchAddresses}
            />
          )}


          {/* Admin Section */}
          {user.role === "admin" && activeTab === 'account' && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Admin Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  to="/admin/products" 
                  className="flex items-center p-4 border rounded-md hover:bg-gray-50"
                >
                  <Package2 className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Manage Products</h3>
                    <p className="text-sm text-gray-500">Add, edit or remove products</p>
                  </div>
                </Link>
                <Link 
                  to="/admin/create-product" 
                  className="flex items-center p-4 border rounded-md hover:bg-gray-50"
                >
                  <Edit className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-medium">Add New Product</h3>
                    <p className="text-sm text-gray-500">Create a new product listing</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewFormModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={selectedProduct}
        orderId={selectedOrder}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ProfilePage;