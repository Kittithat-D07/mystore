"use client";
import { useState, useRef } from "react";
import { X, ImagePlus } from "lucide-react";

interface Props {
  onUploadSuccess: (urls: string[]) => void;
  existingImages?: string[];
}

export default function ImageUploaderLocal({ onUploadSuccess, existingImages }: Props) {
  const [previews, setPreviews] = useState<string[]>(existingImages || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, fileName: file.name }),
      });
      const data = await res.json();
      if (data.url) {
        const newImages = [...previews, data.url];
        setPreviews(newImages);
        onUploadSuccess(newImages);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = previews.filter((_, i) => i !== index);
    setPreviews(newImages);
    onUploadSuccess(newImages);
  };

  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Product Images</label>
      <div className="flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group">
            <img src={src} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50 transition-all gap-1 disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImagePlus size={18} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 font-bold">Add</span>
            </>
          )}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFile} hidden accept="image/*" />
      </div>
    </div>
  );
}
