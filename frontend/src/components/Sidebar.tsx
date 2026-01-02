import React from 'react';
import { Plus, Users, ListTodo, FileText, Globe, Settings, HelpCircle, DollarSign, MessageSquare, Keyboard } from 'lucide-react';
export function Sidebar() {
  return <div className="w-52 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                Daniels
              </span>
              <span className="text-gray-400">▼</span>
            </div>
            <div className="text-xs text-gray-500 truncate">
              dan@lab.c...
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center text-xs">
              ⌘
            </div>
          </button>
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-3">
        <button className="w-full bg-gray-900 text-white rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-800">
          <Plus size={18} />
          New session
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Users size={18} />
          <span>View sessions</span>
          <span className="ml-auto text-gray-400">›</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <ListTodo size={18} />
          <span>Tasks</span>
        </button>

        <div className="mt-4 mb-2 px-3 text-xs font-medium text-gray-500">
          Templates
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <FileText size={18} />
          <span>Template library</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Globe size={18} />
          <span>Community</span>
        </button>

        <div className="mt-4 mb-2 px-3 text-xs font-medium text-gray-500">
          Team
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Users size={18} />
          <span>Team</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <DollarSign size={18} />
          <span>Earn $50</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <MessageSquare size={18} />
          <span>Request a feature</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          <Keyboard size={18} />
          <span>Shortcuts</span>
          <span className="ml-auto text-xs text-gray-500">S</span>
        </button>
        <button className="w-full bg-amber-50 text-amber-900 rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-sm font-medium hover:bg-amber-100">
          <HelpCircle size={18} />
          Help
        </button>
      </div>
    </div>;
}