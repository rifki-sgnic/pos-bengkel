import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeactivateConfirmDialogProps {
  deactivateId: string | null
  setDeactivateId: (id: string | null) => void
  deactivateProduct: any
  handleDeactivateConfirm: () => void
}

export default function DeactivateConfirmDialog({
  deactivateId,
  setDeactivateId,
  deactivateProduct,
  handleDeactivateConfirm,
}: DeactivateConfirmDialogProps) {
  return (
    <AlertDialog
      open={!!deactivateId}
      onOpenChange={(open) => !open && setDeactivateId(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menonaktifkan produk secara permanen. Produk yang
            dinonaktifkan tidak akan muncul pada menu Kasir (POS) maupun daftar
            pencarian produk baru.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            onClick={handleDeactivateConfirm}
            disabled={deactivateProduct.isPending}
          >
            {deactivateProduct.isPending ? "Menonaktifkan..." : "Nonaktifkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
