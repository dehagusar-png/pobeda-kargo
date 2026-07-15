import { Keyboard } from "grammy";
import { MyContext } from "../bot";
import { User } from "@prisma/client";

export function getMainKeyboard(ctx: MyContext, user: User | null): Keyboard {
  const keyboard = new Keyboard()
    .webApp(ctx.t("marketplace"), "https://pobeda-admin-panel.onrender.com/shop").text(ctx.t("add_parcel")).row()
    .text(ctx.t("track")).text(ctx.t("calculator")).row()
    .text(ctx.t("support")).row();
    
  if (user?.role === "ADMIN" || user?.role === "WORKER" || user?.role === "SUPERADMIN") {
    keyboard.webApp("📸 Сканери Борҳо", "https://pobeda-kargo.onrender.com/?v=2").row();
  }
  
  if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
    keyboard.webApp("📊 Панели Маъмурият", "https://pobeda-admin-panel.onrender.com/login").row();
  }
  
  return keyboard.resized();
}
