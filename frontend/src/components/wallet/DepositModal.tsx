"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDepositRequest } from "@/lib/hooks/useWallet";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils/format";
import Image from "next/image";

const DepositSchema = z.object({
  amount: z.number().min(10000, "Số tiền nạp tối thiểu là 10,000 VNĐ"),
});

interface Props { 
  open: boolean; 
  onClose: () => void; 
  initialQrData?: { amount: number; code: string } | null;
}

export const DepositModal = ({ open, onClose, initialQrData }: Props) => {
  const { mutate: createRequest, isPending } = useCreateDepositRequest();
  const [qrData, setQrData] = useState<{ amount: number; code: string } | null>(initialQrData || null);

  useEffect(() => {
    if (open) {
      setQrData(initialQrData || null);
    }
  }, [open, initialQrData]);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(DepositSchema),
    defaultValues: { amount: 100000 },
  });

  const amount = watch("amount") || 0;

  const handleClose = () => {
    setQrData(null);
    reset();
    onClose();
  };

  const onSubmit = (data: { amount: number }) => {
    createRequest(data.amount, {
      onSuccess: (res: any) => {
        setQrData({
          amount: data.amount,
          code: res.data.data.code,
        });
      },
    });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Nạp tiền vào ví">
      {!qrData ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Số tiền cần nạp (VNĐ)"
            type="number"
            placeholder="100000"
            error={errors.amount?.message as string}
            {...register("amount", { valueAsNumber: true })}
          />
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-sm text-indigo-200">Bạn sẽ thanh toán qua phương thức chuyển khoản ngân hàng tự động.</p>
            <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ cập nhật số dư ngay sau khi nhận được tiền.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={handleClose}>Huỷ</Button>
            <Button type="submit" fullWidth loading={isPending}>
              Tạo mã QR {formatCurrency(amount)}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 flex flex-col items-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-300">Quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(qrData.amount)} VNĐ</p>
          </div>
          
          <div className="p-4 bg-white rounded-xl">
            <Image 
              src={`https://qr.sepay.vn/img?bank=MBBank&acc=0702775390&template=qronly&amount=${qrData.amount}&des=${qrData.code}`}
              alt="QR Code"
              width={250}
              height={250}
              className="rounded-lg"
              unoptimized
            />
          </div>

          <div className="w-full space-y-2 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Ngân hàng:</span>
              <span className="font-medium">MBBank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Số tài khoản:</span>
              <span className="font-medium text-indigo-400">0702775390</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nội dung chuyển khoản:</span>
              <span className="font-bold text-amber-400 uppercase">{qrData.code}</span>
            </div>
            <p className="text-xs text-rose-400 text-center mt-3 font-medium">
              Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động cộng tiền!
            </p>
          </div>

          <Button fullWidth onClick={handleClose}>
            Tôi đã chuyển khoản
          </Button>
        </div>
      )}
    </Modal>
  );
};
