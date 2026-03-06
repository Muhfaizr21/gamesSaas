'use client';

import { useState } from 'react';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface RatingModalProps {
    orderId: number;
    productId: number;
    productName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RatingModal({ orderId, productId, productName, isOpen, onClose, onSuccess }: RatingModalProps) {
    const { token } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, productId, rating, comment })
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.message || 'Gagal mengirim ulasan');
            }
        } catch (error) {
            setError('Terjadi kesalahan jaringan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>

                <div className="p-6 text-center">
                    {isSuccess ? (
                        <div className="py-8 flex flex-col items-center">
                            <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Terima Kasih!</h3>
                            <p className="text-zinc-400 text-sm">Ulasan kamu sangat berarti bagi kami.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-lg font-bold text-white mb-2">Beri Ulasan</h3>
                            <p className="text-xs text-zinc-500 mb-6">Bagaimana pengalamanmu topup <strong className="text-primary">{productName}</strong>?</p>

                            <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`h-10 w-10 transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-zinc-700'}`}
                                    />
                                ))}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Bagikan pendapat jujurmu... (opsional)"
                                rows={3}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none resize-none mb-2"
                            />

                            {error && <p className="text-red-400 text-xs font-medium mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirim Ulasan"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
