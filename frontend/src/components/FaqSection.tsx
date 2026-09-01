interface FaqItem {
  question: string;
  answer: string;
}

// Real answers about how TripNest actually works, not generic filler —
// the one content section here that doesn't need real backend data to be
// genuinely accurate.
const faqs: FaqItem[] = [
  {
    question: "How do I find a place to stay?",
    answer:
      "Use the search bar to look up a destination, click a region on the map, or filter by price and rating. Results update instantly — no account needed to browse."
  },
  {
    question: "Do I need an account to browse listings?",
    answer:
      "No — browsing and searching are open to everyone. You'll need to log in to leave a review."
  },
  {
    question: "How does the rating system work?",
    answer:
      "Each listing's rating is the average of its real guest reviews, recalculated automatically every time a review is added, edited, or removed — it's never set manually."
  },
  {
    question: "Can I leave more than one review for the same place?",
    answer:
      "One review per listing per account, to keep ratings honest. You can edit or delete your own review at any time."
  }
];

function FaqSection() {
  return (
    <section className="section faq-section" id="faq">
      <h2 className="section-title">Frequently asked questions</h2>
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
