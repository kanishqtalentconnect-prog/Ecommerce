const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Shipping Policy</h1>
          <p className="text-xl text-gray-300 font-light">
            Worldwide delivery with trusted shipping partners
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200">
          <div className="prose max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Shipping Information</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-6"></div>
              <p className="text-gray-700 mb-6 text-lg">
                The majority of our products are made to order and may require a time frame of 7-10 days, other than the ones which are in stock. This is because we source directly from local artisans who do not deal in big quantities.
              </p>
              <p className="text-gray-700 mb-6">
                We have a great network of shipping partners like DTDC in India and DHL, FEDEX, BLUEDART and UPS for international couriers. Once the product is shipped, we notify our clients via email by sharing the tracking/AWB bill of the consignment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">International Shipping</h3>
                <p className="text-amber-800">
                  For all international orders we do door delivery. Custom duties are charged by local governments in your country. You have to pay custom duties according to your country's rules. Local delivery agents will contact you if your parcel qualifies for custom duty.
                </p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Delivery Timeline</h3>
                <p className="text-blue-800">
                  Our products usually reach customers within 5-7 working days in India and 7-10 days internationally, depending on custom clearance. Sometimes it can take longer due to unavoidable circumstances.
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-400">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Package Tracking</h3>
              <p className="text-green-800">
                You can always track your packages using the tracking IDs or links that we provide to your registered email address. Stay updated on your order's journey from our workshop to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;