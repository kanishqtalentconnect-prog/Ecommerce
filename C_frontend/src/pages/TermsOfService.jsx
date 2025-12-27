const TermsOfService = () => {
  const sections = [
    {
      title: "Overview",
      content: "This website is operated by BudhShiv. Throughout the site, the terms \"we\", \"us,\" and \"our\" refer to BudhShiv. BudhShiv offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here."
    },
    {
      title: "Online Store Terms",
      content: "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction."
    },
    {
      title: "General Conditions",
      content: "We reserve the right to refuse service to anyone for any reason at any time. You understand that your content may be transferred unencrypted and involve transmissions over various networks. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us."
    },
    {
      title: "Products or Services",
      content: "Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products."
    },
    {
      title: "Prohibited Uses",
      content: "You are prohibited from using the site or its content for any unlawful purpose, to violate any regulations, to infringe upon intellectual property rights, to harass or discriminate, to submit false information, or to upload malicious code."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Terms of Service</h1>
          <p className="text-xl text-gray-300 font-light">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200">
          <div className="prose max-w-none">
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-6">
                At BudhShiv, we believe in delivering handcrafted products by our artisans safely to our customers. Since all our products are completely handmade, we expect our buyers to understand that there may be minor shade/colour differences due to digital photography and screen resolution variations.
              </p>
              <p className="text-gray-700">
                If you have any doubts about the colour or quality of the product, please contact us at{' '}
                <a href="tel:+918826480550" className="text-amber-700 hover:text-amber-800 underline font-medium">
                  +91-8826480550
                </a>
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <section key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h2 className="text-2xl font-light text-gray-800 mb-4">{section.title}</h2>
                  <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </section>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                <p className="text-gray-700">
                  Questions about the Terms of Service should be sent to us at{' '}
                  <a href="tel:+918826480550" className="text-amber-700 hover:text-amber-800 underline font-medium">
                    +91-8826480550
                  </a>
                  {' '}or email us at{' '}
                  <a href="mailto:budhshivretail@gmail.com" className="text-amber-700 hover:text-amber-800 underline font-medium">
                    budhshivretail@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component to showcase all pages
export default TermsOfService;