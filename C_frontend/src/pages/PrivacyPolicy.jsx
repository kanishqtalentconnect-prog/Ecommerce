const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Privacy Policy</h1>
          <p className="text-xl text-gray-300 font-light">
            Your privacy and data protection are our priority
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Who We Are</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
              <p className="text-gray-700 mb-4">
                Our website address is: <a href="https://www.budhshiv.com" className="text-amber-700 hover:text-amber-800 underline">https://www.budhshiv.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Comments</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
              <p className="text-gray-700 mb-4">
                When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection.
              </p>
              <p className="text-gray-700 mb-4">
                An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-amber-700 hover:text-amber-800 underline">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Cookies</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-4">
                <p className="text-blue-800">
                  If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Data Retention</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
              <p className="text-gray-700 mb-4">
                If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.
              </p>
              <p className="text-gray-700 mb-4">
                For users that register on our website, we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Your Rights</h2>
              <div className="w-16 h-0.5 bg-amber-600 mb-4"></div>
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                <p className="text-green-800">
                  If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;