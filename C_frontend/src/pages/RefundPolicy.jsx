const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Refund Policy</h1>
          <p className="text-xl text-gray-300 font-light">
            Fair and transparent return process for our handcrafted products
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200">
          <div className="prose max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Our Return Policy</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-6"></div>
              <p className="text-gray-700 mb-4 text-lg">
                We offer exchange and returns on items that are either damaged or defective. Minor shade differences or minor artwork differences can be there as all the items are handmade.
              </p>
              <p className="text-gray-700 mb-4">
                We request our customers to make an opening video of parcels as guided by our shipping partners to ensure if there is any damage due to mishandling. After reviewing the package opening videos our quality team makes a decision on the refund or exchange.
              </p>
              <p className="text-gray-700 mb-4">
                Once the decision has been made we create a return for the parcel and once we receive the returned product we either send another item or we refund the amount to the customer as requested. We process all returns within 7-10 working days after the return package has been received.
              </p>
            </div>

            <div className="bg-yellow-50 p-8 rounded-lg border-l-4 border-yellow-400 mb-8">
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">Important Notes</h3>
              <ul className="space-y-3 text-yellow-800">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-3 mt-1">•</span>
                  <span className="font-semibold">Orders once placed cannot be cancelled.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-3 mt-1">•</span>
                  <span>The request for exchange or refund should be lodged within 5 days after delivery.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-3 mt-1">•</span>
                  <span>The exchange or return will take place only if there is an uncut/non-edited package opening video.</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-400">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Need Help?</h3>
              <p className="text-blue-800">
                For any refund-related queries, please contact our support team at{' '}
                <a href="mailto:support@budhshiv.com" className="text-blue-700 hover:text-blue-600 underline font-medium">
                  support@budhshiv.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;