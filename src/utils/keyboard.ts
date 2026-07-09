import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { User } from "@prisma/client";

export function getMainKeyboard(ctx: MyContext, user: User | null): Keyboard {
  const keyboard = new Keyboard()
    .text(ctx.t("address")).text(ctx.t("track")).row()
    .text(ctx.t("calculator")).text(ctx.t("support")).row();
    
  if (user?.role === "ADMIN" || user?.role === "WORKER") {
    keyboard.webApp("📸 Сканери Борҳо", "https://pobeda-scanner.vercel.app").row();
  }
  
  if (user?.role === "ADMIN") {
    keyboard.webApp("📊 Панели Маъмурият", "https://pobeda-admin-panel.onrender.com").row();
  }
  
  return keyboard.resized();
}
