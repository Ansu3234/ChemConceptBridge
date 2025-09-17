import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      content: "ChemConcept Bridge has transformed how I understand chemical concepts. The interactive approach makes learning enjoyable and effective.",
      author: "Sarah Johnson",
      role: "Chemistry Student",
      initials: "SJ"
    },
    {
      id: 2,
      content: "As a chemistry teacher, I've seen remarkable improvement in my students' understanding since incorporating ChemConcept Bridge into our curriculum.",
      author: "Dr. Michael Chen",
      role: "High School Chemistry Teacher",
      initials: "MC"
    },
    {
      id: 3,
      content: "The way complex concepts are broken down makes chemistry accessible to everyone. I wish I had this platform when I was studying!",
      author: "Priya Patel",
      role: "Undergraduate Student",
      initials: "PP"
    }
  ];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-header">
        <h2>What Our Users Say</h2>
        <p>Discover how ChemConcept Bridge is helping students and educators bridge the gap in chemistry education.</p>
      </div>
      
      <div className="testimonials-container">
        {testimonials.map(testimonial => (
          <div className="testimonial-card" key={testimonial.id}>
            <div className="testimonial-content">
              <p>"{testimonial.content}"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                {testimonial.initials}
              </div>
              <div className="author-info">
                <h4>{testimonial.author}</h4>
                <p>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;