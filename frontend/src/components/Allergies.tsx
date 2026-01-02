import { useState, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { supabase, Allergy } from '../lib/supabase';
import AllergyDetails from './AllergyDetails';

export default function Allergies() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState('');

  useEffect(() => {
    fetchAllergies();

    const channel = supabase
      .channel('allergies_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'allergies' },
        () => {
          fetchAllergies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllergies = async () => {
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching allergies:', error);
    } else {
      setAllergies(data || []);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergyName.trim()) return;

    const { error } = await supabase
      .from('allergies')
      .insert([{ name: newAllergyName.trim() }]);

    if (error) {
      console.error('Error adding allergy:', error);
    } else {
      setNewAllergyName('');
      setIsAdding(false);
      fetchAllergies();
    }
  };

  const handleDeleteAllergy = async () => {
    if (!selectedAllergy) return;

    const { error } = await supabase
      .from('allergies')
      .delete()
      .eq('id', selectedAllergy.id);

    if (error) {
      console.error('Error deleting allergy:', error);
    } else {
      setSelectedAllergy(null);
      fetchAllergies();
    }
  };

  if (selectedAllergy) {
    return (
      <AllergyDetails
        allergy={selectedAllergy}
        onBack={() => setSelectedAllergy(null)}
        onDelete={handleDeleteAllergy}
      />
    );
  }

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronDown
              className={`w-5 h-5 text-stone-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
            <h2 className="text-lg font-semibold text-stone-900">Allergies</h2>
            {allergies.length > 0 && (
              <span className="text-sm text-stone-600 font-medium">({allergies.length})</span>
            )}
          </button>
          {isExpanded && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Allergy</span>
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-2 mt-3">
            {isAdding && (
              <div className="bg-white rounded-lg border border-stone-300 p-3">
                <input
                  type="text"
                  value={newAllergyName}
                  onChange={(e) => setNewAllergyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAllergy();
                    } else if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewAllergyName('');
                    }
                  }}
                  placeholder="Enter allergy name"
                  className="w-full text-sm text-stone-900 placeholder-stone-400 outline-none mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAllergy}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-900 rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewAllergyName('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                onClick={() => setSelectedAllergy(allergy)}
                className="bg-stone-50 rounded-lg border border-stone-200 p-3 cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <p className="font-medium text-stone-900">{allergy.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
