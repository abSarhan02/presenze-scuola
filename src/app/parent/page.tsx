'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext'; // Usa la tua cartella context/contexts
import { Navbar } from '@/components/Navbar';
import { Child, Attendance } from '@/types';
import { UserCheck, UserX, Calendar, Clock } from 'lucide-react';

export default function ParentDashboard() {
    const { profile } = useAuth(); // Usa 'profile' come definito nel tuo AuthContext
    const [children, setChildren] = useState<Child[]>([]);
    const [attendances, setAttendances] = useState<Record<string, Attendance>>({});
    const [loading, setLoading] = useState(true);

    // Data di oggi in formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchParentData = async () => {
            // Se non ci sono figli associati nel profilo, interrompiamo la carica
            if (!profile?.childIds || profile.childIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const childrenData: Child[] = [];

                // Recuperiamo i dati dei soli figli associati
                for (const childId of profile.childIds) {
                    if (!childId || childId.trim() === '') continue; // Evita stringhe vuote o ID non validi

                    const childDoc = await getDoc(doc(db, 'children', childId));
                    if (childDoc.exists()) {
                        childrenData.push({ id: childDoc.id, ...childDoc.data() } as Child);
                    }
                }
                setChildren(childrenData);

                // Recuperiamo le presenze di oggi per i figli trovati
                if (childrenData.length > 0) {
                    const validChildIds = childrenData.map((c) => c.id);
                    const attQuery = query(
                        collection(db, 'attendances'),
                        where('date', '==', todayStr),
                        where('childId', 'in', validChildIds)
                    );
                    const attSnap = await getDocs(attQuery);

                    const attMap: Record<string, Attendance> = {};
                    attSnap.docs.forEach((d) => {
                        const data = { id: d.id, ...d.data() } as Attendance;
                        attMap[data.childId] = data;
                    });
                    setAttendances(attMap);
                }
            } catch (err) {
                console.error('Errore durante il caricamento dei dati genitore:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchParentData();
    }, [profile, todayStr]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Area Genitore" />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Stato Presenze Figli</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Visualizza la presenza dei tuoi figli in tempo reale.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 shadow-sm">
                        <Calendar size={14} className="text-blue-600" />
                        <span>{todayStr}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-xs text-gray-500">
                        Caricamento informazioni in corso...
                    </div>
                ) : children.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                        <p className="text-sm font-medium text-gray-700">Nessun figlio associato a questo account.</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Contatta lamministratore della scuola per associare i tuoi figli al tuo profilo.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.map((child) => {
                            const att = attendances[child.id];
                            const isPresent = !!att;

                            return (
                                <div
                                    key={child.id}
                                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {child.firstName} {child.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Data di nascita: {child.dateOfBirth || 'Non specificata'}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isPresent
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                }`}
                                        >
                                            {isPresent ? (
                                                <>
                                                    <UserCheck size={14} /> Presente Oggi
                                                </>
                                            ) : (
                                                <>
                                                    <UserX size={14} /> Non registrato
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {att && att.timestamp && (
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} /> Ora di spunta:
                                            </span>
                                            <span className="font-medium text-gray-700">
                                                {new Date(att.timestamp).toLocaleTimeString('it-IT', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}