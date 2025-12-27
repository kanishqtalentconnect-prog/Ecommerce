import React, { useState } from 'react';
import { Navigate,useNavigate } from 'react-router-dom';

const FAQSection = () => {
  const [openItems, setOpenItems] = useState({});
 const navigate = useNavigate();
  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const handleContactClick = () => {
    navigate('/contact'); // ← Redirect to /contact route
  };
  const faqData = [
    {
      question: "What materials are used in your brass products?",
      answer: "Our brass products are crafted using high-quality brass alloy, consisting primarily of copper and zinc. We ensure that all materials meet traditional standards and are sourced from trusted suppliers to maintain authenticity and durability."
    },
    {
      question: "How do I care for and maintain brass items?",
      answer: "To maintain your brass items, clean them regularly with a soft cloth and mild soap solution. For deeper cleaning, use brass cleaner or a mixture of lemon juice and salt. Avoid harsh chemicals and always dry thoroughly after cleaning."
    },
    {
      question: "Do you offer custom brass crafting services?",
      answer: "Yes, we offer custom brass crafting services for special orders. Our skilled artisans can create bespoke pieces according to your specifications. Please contact us with your requirements for a detailed quote and timeline."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer a 30-day return policy for unused items in original condition. Custom-made items are non-returnable unless there's a manufacturing defect. Please contact our customer service team to initiate a return or exchange."
    },
    {
      question: "How long does shipping take for orders?",
      answer: "Standard shipping within India takes 5-7 business days. For Delhi NCR, we offer same-day delivery for ready items. International shipping is available and typically takes 10-15 business days depending on the destination."
    }
  ];

  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto max-w-4xl px-6">
        {/* Dotted border container */}
        <div className="border-2 border-dashed border-gray-300 p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-0.5 bg-blue-400 mx-auto mb-6"></div>
            <h2 className="text-3xl font-light text-gray-800 mb-4">FAQs</h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-6 mb-16">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex justify-between items-center text-left py-4 focus:outline-none"
                >
                  <h3 className="text-lg font-normal text-gray-800 pr-8">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                        openItems[index] ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openItems[index] && (
                  <div className="pb-4 pr-8">
                    <p className="text-gray-600 font-light leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions section */}
          <div className="text-center">
            <h3 className="text-2xl font-light text-gray-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 font-light mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
             <button
              onClick={handleContactClick}
              className="px-8 py-3 border border-gray-400 text-gray-700 hover:bg-gray-100 font-normal transition-colors duration-200"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;