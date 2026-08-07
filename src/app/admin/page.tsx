/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Navbar } from '@/components/Navbar';
import { SchoolsManager } from '@/components/admin/SchoolsManager';
import { ChildrenManager } from '@/components/admin/ChildrenManager';
import { UserManager } from '@/components/admin/UserManager';
import { School as SchoolIcon, Users, UserCheck } from 'lucide-react';
import { School, ClassItem, Child } from '@/types';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'schools' | 'children' | 'users'>('schools');
    const [schools, setSchools] = useState<School[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [children, setChildren] = useState<Child[]>([]);

    const loadData = useCallback(async () => {
        try {
            const sSnap = await getDocs(collection(db, 'schools'));
            setSchools(sSnap.docs.map((d) => ({ id: d.id, name: d.data().name } as School)));

            const cSnap = await getDocs(collection(db, 'classes'));
            setClasses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassItem)));

            const chSnap = await getDocs(collection(db, 'children'));
            setChildren(chSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Child)));
        } catch (error) {
            console.error('Errore nel caricamento dei dati admin:', error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Pannello Amministrazione" />

            <main className="max-w-5xl mx-auto px-6 pb-12 pt-6">
                {/* Navigazione a Tab */}
                <div className="flex border-b border-gray-200 mb-6 gap-8">
                    <button
                        type="button"
                        onClick={() => setActiveTab('schools')}
                        className={`cursor-pointer pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${activeTab === 'schools'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <SchoolIcon size={18} /> Scuole e Classi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('children')}
                        className={`cursor-pointer pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${activeTab === 'children'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users size={18} /> Anagrafica Bambini
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`cursor-pointer pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${activeTab === 'users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UserCheck size={18} /> Gestione Utenti
                    </button>
                </div>

                {/* Contenuto Tab Attiva */}
                {activeTab === 'schools' && (
                    <SchoolsManager schools={schools} classes={classes} onRefresh={loadData} />
                )}
                {activeTab === 'children' && (
                    <ChildrenManager childrenList={children} schools={schools} classes={classes} onRefresh={loadData} />
                )}
                {activeTab === 'users' && (
                    <UserManager classes={classes} childrenList={children} />
                )}
            </main>
        </div>
    );
}