'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Navbar({ title }: { title: string }) {
    const { profile, logout } = useAuth();

    return (
        <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center mb-8">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {profile && (
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <User size={12} /> {profile.email} • <span className="capitalize">{profile.role}</span>
                    </p>
                )}
            </div>
            <button
                onClick={logout}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1.5"
            >
                <LogOut size={14} /> Esci
            </button>
        </header>
    );
}