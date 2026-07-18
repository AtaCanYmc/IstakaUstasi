import React, { useState, useRef } from 'react';
import { useStore } from '../store/store';
import { Camera, Upload, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const VisionUpload: React.FC = () => {
  const {
    user,
    token,
    isProcessingVision,
    visionError,
    uploadImageExtract,
    uploadImageSolve,
  } = useStore();

  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAction = async (type: 'extract' | 'solve') => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];

    try {
      if (type === 'extract') {
        await uploadImageExtract(file);
      } else {
        await uploadImageSolve(file);
      }
    } catch (err) {}
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            Scan Board Image
          </h2>
          <p className="text-xs text-slate-400">Extract tiles automatically from your rack photograph</p>
        </div>

        {user && (
          <div className="px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-900/30 text-indigo-300 text-[10px] font-bold">
            Quota: {user.image_quota_count} extractions left
          </div>
        )}
      </div>

      {!token ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center bg-slate-950/20">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold text-sm text-slate-300">Authentication Required</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            Computer vision Okey detection requires a valid account to manage server processing limits.
          </p>
          <span className="text-xs text-indigo-400 font-medium">Please sign in from the top bar to scan images.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-950/30 hover:bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-300">Drag & drop your rack photo here, or click to browse</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports JPEG, PNG up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-64 flex justify-center bg-black">
                <img src={previewUrl} alt="Board preview" className="object-contain max-h-64 w-full" />
                <button
                  onClick={clearImage}
                  disabled={isProcessingVision}
                  className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold"
                >
                  Change Image
                </button>
              </div>

              {visionError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{visionError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('extract')}
                  disabled={isProcessingVision}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessingVision ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Extract to Board
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAction('solve')}
                  disabled={isProcessingVision}
                  className="py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessingVision ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Extract & Solve
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionUpload;
