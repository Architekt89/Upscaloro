interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the AI upscaling work?",
    answer: "Our AI upscaling technology uses advanced neural networks to analyze your images and intelligently add details and resolution. The AI has been trained on millions of images to understand how to enhance details while maintaining the natural look of the original image."
  },
  {
    question: "What file formats do you support?",
    answer: "We support most common image formats including JPEG, PNG, WEBP, and more. You can also choose your preferred output format when processing images."
  },
  {
    question: "How long does it take to process an image?",
    answer: "Processing time depends on the size of your image and the upscaling factor you choose. Most images are processed within seconds, but larger images or higher upscaling factors may take a bit longer."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. Your images are processed securely and are not shared with third parties. We also automatically delete processed images after a short period to ensure your privacy."
  }
];

export default function ContactFAQ() {
  return (
    <div className="mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Find answers to common questions about our services and platform.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 