import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../lib/ToastContext';
import axios from 'axios';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/admin/login', {
                email,
                password
            });

            if (response.data.token) {
                localStorage.setItem('admin_token', response.data.token);
                localStorage.setItem('admin_email', response.data.user_email);
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('last_activity', Date.now().toString());

                addToast("Welcome back, Admin!", "success");
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail
                || error.message
                || "Login failed. Check server connection.";
            addToast(`Error: ${msg}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-pro">
            <div className="login-container">
                <div className="login-card glass-panel">
                    <div className="icon-header">
                        <div className="shield-icon-wrapper">
                            <ShieldCheck size={40} className="text-primary" />
                        </div>
                        <h2>Admin Portal</h2>
                        <p className="text-dim">Secure Access Point</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group-pro">
                            <label>Email Identity</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="input-pro"
                            />
                        </div>

                        <div className="form-group-pro">
                            <label>Passkey</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-pro"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="eye-btn"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-login-pro"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="spinner-sm"></span> Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    <Lock size={16} /> Authenticate
                                </span>
                            )}
                        </button>

                        <div className="login-footer">
                            <p className="text-xs text-dim">
                                This system is monitored. Unauthorized access is prohibited.
                            </p>
                            <div className="demo-credentials mt-4 p-2 rounded bg-white/5 text-xs text-center border border-white/10">
                                <span className="block text-primary font-mono mb-1">Demo Access</span>
                                <span className="opacity-75">admin@example.com</span> • <span className="opacity-75">admin123</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .login-page-pro {
                    min-height: 85vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at center, rgba(30, 41, 59, 0.3) 0%, transparent 70%);
                }

                .login-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 3rem 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    position: relative;
                    overflow: hidden;
                }

                .login-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
                }

                .icon-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .shield-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                }

                .icon-header h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                }

                .form-group-pro {
                    margin-bottom: 1.5rem;
                }

                .form-group-pro label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.5rem;
                    margin-left: 2px;
                }

                .input-pro {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    color: white;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }

                .input-pro:focus {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                    outline: none;
                }

                .password-wrapper {
                    position: relative;
                }

                .eye-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.2s;
                }

                .eye-btn:hover {
                    color: white;
                }

                .btn-login-pro {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 1rem;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .btn-login-pro:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
                }

                .btn-login-pro:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
