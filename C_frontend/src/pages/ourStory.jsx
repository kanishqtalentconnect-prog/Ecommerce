const OurStory = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-light mb-6 leading-tight">Our Story</h1>
          <p className="text-xl text-gray-300 font-light">
            A journey of tradition, craftsmanship, and devotion
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="text-lg mb-8 text-gray-800 font-light">
              BudhShiv is an exclusive brand for unique handcrafted brass products.
            </p>
            
            <div className="space-y-6">
              <p>
                BudhShiv Online was started on 1st September, 2020, during the peak of Covid-19. Due to lockdown and no retail orders, our artists were suffering. The main reason for taking BudhShiv online was to provide support to our artists and their families. By the grace of god, we received a wonderful response on social media from people around the world. You can check our Instagram testimonials story highlight to see the love we've received.
              </p>
              
              <p>
                Now we are working full time online as well as retailing offline from our shop located in New Delhi, serving customers globally while staying true to our roots.
              </p>
              
              <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-500 my-8">
                <p className="text-amber-800 font-medium">
                  BudhShiv - the name is a combination of Lord Buddha and Lord Shiva. We work completely by the teachings and values of Buddha and Shiva. After exploring both, I found one thing in common between them: <span className="font-semibold">Service with love to humanity.</span>
                </p>
              </div>
              
              <p>
                The art of statue and handicraft making is dying in our country. Our goal is to revive this lost art and support the artisan communities who have been carrying forward these traditions for generations.
              </p>
              
              <p>
                It is said that positioning brass items in the right directions of your house or workplace brings good luck and fortune. Any handmade artifact you purchase directly or indirectly helps the artisan communities grow and make a better living.
              </p>
              
              <p className="text-lg text-gray-800 font-medium mt-8">
                By doing good, you bring home positivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;