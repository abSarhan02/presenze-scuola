'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Child, ClassItem } from '@/types';
import { Check, Calendar } from 'lucide-react';

export default function OperatorPage() {
    const { profile } = useAuth();
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [children, setChildren] = useState<Child[]>([]);
    const [attendances, setAttendances] = useState<Record<string, string>>({});

    const today = new Date().toISOString().split('T')[0];
    useEffect(() => {
        async function fetchAssignedClasses() {
            // Filtriamo per assicurarci che ci siano ID validi e non stringhe vuote
            const validClassIds = profile?.assignedClassIds?.filter((id) => id && id.trim() !== '') || [];

            if (validClassIds.length === 0) {
                setClasses([]);
                return;
            }

            try {
                const q = query(
                    collection(db, 'classes'),
                    where('__name__', 'in', validClassIds)
                );
                const snap = await getDocs(q);
                setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassItem)));
            } catch (error) {
                console.error('Errore durante il recupero delle classi:', error);
            }
        }

        fetchAssignedClasses();
    }, [profile]);
    useEffect(() => {
        async function fetchChildrenAndAttendance() {
            if (!selectedClassId) return;

            const qChildren = query(collection(db, 'children'), where('classId', '==', selectedClassId));
            const childSnap = await getDocs(qChildren);
            const childList = childSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Child));
            setChildren(childList);

            const qAtt = query(
                collection(db, 'attendances'),
                where('classId', '==', selectedClassId),
                where('date', '==', today)
            );
            const attSnap = await getDocs(qAtt);
            const attMap: Record<string, string> = {};
            attSnap.docs.forEach((d) => {
                attMap[d.data().childId] = d.id;
            });
            setAttendances(attMap);
        }

        fetchChildrenAndAttendance();
    }, [selectedClassId, today]);

    const toggleAttendance = async (childId: string) => {
        const existingDocId = attendances[childId];

        if (existingDocId) {
            await deleteDoc(doc(db, 'attendances', existingDocId));
            setAttendances((prev) => {
                const copy = { ...prev };
                delete copy[childId];
                return copy;
            });
        } else {
            const docRef = await addDoc(collection(db, 'attendances'), {
                childId,
                classId: selectedClassId,
                date: today,
                timestamp: new Date().toISOString(),
            });
            setAttendances((prev) => ({ ...prev, [childId]: docRef.id }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Registro Presenze Operatore" />

            <main className="max-w-3xl mx-auto px-6 pb-12 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <label className="block text-xs font-semibold text-gray-700 uppercase">
                        Seleziona Classe Assegnata
                    </label>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="">Seleziona una classe</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>Classe {c.name}</option>
                        ))}
                    </select>
                </div>

                {selectedClassId && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Appello del giorno</h3>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Calendar size={14} /> {today}
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {children.length === 0 ? (
                                <p className="py-4 text-xs text-gray-500 text-center">Nessun bambino iscritto in questa classe.</p>
                            ) : (
                                children.map((c) => {
                                    const isPresent = !!attendances[c.id];
                                    return (
                                        <div key={c.id} className="py-3 flex justify-between items-center">
                                            <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                                            <button
                                                onClick={() => toggleAttendance(c.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${isPresent
                                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                                    }`}
                                            >
                                                {isPresent && <Check size={14} />}
                                                {isPresent ? 'Presente' : 'Segna Presente'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}