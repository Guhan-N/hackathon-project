import React, { useEffect, useState, useRef } from 'react';
import { User, Users, Clock } from 'lucide-react';

const Presence = ({ provider, adminName, pastCollaborators = [] }) => {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!provider) return;

    const updateUsers = () => {
      const awarenessState = provider.awareness.getStates();
      // Extract all valid user objects
      const allUsers = Array.from(awarenessState.values())
        .map(state => state.user)
        .filter(Boolean); // Filter out empty states if any
      
      // Deduplicate users by name
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user.name, user])).values()
      );
      
      setUsers(uniqueUsers);
    };

    provider.awareness.on('change', updateUsers);
    // Initial fetch
    updateUsers();

    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center group cursor-pointer hover:bg-gray-100 p-1.5 rounded-full transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex -space-x-2 overflow-hidden items-center">
          {users.slice(0, 5).map((user, i) => (
            <div
              key={i}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-105"
              style={{ backgroundColor: user?.color || '#ccc' }}
              title={user?.name || 'Anonymous'}
            >
              {user?.name?.charAt(0).toUpperCase() || <User size={14} />}
            </div>
          ))}
          {users.length > 5 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-gray-500 text-[10px] font-bold">
              +{users.length - 5}
            </div>
          )}
        </div>
        <div className="ml-3 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block pr-2">
          {users.length} {users.length === 1 ? 'Collaborator' : 'Collaborators'}
        </div>
      </div>

      {isOpen && users.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Collaborators</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {users.map((user, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                <div
                  className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: user?.color || '#ccc' }}
                >
                  {user?.name?.charAt(0).toUpperCase() || <User size={10} />}
                </div>
                <div className="flex-1 truncate text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span>{user?.name || 'Anonymous User'}</span>
                  {user?.name && user.name === adminName && (
                    <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      (Admin)
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="Online"></div>
              </div>
            ))}

            {/* Past Collaborators Section */}
            {pastCollaborators.filter(pc => !users.some(active => active.name === pc.name)).length > 0 && (
              <>
                <div className="px-4 py-2 mt-2 border-y border-gray-100 bg-gray-50/50 flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400" />
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Past Collaborators</h3>
                </div>
                {pastCollaborators
                  .filter(pc => !users.some(active => active.name === pc.name))
                  .map((pc, i) => (
                    <div key={`past-${i}`} className="flex items-center gap-3 px-4 py-2 opacity-60 hover:bg-gray-50 hover:opacity-100 transition-all cursor-default">
                      <div className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-500 text-[10px] font-bold">
                        {pc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate text-sm font-medium text-gray-600 flex items-center gap-2">
                        <span>{pc.name}</span>
                        {pc.name === adminName && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            (Admin)
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-semibold" title="Offline">Offline</div>
                    </div>
                  ))
                }
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Presence;
