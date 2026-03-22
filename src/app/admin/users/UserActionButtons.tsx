"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "../../../components/Toast";
import { ShieldCheck, ShieldOff, UserX, UserCheck, Unlock } from "lucide-react";

export default function UserActionButtons({
  userId, currentRole, isActive, isLocked,
}: {
  userId: string;
  currentRole: string;
  isActive: boolean;
  isLocked: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const patch = async (data: object, msg: string) => {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast(msg); router.refresh(); }
    else toast("Failed to update", "error");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Toggle Role */}
      <button
        onClick={() => patch({ role: currentRole === "ADMIN" ? "USER" : "ADMIN" }, `Role changed to ${currentRole === "ADMIN" ? "USER" : "ADMIN"}`)}
        disabled={loading}
        title={currentRole === "ADMIN" ? "Demote to User" : "Promote to Admin"}
        className="p-2 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-all"
      >
        {currentRole === "ADMIN" ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
      </button>

      {/* Toggle Active */}
      <button
        onClick={() => patch({ isActive: !isActive }, `User ${isActive ? "deactivated" : "activated"}`)}
        disabled={loading}
        title={isActive ? "Deactivate" : "Activate"}
        className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all"
      >
        {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
      </button>

      {/* Unlock */}
      {isLocked && (
        <button
          onClick={() => patch({ unlock: true }, "Account unlocked")}
          disabled={loading}
          title="Unlock Account"
          className="p-2 rounded-lg hover:bg-green-50 text-red-400 hover:text-green-600 transition-all"
        >
          <Unlock size={16} />
        </button>
      )}
    </div>
  );
}
