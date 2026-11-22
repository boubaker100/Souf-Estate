import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Instagram, Facebook, Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

// TODO: ضع رابط الـ API (Render backend)
const API_BASE = import.meta.env.VITE_API_URL || 'https://souf-estate.onrender.com';

const Footer = () => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null); // 'sending' | 'success' | 'error' | null
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setValidationError('الرجاء كتابة رسالة قبل الإرسال');
            return;
        }
        setValidationError('');
        setStatus('sending');

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user?.fullName || user?.firstName || 'مستخدم',
                    email: user?.primaryEmailAddress?.emailAddress || '',
                    message: message.trim(),
                }),
            });

            if (!res.ok) throw new Error('Request failed');
            setStatus('success');
            setMessage('');
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            setStatus('error');
            setTimeout(() => setStatus(null), 5000);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <footer className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-300 overflow-hidden">
            {/* Gradient orbs خلفية */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl py-16">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12"
                >
                    {/* العمود 1: الشعار + الوصف + السوشيال */}
                    <motion.div variants={itemVariants} className="lg:col-span-4">
                        <motion.img
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="w-auto h-12"
                            src="/LOGO3.webp"
                            alt="Souf Estate Logo"
                        />

                        <p className="text-base leading-relaxed text-gray-400 mt-6">
                            منصة عقارية جزائرية موثوقة. اعثر على منزل أحلامك أو أنشر عقارك بسهولة وأمان.
                        </p>

                        <div className="flex items-center gap-3 mt-8">
                            {/* Facebook */}
                            <motion.a
                                href="#" // TODO: ضع رابط صفحة الفيسبوك هنا
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="فيسبوك"
                                whileHover={{ scale: 1.15, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center w-10 h-10 text-white transition-colors bg-white/5 border border-white/10 rounded-full hover:bg-blue-600 hover:border-blue-500"
                            >
                               <Facebook className="w-5 h-5" />
                            </motion.a>

                            {/* Instagram */}
                            <motion.a
                                href="#" // TODO: ضع رابط صفحة الإنستغرام هنا
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="إنستغرام"
                                whileHover={{ scale: 1.15, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center w-10 h-10 text-white transition-colors bg-white/5 border border-white/10 rounded-full hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:border-pink-500"
                            >
                               <Instagram className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </motion.div>

              
                    {/* العمود 3: معلومات التواصل */}
                    <motion.div variants={itemVariants} className="lg:col-span-4">
                        <h3 className="text-lg font-semibold text-white mb-5">معلومات التواصل</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group">
                                <Mail className="w-5 h-5 text-amber-400 mt-0.5 shrink-0 transition-transform group-hover:scale-110" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                                    <a
                                        href="mailto:contact@example.com" // TODO: ضع بريدك الإلكتروني هنا
                                        className="text-sm text-gray-300 hover:text-amber-400 transition-colors break-all"
                                    >
                                        boubakerboudinadev@gmail.com {/* TODO: بدّل هذا ببريدك */}
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <MapPin className="w-5 h-5 text-amber-400 mt-0.5 shrink-0 transition-transform group-hover:scale-110" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">الموقع</p>
                                    <p className="text-sm text-gray-300"> الوادي</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Divider + Copyright + Developer Credit */}
                <div className="mt-14 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 text-center md:text-right">
                            © {new Date().getFullYear()} Souf Estate — جميع الحقوق محفوظة
                        </p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-gray-500"
                        >
                            Developed{' '}
                            <span className="text-amber-400"></span>{' '}
                            by{' '}
                            <span className="font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                Boubaker Boudina
                            </span>
                        </motion.p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;