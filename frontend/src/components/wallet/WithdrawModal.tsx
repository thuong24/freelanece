"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWithdraw } from "@/lib/hooks/useWallet";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils/format";

const WithdrawSchema = z.object({
  amount: z.number().min(50000, "Số tiền rút tối thiểu là 50,000 VNĐ"),
  bankName: z.string().min(2, "Vui lòng nhập tên ngân hàng"),
  accountNumber: z.string().min(5, "Số tài khoản không hợp lệ"),
  accountName: z.string().min(2, "Tên chủ tài khoản không hợp lệ"),
});

interface Props { open: boolean; onClose: () => void; availableBalance: number; }

export const WithdrawModal = ({ open, onClose, availableBalance }: Props) => {
  const { mutate: withdraw, isPending } = useWithdraw();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(WithdrawSchema),
    defaultValues: { amount: 50000, bankName: "", accountNumber: "", accountName: "" },
  });

  const amount = watch("amount") || 0;

  const onSubmit = (data: any) => {
    if (data.amount > availableBalance) {
      alert("Số dư không đủ!");
      return;
    }
    withdraw({ 
      amount: data.amount, 
      bankName: data.bankName,
      bankAccountNumber: data.accountNumber,
      bankAccountName: data.accountName
    }, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title="Rút tiền về ngân hàng">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-slate-400">Số dư khả dụng:</span>
          <span className="text-green-400 font-bold">{formatCurrency(availableBalance)}</span>
        </div>
        <Input
          label="Số tiền cần rút (VNĐ)"
          type="number"
          placeholder="50000"
          error={errors.amount?.message as string}
          {...register("amount", { valueAsNumber: true })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ngân hàng" placeholder="VD: Vietcombank" error={errors.bankName?.message as string} {...register("bankName")} />
          <Input label="Số tài khoản" placeholder="VD: 0123456789" error={errors.accountNumber?.message as string} {...register("accountNumber")} />
        </div>
        <Input label="Tên chủ tài khoản" placeholder="VD: NGUYEN VAN A" error={errors.accountName?.message as string} {...register("accountName")} />
        
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Huỷ</Button>
          <Button type="submit" fullWidth loading={isPending} disabled={amount > availableBalance}>
            Yêu cầu rút {formatCurrency(amount)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
