import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { User } from "@prisma/client";

export function getMainKeyboard(ctx: MyContext, user: User | null): Keyboard {
  const keyboard = new Keyboard()
    .text(ctx.t("add_parcel")).text(ctx.t("track")).row()
    .text(ctx.t("calculator")).text(ctx.t("support")).row();
    
  if (user?.role === "ADMIN" || user?.role === "WORKER" || user?.role === "SUPERADMIN") {
    keyboard.webApp("📸 Сканери Борҳо", `https://pobeda-kargo.onrender.com/?v=2&tgId=${user.telegramId.toString()}`).row();
  }
  
  if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
    keyboard.text("📊 Панели Маъмурият").row();
  }
  
  return keyboard.resized();
}
