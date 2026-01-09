import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFlask } from 'react-icons/fa';
import './HomePage.css'; // Reusing HomePage styles for consistency

const Navbar = ({ user }) => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

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

    // If not on home page, always show scrolled style (white background)
    const headerClass = `home-header ${scrolled || !isHomePage ? 'scrolled' : ''}`;

    return (
        <header className={headerClass}>
            <div className="logo-container">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <div className="logo-icon">
                        <FaFlask className="flask-icon" />
                        <div className="atom-orbit"></div>
                    </div>
                    <span className="logo-text">ChemConcept Bridge</span>
                </Link>
            </div>
            <nav className="header-nav">
                {isHomePage ? (
                    <>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#testimonials" className="nav-link">Testimonials</a>
                        <Link to="/subscription" className="nav-link">Pricing</Link>
                        <a href="#contact" className="nav-link">Contact</a>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/subscription" className="nav-link">Pricing</Link>
                    </>
                )}
                {user ? (
                    <Link to="/dashboard" className="login-button">Dashboard</Link>
                ) : (
                    <>
                        <Link to="/login" className="login-button">Sign In</Link>
                        <Link to="/register" className="register-button">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
