"use client";

const badgeStyle: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  PAID:      { bg: "#DBEAFE", color: "#1E40AF" },
  SHIPPED:   { bg: "#EDE9FE", color: "#5B21B6" },
  DELIVERED: { bg: "#D1FAE5", color: "#065F46" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B" },
};

const statusLabel: Record<string, string> = {
  PENDING:   "รอดำเนินการ",
  PAID:      "ชำระแล้ว",
  SHIPPED:   "จัดส่งแล้ว",
  DELIVERED: "ส่งถึงแล้ว",
  CANCELLED: "ยกเลิก",
};

export default function OrderStatusButton({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const s = badgeStyle[currentStatus] || { bg: "#F1EFE8", color: "#5F5E5A" };

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      display: "inline-block",
      whiteSpace: "nowrap",
    }}>
      {statusLabel[currentStatus] || currentStatus}
    </span>
  );
}
