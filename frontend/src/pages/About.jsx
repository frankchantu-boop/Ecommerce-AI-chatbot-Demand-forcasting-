import React from 'react';
import { Cpu, Shield, Zap, TrendingUp, Users, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page-pro">
      <div className="container-pro">
        {/* Hero Section */}
        <div className="about-hero">
          <h2 className="section-title text-center">
            Pioneering <span className="text-gradient-pro">Intelligent Commerce</span>
          </h2>
          <p className="hero-text text-center text-dim">
            We are building the neural network of digital retail. Where others see transactions, we see patterns, predictions, and possibilities.
          </p>
        </div>

        {/* Stats Banner (Performance: Simple Flex) */}
        <div className="stats-banner glass-panel">
          <div className="stat-item">
            <span className="stat-value text-gradient-pro">10ms</span>
            <span className="stat-label">Latency</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-gradient-pro">99.9%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-gradient-pro">24/7</span>
            <span className="stat-label">AI Agents</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-gradient-pro">Global</span>
            <span className="stat-label">infrastructure</span>
          </div>
        </div>

        {/* Core Insights Grid */}
        <div className="insights-grid">
          <div className="insight-card glass-panel group">
            <div className="icon-box">
              <Zap size={24} className="text-warn" />
            </div>
            <h3>Hyper-Speed Architecture</h3>
            <p>
              Built on the edge using Vite and optimized React. Our platform pre-fetches data before you even click, delivering instant experiences.
            </p>
          </div>

          <div className="insight-card glass-panel group">
            <div className="icon-box">
              <TrendingUp size={24} className="text-success" />
            </div>
            <h3>Deep Demand Forecasting</h3>
            <p>
              Our backend algorithms analyze market trends in real-time, predicting stock needs and optimizing supply chains automatically.
            </p>
          </div>

          <div className="insight-card glass-panel group">
            <div className="icon-box">
              <Shield size={24} className="text-primary" />
            </div>
            <h3>Fortress Security</h3>
            <p>
              Enterprise-grade encryption meets AI-driven fraud detection. We protect every byte of data with military-precision protocols.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="vision-section glass-panel">
          <div className="vision-content">
            <h3><Cpu size={20} style={{ display: 'inline', marginRight: '10px' }} /> The Vision</h3>
            <p>
              "We believe the future of shopping isn't just about listing products. It's about understanding the user.
              Our AI doesn't just wait for commands; it anticipates needs, curates selections, and handles the logistics
              so humans can focus on creativity."
            </p>
            <div className="vision-footer">
              <span className="author">- The Engineering Team</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .about-page-pro {
                    padding: 4rem 0;
                    animation: fadeIn 0.5s ease-out;
                }

                .about-hero {
                    max-width: 800px;
                    margin: 0 auto 4rem;
                }
                
                .hero-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-top: 1rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .text-center { text-align: center; }

                /* Stats Banner */
                .stats-banner {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 2rem;
                    padding: 2rem;
                    margin-bottom: 4rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                }

                .stat-value {
                    display: block;
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* Insights Grid */
                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 4rem;
                }

                .insight-card {
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                /* Performance: Use translate instead of layout props */
                .insight-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--color-primary);
                }

                .icon-box {
                    width: 50px;
                    height: 50px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .insight-card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: white;
                }

                .insight-card p {
                    color: var(--color-text-dim);
                    line-height: 1.6;
                }

                /* Vision Section */
                .vision-section {
                    padding: 3rem;
                    border-radius: var(--radius-lg);
                    background: linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
                }

                .vision-content h3 {
                    color: var(--color-primary);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                }

                .vision-content p {
                    font-size: 1.1rem;
                    color: #fff;
                    font-style: italic;
                    line-height: 1.8;
                    opacity: 0.9;
                }

                .vision-footer {
                    margin-top: 2rem;
                    text-align: right;
                    color: var(--color-text-dim);
                    font-weight: 600;
                }

                .text-warn { color: #f59e0b; }
                .text-success { color: #10b981; }
                .text-primary { color: #3b82f6; }
            `}</style>
    </div>
  );
};

export default About;
