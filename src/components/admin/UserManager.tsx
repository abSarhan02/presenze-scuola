/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { UserProfile, ClassItem, Child } from '@/types';
import { ShieldCheck, UserCheck, UserPlus } from 'lucide-react';

interface Props {
    classes: ClassItem[];
    childrenList: Child[];
}

export function UserManager({ classes, childrenList }: Props) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'operator' | 'parent'>('operator');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };

            const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAppForUserCreation');
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                newEmail,
                newPassword
            );

            const newUserUid = userCredential.user.uid;

            await setDoc(doc(db, 'users', newUserUid), {
                email: newEmail,
                role: newRole,
                assignedClassIds: [],
                childIds: [],
            });

            setMessage(`Utente (${newRole}) creato con successo!`);
            setNewEmail('');
            setNewPassword('');
            fetchUsers();
        } catch (err: any) {
            setMessage(`Errore: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleClass = async (classId: string) => {
        if (!selectedUser) return;
        const current = selectedUser.assignedClassIds || [];
        const updated = current.includes(classId)
            ? current.filter((id) => id !== classId)
            : [...current, classId];

        await updateDoc(doc(db, 'users', selectedUser.uid), { assignedClassIds: updated });
        setSelectedUser({ ...selectedUser, assignedClassIds: updated });
        fetchUsers();
    };

    const handleToggleChild = async (childId: string) => {
        if (!selectedUser) return;
        const current = selectedUser.childIds || [];
        const updated = current.includes(childId)
            ? current.filter((id) => id !== childId)
            : [...current, childId];

        await updateDoc(doc(db, 'users', selectedUser.uid), { childIds: updated });
        setSelectedUser({ ...selectedUser, childIds: updated });
        fetchUsers();
    };

    return (
        <div className="space-y-6">
            {/* Form Creazione Utente */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
                    <UserPlus size={16} className="text-blue-600" /> Crea Nuovo Utente
                </h3>

                {message && (
                    <div className="mb-4 p-3 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                        {message}
                    </div>
                )}

                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        type="email"
                        placeholder="Email utente"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as 'operator' | 'parent')}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="operator">Operatore</option>
                        <option value="parent">Genitore</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Creazione...' : 'Crea Utente'}
                    </button>
                </form>
            </div>

            {/* Assegnazioni */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Utenti Registrati</h3>
                    <div className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <button
                                key={u.uid}
                                onClick={() => setSelectedUser(u)}
                                className={`w-full text-left py-3 px-2 rounded-lg transition flex items-center justify-between ${selectedUser?.uid === u.uid ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">{u.email}</p>
                                    <span className="text-[10px] font-medium uppercase text-gray-500">{u.role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                    {!selectedUser ? (
                        <p className="text-xs text-gray-500 text-center py-8">
                            Seleziona un utente dalla lista a sinistra per gestirne le abilitazioni.
                        </p>
                    ) : selectedUser.role === 'admin' ? (
                        <p className="text-xs text-gray-500 text-center py-8">
                            L Amministratore ha già accesso completo.
                        </p>
                    ) : selectedUser.role === 'operator' ? (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                                <ShieldCheck size={16} className="text-blue-600" /> Classi Assegnate all Operatore ({selectedUser.email})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {classes.map((c) => {
                                    const isAssigned = (selectedUser.assignedClassIds || []).includes(c.id);
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => handleToggleClass(c.id)}
                                            className={`p-3 rounded-lg border text-xs font-medium text-left transition flex justify-between items-center ${isAssigned
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>Classe {c.name}</span>
                                            <span>{isAssigned ? '✓ Abilitato' : '+ Abilita'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                                <UserCheck size={16} className="text-blue-600" /> Figli Associati al Genitore ({selectedUser.email})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {childrenList.map((child) => {
                                    const isAssigned = (selectedUser.childIds || []).includes(child.id);
                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => handleToggleChild(child.id)}
                                            className={`p-3 rounded-lg border text-xs font-medium text-left transition flex justify-between items-center ${isAssigned
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>{child.firstName} {child.lastName}</span>
                                            <span>{isAssigned ? '✓ Collegato' : '+ Collega'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}