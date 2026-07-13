const fs = require('fs');
const path = require('path');

const locales = {
  tg: `
status_EXPECTED = Мунтазири қабул 📦
status_IN_CHINA = Бор дар анбори Чин 🇨🇳
status_IN_TRANSIT = Аз анбор ба роҳ баромад 🚚
status_ARRIVED = Ба манзил омада расид 🇹🇯
status_DELIVERED = Супорида шуд ✅
status_changed = 🔔 Огоҳинома: Статуси бори шумо ({ $trackCode }) иваз шуд: <b>{ $status }</b>
`,
  ru: `
status_EXPECTED = Ожидает поступления 📦
status_IN_CHINA = Груз на складе в Китае 🇨🇳
status_IN_TRANSIT = Отправлен со склада в пути 🚚
status_ARRIVED = Прибыл в пункт назначения 🇹🇯
status_DELIVERED = Выдан ✅
status_changed = 🔔 Уведомление: Статус вашего груза ({ $trackCode }) изменен: <b>{ $status }</b>
`,
  en: `
status_EXPECTED = Expected 📦
status_IN_CHINA = Parcel at China warehouse 🇨🇳
status_IN_TRANSIT = Departed warehouse, in transit 🚚
status_ARRIVED = Arrived at destination 🇹🇯
status_DELIVERED = Delivered ✅
status_changed = 🔔 Notification: Your parcel ({ $trackCode }) status changed to: <b>{ $status }</b>
`,
  uz: `
status_EXPECTED = Qabul qilinishi kutilmoqda 📦
status_IN_CHINA = Yuk Xitoy omborida 🇨🇳
status_IN_TRANSIT = Ombordan yo'lga chiqdi 🚚
status_ARRIVED = Manzilga yetib keldi 🇹🇯
status_DELIVERED = Topshirildi ✅
status_changed = 🔔 Bildirishnoma: Yukingiz ({ $trackCode }) holati o'zgardi: <b>{ $status }</b>
`,
  zh: `
status_EXPECTED = 待接收 📦
status_IN_CHINA = 货物在中国仓库 🇨🇳
status_IN_TRANSIT = 已离开仓库，运输中 🚚
status_ARRIVED = 已到达目的地 🇹🇯
status_DELIVERED = 已交付 ✅
status_changed = 🔔 通知: 您的货物 ({ $trackCode }) 状态已更改为: <b>{ $status }</b>
`
};

for (const [lang, content] of Object.entries(locales)) {
  const filePath = path.join(__dirname, 'locales', lang + '.ftl');
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, content);
    console.log('Appended to ' + lang + '.ftl');
  }
}
