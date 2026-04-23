import { useState, useRef } from "react";
import {
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineUpload,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { showToast } from "../../utils/helpers";

const ProfilePictureModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreview(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageUrl.trim()) {
      showToast.error("Please provide an image URL or upload a file");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfileImage(imageUrl);
      updateUser({ ...user, profileImage: response.profileImage });
      showToast.success("Profile picture updated!");
      onClose();
    } catch (error) {
      showToast.error(error.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HiOutlineX size={20} />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Change Profile Picture
        </h2>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setPreview("")}
              />
            ) : (
              <HiOutlinePhotograph size={32} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Upload Options */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              <HiOutlineUpload size={18} />
              Upload from device
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* URL Input */}
          <input
            type="url"
            placeholder="Paste image URL"
            value={imageUrl}
            onChange={handleUrlChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !imageUrl.trim()}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-md text-sm font-medium transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
