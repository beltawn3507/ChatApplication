import { useState, useEffect } from "react";
import { usechatstore } from "../store/chatstore";
import { useauthStore } from "./../store/authstore";
import SidebarSkeleton from "./SidebarSkeleton";
import { Users } from "lucide-react";

const SideBar = () => {
  const { users, selecteduser, isuserloading, getusers, setselecteduser } =
    usechatstore();

  const { onlineUsers } = useauthStore();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    getusers();
  }, []);

  useEffect(() => {
    console.log(selecteduser?.name);
  }, [selecteduser]);

  const filteredUsers = isOnline
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isuserloading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-16 sm:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden sm:block">Contacts</span>
        </div>

        {/* Responsive toggle */}
        <label className="mt-3 flex items-center sm:gap-2 gap-1 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
            <div className="absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-full"></div>
          </div>
          <span className="text-sm font-medium hidden sm:inline">Online</span>
        </label>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setselecteduser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selecteduser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilepic}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
