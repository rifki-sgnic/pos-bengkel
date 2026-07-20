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

interface ClearCartConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function ClearCartConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearCartConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kosongkan Keranjang?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus semua produk yang telah dimasukkan ke dalam keranjang belanja saat ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Kosongkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
