// src/pages/HomePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Navbar from '../components/Layout/Navbar';
import MoleculeAnimation from '../components/MoleculeAnimation/MoleculeAnimation';
import Testimonials from '../components/Testimonials/Testimonials';
// Import Poppins font
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
// Import icons
import { FaFlask, FaAtom, FaChalkboardTeacher, FaUserGraduate, FaChartLine, FaArrowRight, FaLaptop, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { IoMdBook } from 'react-icons/io';
import { BsLightningChargeFill } from 'react-icons/bs';

function HomePage({ user }) {
    const [scrolled, setScrolled] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    
    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);
    
    // Features data
    const features = [
        {
            icon: <FaAtom className="feature-icon" />,
            title: "Interactive Molecular Visualization",
            description: "Explore 3D molecular structures and chemical reactions in real-time with our advanced visualization tools."
        },
        {
            icon: <FaChalkboardTeacher className="feature-icon" />,
            title: "Personalized Learning Paths",
            description: "Our AI-driven system adapts to your learning style, creating customized study plans that focus on your areas for improvement."
        },
        {
            icon: <FaChartLine className="feature-icon" />,
            title: "Real-time Progress Tracking",
            description: "Monitor your understanding of key chemistry concepts with comprehensive analytics and performance insights."
        }
    ];
    
    return (
        <div className="home-container">
            <Navbar user={user} />
            
            <div className="hero-section">
                <div className="particles-background"></div>
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="badge">Chemistry Education Platform</div>
                        <h1>Bridging the gap between chemistry concepts and understanding</h1>
                        <p>ChemConcept Bridge connects students with innovative learning tools that make chemistry concepts accessible, interactive, and engaging. Our platform bridges the gap between theoretical knowledge and practical application.</p>
                        <div className="hero-buttons">
                            <Link to="/register" className="primary-button">Get Started <FaArrowRight className="btn-icon" /></Link>
                            <a href="#features" className="secondary-button">Explore Features</a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="molecule-model">
                            <div className="atom atom-1"></div>
                            <div className="atom atom-2"></div>
                            <div className="atom atom-3"></div>
                            <div className="bond bond-1"></div>
                            <div className="bond bond-2"></div>
                        </div>
                    </div>
                </div>
                
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-number">10,000+</span>
                        <span className="stat-label">Students</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Institutions</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">95%</span>
                        <span className="stat-label">Success Rate</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Support</span>
                    </div>
                </div>
            </div>
            
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>Powerful Features</h2>
                    <p>Discover how our platform transforms chemistry education</p>
                </div>
                
                <div className="features-container">
                    <div className="features-tabs">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                                onClick={() => setActiveFeature(index)}
                            >
                                {feature.icon}
                                <h3>{feature.title}</h3>
                            </div>
                        ))}
                    </div>
                    
                    <div className="feature-content">
                        <h3>{features[activeFeature].title}</h3>
                        <p>{features[activeFeature].description}</p>
                        <Link to="/register" className="feature-cta">Try it now <FaArrowRight /></Link>
                    </div>
                </div>
            </section>
            
            <section id="about" className="about-section">
                <div className="section-header">
                    <h2>About ChemConcept Bridge</h2>
                    <p>Our mission is to make chemistry education accessible to everyone</p>
                </div>
                
                <div className="about-content">
                    <div className="about-image">
                        <div className="image-container">
                            <img src="/images/nandan-nilekani.svg" alt="Ansu Maria Benny" />
                            <div className="founder-info">
                                <h3>Ansu Maria Benny</h3>
                                <p>Chemistry Educator</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="about-text">
                        <h3>Empowering the Next Generation</h3>
                        <p>ChemConcept Bridge was founded with a vision to transform how chemistry is taught and learned. We believe that understanding complex chemical concepts should be intuitive and engaging.</p>
                        <p>Our platform combines cutting-edge technology with proven educational methodologies to create an immersive learning experience that adapts to each student's needs.</p>
                        <div className="about-features">
                            <div className="about-feature">
                                <FaUserGraduate className="about-icon" />
                                <div>
                                    <h4>Student-Centered Approach</h4>
                                    <p>Personalized learning paths that adapt to individual needs</p>
                                </div>
                            </div>
                            <div className="about-feature">
                                <FaChalkboardTeacher className="about-icon" />
                                <div>
                                    <h4>Expert-Designed Content</h4>
                                    <p>Curriculum developed by leading chemistry educators</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="testimonials" className="testimonials-section">
                <div className="section-header">
                    <h2>What Our Users Say</h2>
                    <p>Success stories from students and educators</p>
                </div>
                
                <div className="testimonials-container">
                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <p>"ChemConcept Bridge transformed how I understand molecular structures. The 3D visualizations made complex concepts click for me in ways textbooks never could."</p>
                        </div>
                        <div className="testimonial-author">
                            <div className="author-avatar">JS</div>
                            <div className="author-info">
                                <h4>Jennifer Smith</h4>
                                <p>Chemistry Student, Stanford University</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="testimonial-card">
                        <div className="testimonial-content">
                            <p>"As an educator, I've seen remarkable improvement in student engagement and test scores since implementing ChemConcept Bridge in my classroom."</p>
                        </div>
                        <div className="testimonial-author">
                            <div className="author-avatar">DP</div>
                            <div className="author-info">
                                <h4>Dr. Paul Johnson</h4>
                                <p>Chemistry Professor, MIT</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="contact" className="contact-section">
                <div className="contact-content">
                    <h2>Ready to transform your chemistry education?</h2>
                    <p>Join thousands of students and educators who are already experiencing the benefits of ChemConcept Bridge.</p>
                    <Link to="/register" className="cta-button">Get Started Today</Link>
                </div>
            </section>
            
            <footer className="site-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <div className="logo-icon">
                            <FaFlask className="flask-icon" />
                        </div>
                        <span className="logo-text">ChemConcept Bridge</span>
                    </div>
                    
                    <div className="footer-links">
                        <div className="footer-column">
                            <h3>Platform</h3>
                            <ul>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#testimonials">Testimonials</a></li>
                            </ul>
                        </div>
                        
                        <div className="footer-column">
                            <h3>Resources</h3>
                            <ul>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">API</a></li>
                                <li><a href="#">Support</a></li>
                            </ul>
                        </div>
                        
                        <div className="footer-column">
                            <h3>Company</h3>
                            <ul>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} ChemConcept Bridge. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;