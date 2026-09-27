interface FaqItem {
  question: string;
  answer: string;
}

// Question wording matches the design reference exactly. Answers are
// written to be honest about what TripNest actually does today (browsing/
// search + reviews, no live booking or payment flow yet) rather than
// promising booking/payment features that don't exist — same principle
// the original FAQ copy followed.
const faqs: FaqItem[] = [
  {
    question: "How do I book a stay on TripNest?",
    answer:
      "Browse or search for a place, open its listing page, and use the host's contact details there — TripNest doesn't process bookings directly yet."
  },
  {
    question: "Can I modify or cancel my booking?",
    answer:
      "Since bookings happen directly with the host rather than through TripNest, any changes or cancellations are handled with them, not through this site."
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "TripNest doesn't set cancellation policies — each host or property sets their own, so check the listing page or ask the host directly."
  },
  {
    question: "Do you offer 24/7 customer support?",
    answer: "Not yet — for now, questions about a specific stay are best directed to that listing's host."
  },
  {
    question: "Are the prices per night or per person?",
    answer: "Listed prices are per night for the whole place, not per person, unless a listing says otherwise."
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "TripNest doesn't handle payments — you'd arrange payment directly with the host, however they accept it."
  }
];

function FaqSection() {
  return (
    <section className="section faq-section" id="faq">
      <h2 className="section-title">Frequently asked questions</h2>
      <p className="section-subtitle">Everything you need to know before you go.</p>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details key={faq.question} className="faq-item">
            <summary className="faq-question">{faq.question}</summary>
            <p className="faq-answer">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default FaqSection;
