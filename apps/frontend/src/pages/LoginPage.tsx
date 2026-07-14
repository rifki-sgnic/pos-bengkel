import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { authApi } from "@/features/auth/authApi"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { Eye, EyeOff, Lock, User, Wrench } from "lucide-react"

const loginSchema = z.object({
  username: z.string("Username tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await authApi.login(data)
      login(result.user, result.token)

      toast.success("Login berhasil")
      navigate("/")
    } catch (error: any) {
      const message = error.response?.data?.message ?? "Login gagal"

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri — identitas, disembunyikan di mobile */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        {/* Motif ikon berulang, sangat samar — tekstur bengkel tanpa berisik */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/10">
            <Wrench className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Bengkel POS
          </span>
        </div>

        <div className="relative max-w-sm space-y-3">
          <h1 className="text-3xl leading-snug font-semibold">
            Kelola transaksi bengkel Anda dengan lebih rapi.
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            Satu tempat untuk mencatat penjualan, memantau stok, dan melihat
            laporan harian — tanpa catatan manual yang gampang hilang.
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Bengkel POS. Internal use only.
        </p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Brand mark, cuma muncul di mobile karena panel kiri disembunyiin */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Bengkel POS
            </span>
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">Masuk</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan kredensial Anda untuk mengakses sistem.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="username"
                  placeholder="username"
                  className="pl-9"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-9 pl-9"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
