import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import ImageUploadButton from "../ui/ImageUploadButton";
import { useTranslation } from "../../context/LocaleContext";

export default function ProfileSettings() {
  const { t } = useTranslation();
  const { userDoc, updateUserProfile } = useAuthStore();
  const [photoUrl, setPhotoUrl] = useState(userDoc?.photoURL || "");
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (userDoc) {
      reset({
        displayName: userDoc.displayName,
        email: userDoc.email,
      });
      setPhotoUrl(userDoc.photoURL || "");
    }
  }, [userDoc, reset]);

  const onSubmit = async (data) => {
    try {
      await updateUserProfile({
        displayName: data.displayName,
        photoURL: photoUrl,
      });
      toast.success(t("toast.updated"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const onPhotoUpload = async (file) => {
    if (!file || !userDoc?.storeId || !userDoc?.uid) return;
    try {
      const url = await uploadImageToCloudinary(file, {
        folder: `quickpos/stores/${userDoc.storeId}/users/${userDoc.uid}`,
      });
      setPhotoUrl(url);
      toast.success(t("toast.photoUploaded"));
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    }
  };

  if (!userDoc) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-3xl text-sm"
    >
      <div>
        <label className="text-xs text-text-muted">Profile photo</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              (userDoc.displayName || userDoc.email || "?")
                .charAt(0)
                .toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-2">
            <ImageUploadButton
              onUpload={onPhotoUpload}
              label="Upload photo"
              maxSize={5242880}
              className="bg-background hover:bg-primary/10 text-text-primary"
            />
            <p className="text-xs text-text-muted">JPG or PNG, max 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-text-muted">Display name</label>
        <input
          className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          {...register("displayName", { required: true })}
        />
      </div>

      <div>
        <label className="text-xs text-text-muted">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background cursor-not-allowed"
          {...register("email")}
          disabled
        />
        <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-primary text-white font-semibold"
      >
        Save profile
      </button>
    </form>
  );
}
