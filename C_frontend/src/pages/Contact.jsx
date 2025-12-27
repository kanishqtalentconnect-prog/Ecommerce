import React, { useState } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      comment: ''
    });
    setIsSubmitting(false);
  };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    if (!subscriptionEmail) return;
    
    setIsSubscribing(true);
    
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Subscription email:', subscriptionEmail);
    alert('Successfully subscribed to our newsletter!');
    
    setSubscriptionEmail('');
    setIsSubscribing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Get In Touch</h1>
          <p className="text-xl text-gray-300 font-light">
            We're here to help with all your brass craftsmanship needs
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Contact Information */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4">Contact Information</h2>
            <div className="w-20 h-0.5 bg-amber-600 mx-auto mb-8"></div>
            <a 
              href="tel:+918826480550" 
              className="text-2xl text-amber-700 hover:text-amber-800 transition-colors duration-200 font-light"
            >
              +91-8826480550
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-amber-700 text-xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">International Shipping</h3>
              <p className="text-gray-600 leading-relaxed">
                We ship worldwide! All prices are inclusive for your region with no hidden costs.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-amber-700 text-xl">🎁</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Gift Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Special gift packaging and personalized notes available for your loved ones.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-amber-700 text-xl">🏢</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Corporate Gifting</h3>
              <p className="text-gray-600 leading-relaxed">
                Curated, budget-friendly gifts for your workplace peers. We've got you covered!
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-amber-700 text-xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Wholesale Orders</h3>
              <p className="text-gray-600 leading-relaxed">
                Special discounted rates available for bulk quantities. Contact us for pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4">Send Us a Message</h2>
            <div className="w-20 h-0.5 bg-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Have questions or need assistance? We'll get back to you as quickly as possible.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-vertical"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-amber-700 hover:bg-amber-800 active:bg-amber-900'
                } text-white`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 rounded-lg text-center">
          <h3 className="text-2xl font-light mb-4">Stay Connected</h3>
          <p className="text-gray-300 mb-6 font-light">
            Be the first to know about new collections and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={subscriptionEmail}
              onChange={(e) => setSubscriptionEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors duration-200"
              required
            />
            <button
              type="button"
              onClick={handleSubscriptionSubmit}
              disabled={isSubscribing}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSubscribing 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-amber-700 hover:bg-amber-800'
              } text-white`}
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}