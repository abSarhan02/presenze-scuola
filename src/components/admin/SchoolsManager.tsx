'use client';

import { useState } from 'react';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { School, ClassItem } from '@/types';
import { Trash2, Plus } from 'lucide-react';

interface Props {
    schools: School[];
    classes: ClassItem[];
    onRefresh: () => void;
}

export function SchoolsManager({ schools, classes, onRefresh }: Props) {
    const [schoolName, setSchoolName] = useState('');
    const [className, setClassName] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    const handleAddSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolName.trim()) return;
        await addDoc(collection(db, 'schools'), { name: schoolName.trim() });
        setSchoolName('');
        onRefresh();
    };

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!className.trim() || !selectedSchoolId) return;
        await addDoc(collection(db, 'classes'), { name: className.trim(), schoolId: selectedSchoolId });
        setClassName('');
        onRefresh();
    };

    const handleDeleteSchool = async (id: string) => {
        if (confirm('Eliminare la scuola?')) {
            await deleteDoc(doc(db, 'schools', id));
            onRefresh();
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (confirm('Eliminare la classe?')) {
            await deleteDoc(doc(db, 'classes', id));
            onRefresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Scuola */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Nuova Scuola</h3>
                    <form onSubmit={handleAddSchool} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nome scuola"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition flex items-center gap-1">
                            <Plus size={16} /> Aggiungi
                        </button>
                    </form>
                </div>

                {/* Form Classe */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Nuova Classe</h3>
                    <form onSubmit={handleAddClass} className="space-y-3">
                        <select
                            value={selectedSchoolId}
                            onChange={(e) => setSelectedSchoolId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Seleziona scuola</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nome classe (es. 1A)"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition flex items-center gap-1">
                                <Plus size={16} /> Aggiungi
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Lista Scuole e Classi */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Strutture Registrate</h3>
                <div className="grid grid-cols-1 gap-4">
                    {schools.map((s) => (
                        <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                                <button
                                    onClick={() => handleDeleteSchool(s.id)}
                                    className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                {classes.filter((c) => c.schoolId === s.id).map((c) => (
                                    <div key={c.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 font-medium">
                                        <span>Classe {c.name}</span>
                                        <button
                                            onClick={() => handleDeleteClass(c.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs"
                                        >
                                            Rimuovi
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}