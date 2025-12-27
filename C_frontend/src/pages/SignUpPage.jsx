import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import axiosInstance from "../lib/axios";
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

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Create a data object without confirmPassword
    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await axiosInstance.post("/api/auth/signup", signupData);
      console.log("Signup successful:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
              <p className="text-gray-600">Join us and start your journey today</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Google Auth Button */}
            <div className="mb-6">
              <GoogleAuthButton text="Sign up with Google" />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={User}
              />

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

              <InputField
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                icon={Lock}
                showPasswordToggle={true}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  required
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <label className="ml-3 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Create account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;