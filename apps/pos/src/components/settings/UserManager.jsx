import { LayoutGrid, List, Power } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import ActionIconButton from "../ui/ActionIconButton";
import ImageUploadButton from "../ui/ImageUploadButton";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";
import { useTranslation } from "../../context/LocaleContext";

const defaultPerms = {
  pos: true,
  products: false,
  inventory: false,
  transactions: false,
  reports: false,
  customers: false,
  settings: false,
};

export default function UserManager() {
  const { t } = useTranslation();
  const { users, user, userDoc, createUser, updateUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [view, setView] = useState("table");
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { role: "manager" },
  });

  const onCreate = async (data) => {
    try {
      await createUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        photoURL: photoUrl,
        role: data.role,
        permissions: {
          pos: Boolean(data.pos),
          products: Boolean(data.products),
          inventory: Boolean(data.inventory),
          transactions: Boolean(data.transactions),
          reports: Boolean(data.reports),
          customers: Boolean(data.customers),
          settings: Boolean(data.settings),
        },
      });
      toast.success(t("toast.userCreated"));
      setOpen(false);
      setPhotoUrl("");
      reset();
    } catch (e) {
      toast.error(e?.message || "Failed to create user");
    }
  };

  const onPhotoUpload = async (file) => {
    if (!file || !userDoc?.storeId) return;
    try {
      const url = await uploadImageToCloudinary(file, {
        folder: `quickpos/stores/${userDoc.storeId}/users`,
      });
      setPhotoUrl(url);
      toast.success(t("toast.photoUploaded"));
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    }
  };

  const toggle = async (u, patch) => {
    try {
      await updateUser(u.id || u.uid, patch);
      toast.success(t("toast.updated"));
    } catch (e) {
      toast.error(e?.message || "Update failed");
    }
  };

  const storeUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users
      .filter((u) => u.storeId === userDoc.storeId)
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter((u) => {
        if (!term) return true;
        return (
          u.displayName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      });
  }, [users, userDoc.storeId, q, roleFilter]);

  return (
    <div className="space-y-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-primary text-white font-semibold"
      >
        Add user
      </button>
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search users..."
          />
        </div>
        <SearchableSelect
          className="min-w-[170px]"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All roles" },
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
            { value: "cashier", label: "Cashier" },
          ]}
          placeholder="Role"
        />
        <div className="inline-flex rounded-xl border border-border overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-3 py-2 ${view === "table" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storeUsers.map((u) => (
                <tr key={u.uid || u.id} className="border-t border-border/60">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-xs font-semibold text-text-muted">
                          {(u.displayName || u.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{u.displayName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-text-muted">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    {u.isActive === false ? "Inactive" : "Active"}
                  </td>
                  <td className="p-3 text-right">
                    {u.uid === user?.uid && u.role === "admin" ? (
                      <span className="text-xs text-text-muted">Owner</span>
                    ) : (
                      <ActionIconButton
                        title={u.isActive === false ? "Activate" : "Deactivate"}
                        icon={Power}
                        tone={u.isActive === false ? "success" : "danger"}
                        onClick={() => toggle(u, { isActive: !u.isActive })}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {storeUsers.map((u) => (
            <div
              key={u.uid || u.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-sm font-semibold text-text-muted">
                      {(u.displayName || u.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-text-primary">
                      {u.displayName}
                    </p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </div>
                </div>
                {u.uid === user?.uid && u.role === "admin" ? (
                  <span className="text-xs text-text-muted">Owner</span>
                ) : (
                  <ActionIconButton
                    title={u.isActive === false ? "Activate" : "Deactivate"}
                    icon={Power}
                    tone={u.isActive === false ? "success" : "danger"}
                    onClick={() => toggle(u, { isActive: !u.isActive })}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Role</p>
                  <p className="font-semibold text-text-primary capitalize">
                    {u.role}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Status</p>
                  <p className="font-semibold text-text-primary">
                    {u.isActive === false ? "Inactive" : "Active"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New user" wide>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          <input
            type="password"
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Password"
            {...register("password", { required: true, minLength: 6 })}
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Display name"
            {...register("displayName", { required: true })}
          />

          <div>
            <label className="text-xs text-text-muted block mb-2">
              User photo (optional)
            </label>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="User"
                className="h-16 mb-2 rounded-lg border border-border"
              />
            )}
            <ImageUploadButton
              onUpload={onPhotoUpload}
              label="Upload photo"
              maxSize={5242880}
              className="bg-background hover:bg-primary/10 text-text-primary"
            />
          </div>

          <input type="hidden" {...register("role", { required: true })} />
          <SearchableSelect
            className="w-full"
            value={watch("role")}
            onChange={(value) =>
              setValue("role", value, { shouldValidate: true })
            }
            options={[
              { value: "manager", label: "Manager" },
              { value: "cashier", label: "Cashier" },
            ]}
            placeholder="Role"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.keys(defaultPerms).map((k) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={k === "pos"}
                  {...register(k)}
                />
                {k}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
          >
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
