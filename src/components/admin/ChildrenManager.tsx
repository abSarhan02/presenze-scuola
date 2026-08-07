'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Child, School, ClassItem } from '@/types';
import { Trash2, Edit2, X, Check } from 'lucide-react';

interface Props {
    childrenList: Child[];
    schools: School[];
    classes: ClassItem[];
    onRefresh: () => void;
}

export function ChildrenManager({ childrenList, schools, classes, onRefresh }: Props) {
    // Stato per la creazione
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [classId, setClassId] = useState('');

    // Stato per la modifica
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editBirthDate, setEditBirthDate] = useState('');
    const [editSchoolId, setEditSchoolId] = useState('');
    const [editClassId, setEditClassId] = useState('');

    // Aggiungi Bambino
    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        await addDoc(collection(db, 'children'), {
            firstName,
            lastName,
            birthDate,
            schoolId,
            classId,
        });
        setFirstName('');
        setLastName('');
        setBirthDate('');
        setSchoolId('');
        setClassId('');
        onRefresh();
    };

    // Prepara la Modifica
    const startEditing = (child: Child) => {
        setEditingChildId(child.id);
        setEditFirstName(child.firstName);
        setEditLastName(child.lastName);
        setEditBirthDate(child.dateOfBirth || '');
        setEditSchoolId(child.schoolId || '');
        setEditClassId(child.classId || '');
    };

    // Annulla Modifica
    const cancelEditing = () => {
        setEditingChildId(null);
    };

    // Salva Modifica
    const handleUpdateChild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingChildId) return;

        await updateDoc(doc(db, 'children', editingChildId), {
            firstName: editFirstName,
            lastName: editLastName,
            birthDate: editBirthDate,
            schoolId: editSchoolId,
            classId: editClassId,
        });

        setEditingChildId(null);
        onRefresh();
    };

    // Elimina Bambino
    const handleDeleteChild = async (id: string) => {
        if (confirm('Eliminare il bambino registrato?')) {
            await deleteDoc(doc(db, 'children', id));
            onRefresh();
        }
    };

    return (
        <div className="space-y-6">
            {/* Form di Iscrizione / Creazione */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Iscrizione Bambino</h3>
                <form onSubmit={handleAddChild} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Cognome"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <select
                        value={schoolId}
                        onChange={(e) => {
                            setSchoolId(e.target.value);
                            setClassId(''); // Reset classe quando cambia scuola
                        }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Seleziona Scuola</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none md:col-span-2"
                        required
                    >
                        <option value="">Seleziona Classe</option>
                        {classes
                            .filter((c) => c.schoolId === schoolId)
                            .map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                    </select>
                    <button className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition">
                        Registra Bambino
                    </button>
                </form>
            </div>

            {/* Lista Bambini Anagrafica */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Anagrafica Iscritti</h3>
                <div className="divide-y divide-gray-100">
                    {childrenList.map((c) => {
                        const isEditing = editingChildId === c.id;
                        const school = schools.find((s) => s.id === c.schoolId);
                        const classObj = classes.find((cl) => cl.id === c.classId);

                        if (isEditing) {
                            return (
                                <form
                                    key={c.id}
                                    onSubmit={handleUpdateChild}
                                    className="py-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 my-2 space-y-3"
                                >
                                    <p className="text-xs font-semibold text-blue-900">Modifica Dati & Riassegna Classe</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={editFirstName}
                                            onChange={(e) => setEditFirstName(e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={editLastName}
                                            onChange={(e) => setEditLastName(e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={editBirthDate}
                                            onChange={(e) => setEditBirthDate(e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2"
                                        />
                                        <select
                                            value={editSchoolId}
                                            onChange={(e) => {
                                                setEditSchoolId(e.target.value);
                                                setEditClassId('');
                                            }}
                                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2"
                                        >
                                            <option value="">-- Nessuna Scuola --</option>
                                            {schools.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={editClassId}
                                            onChange={(e) => setEditClassId(e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg p-2 md:col-span-2"
                                        >
                                            <option value="">-- Nessuna Classe --</option>
                                            {classes
                                                .filter((cl) => cl.schoolId === editSchoolId)
                                                .map((cl) => (
                                                    <option key={cl.id} value={cl.id}>
                                                        {cl.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                                        >
                                            <X size={14} /> Annulla
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                                        >
                                            <Check size={14} /> Salva Cambiamenti
                                        </button>
                                    </div>
                                </form>
                            );
                        }

                        return (
                            <div key={c.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {c.firstName} {c.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        <span className={!school ? 'text-amber-600 font-medium' : ''}>
                                            {school?.name || 'Scuola N/D'}
                                        </span>{' '}
                                        • Classe{' '}
                                        <span className={!classObj ? 'text-amber-600 font-medium' : ''}>
                                            {classObj?.name || 'N/D'}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => startEditing(c)}
                                        className="text-gray-400 hover:text-blue-600 p-1.5 transition rounded-lg hover:bg-blue-50"
                                        title="Modifica / Riassegna"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteChild(c.id)}
                                        className="text-gray-400 hover:text-red-600 p-1.5 transition rounded-lg hover:bg-red-50"
                                        title="Elimina"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}