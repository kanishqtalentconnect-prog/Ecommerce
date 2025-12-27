import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";

// Move InputField component outside to prevent recreation on each render
const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  showPasswordToggle = false,
  showPassword: isPasswordVisible,
  onTogglePassword 
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      <Icon size={20} />
    </div>
    <input
      type={showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
      required
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    )}
  </div>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { syncLocalCartWithServer } = useCart();
  const [searchParams] = useSearchParams();
  
  // Get redirect path from session storage if it exists
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
  
  // Handle Google auth errors from URL params
  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError) {
      switch (authError) {
        case 'auth_failed':
          setError('Google authentication failed. Please try again.');
          break;
        case 'auth_cancelled':
          setError('Google authentication was cancelled.');
          break;
        case 'server_error':
          setError('Server error during authentication. Please try again.');
          break;
        default:
          setError('Authentication error occurred.');
      }
    }
  }, [searchParams]);
  
  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Login with enhanced auth context
      const userData = await login(formData);
      
      // Sync any local cart items with the server
      await syncLocalCartWithServer();
      
      // Clear redirect path from session storage
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Redirect based on user role
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Google Auth Button */}
            <div className="mb-6">
              <GoogleAuthButton />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={Mail}
              />

              <InputField
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={Lock}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Sign in
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}