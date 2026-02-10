import { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import DigiLockerModal from './DigiLockerModal';
import type { DigiLockerResponse } from '../../types';

interface DigiLockerButtonProps {
    onVerified: (data: DigiLockerResponse) => void;
    isVerified: boolean;
}

export default function DigiLockerButton({ onVerified, isVerified }: DigiLockerButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isVerified) {
        return (
            <div className="w-full bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-orange-400 font-semibold">Demo Verified</h4>
                        <p className="text-orange-500/60 text-xs">Verified via DigiLocker (Demo)</p>
                    </div>
                </div>
                <span className="text-orange-500 text-sm font-medium px-3 py-1 bg-orange-500/10 rounded-full">
                    Completed
                </span>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full group relative overflow-hidden bg-[#0034a7] hover:bg-[#002a87] border border-blue-500/30 rounded-xl p-1 transition-all duration-300"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-center justify-center gap-3 py-3 bg-[#0034a7] group-hover:bg-[#002a87] rounded-lg transition-colors">
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">Verify with DigiLocker</span>
                </div>
            </button>

            <DigiLockerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(data) => {
                    setIsModalOpen(false);
                    onVerified(data);
                }}
            />
        </>
    );
}
