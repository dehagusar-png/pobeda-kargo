import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { User } from "@prisma/client";

export function getMainKeyboard(ctx: MyContext, user: User | null): Keyboard {
  const keyboard = new Keyboard()
    .text(ctx.t("add_parcel")).text(ctx.t("track")).row()
    .text(ctx.t("address")).text(ctx.t("calculator")).row()
    .text(ctx.t("support")).row();
    
  if (user?.role === "ADMIN" || user?.role === "WORKER") {
    keyboard.webApp("📸 Сканери Борҳо", "https://pobeda-kargo.onrender.com/?v=2").row();
  }
  
  if (user?.role === "ADMIN") {
    keyboard.webApp("📊 Панели Маъмурият", "https://pobeda-admin-panel.onrender.com").row();
  }
  
  return keyboard.resized();
}
