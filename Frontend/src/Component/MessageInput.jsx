import { useRef, useState } from "react";
import { usechatstore } from "../store/chatstore.js";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const { sendMessages } = usechatstore();
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const imageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

   try {
    const reader=new FileReader();
    // reader.onloadend=()=>{
    //     setImagePreview(reader.result);
    // }
    reader.readAsDataURL(file);
    reader.onload =  () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
    };
   } catch (error) {
     console.log(error);
   }
  };

  const removeChange = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  //   this function will handle send of the form it will use the function sendmessage from chatstore and send the image or text
  // then it will clear the form
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      });
      // clear the states
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    //image text send button sendmessage will be called here
    <div>
      {/* if imagepreview state is there then show the image */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeChange}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* chat image input */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message ... "
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={imageChange}
            ref={fileInputRef}
          />
          <button
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        {/* send button */}

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
