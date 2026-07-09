import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { LoginInput, RegisterInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw Error("Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? "CASHIER",
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) throw new Error("Username atau password salah");

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) throw new Error("Username atau password salah");

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },
};
