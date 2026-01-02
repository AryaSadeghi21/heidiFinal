import { useState, useEffect } from 'react';
import { Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { supabase, Condition } from '../lib/supabase';
import ConditionDetails from './ConditionDetails';

export default function Conditions() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);

  useEffect(() => {
    fetchConditions();

    const channel = supabase
      .channel('conditions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conditions' },
        () => {
          fetchConditions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConditions = async () => {
    const { data, error } = await supabase
      .from('conditions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conditions:', error);
    } else {
      setConditions(data || []);
    }
  };

  const handleDeleteCondition = async () => {
    if (!selectedCondition) return;

    const { error } = await supabase
      .from('conditions')
      .delete()
      .eq('id', selectedCondition.id);

    if (error) {
      console.error('Error deleting condition:', error);
    } else {
      setSelectedCondition(null);
      fetchConditions();
    }
  };

  if (selectedCondition) {
    return (
      <ConditionDetails
        condition={selectedCondition}
        onBack={() => setSelectedCondition(null)}
        onDelete={handleDeleteCondition}
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
            <h2 className="text-lg font-semibold text-stone-900">Conditions</h2>
            {conditions.length > 0 && (
              <span className="text-sm text-stone-600 font-medium">({conditions.length})</span>
            )}
          </button>
          {isExpanded && (
            <button
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Condition</span>
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-2 mt-3">
            {conditions.map((condition) => (
              <div
                key={condition.id}
                onClick={() => setSelectedCondition(condition)}
                className="bg-stone-50 rounded-lg border border-stone-200 p-3 cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <p className="font-medium text-stone-900">{condition.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
