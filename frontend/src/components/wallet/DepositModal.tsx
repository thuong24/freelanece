"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDeposit } from "@/lib/hooks/useWallet";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils/format";

const DepositSchema = z.object({
  amount: z.number().min(10000, "Số tiền nạp tối thiểu là 10,000 VNĐ"),
});

interface Props { open: boolean; onClose: () => void; }

export const DepositModal = ({ open, onClose }: Props) => {
  const { mutate: deposit, isPending } = useDeposit();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(DepositSchema),
    defaultValues: { amount: 100000 },
  });

  const amount = watch("amount") || 0;

  const onSubmit = (data: { amount: number }) => {
    deposit(
      { 
        amount: data.amount, 
        paymentGateway: "VNPAY",
        gatewayTransactionId: "VN_" + Date.now(),
        gatewaySignature: "mock_signature"
      },
      {
        onSuccess: (res: any) => {
          if (res?.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            onClose();
          }
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Nạp tiền vào ví">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Số tiền cần nạp (VNĐ)"
          type="number"
          placeholder="100000"
          error={errors.amount?.message as string}
          {...register("amount", { valueAsNumber: true })}
        />
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-sm text-indigo-200">Bạn sẽ thanh toán qua cổng VNPay.</p>
          <p className="text-xs text-slate-400 mt-1">Lưu ý: Đây là môi trường sandbox.</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Huỷ</Button>
          <Button type="submit" fullWidth loading={isPending}>
            Nạp {formatCurrency(amount)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
