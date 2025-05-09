import { X } from "lucide-react";
import { useauthStore } from "../store/authstore.js";
import { usechatstore } from "../store/chatstore.js";

function ChatHeader() {
  const { onlineUsers } = useauthStore();
  const { selecteduser, setselecteduser } = usechatstore();

  return (
    <div>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selecteduser.profilepic} alt={selecteduser.name} />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selecteduser.name}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selecteduser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button onClick={() => setselecteduser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
