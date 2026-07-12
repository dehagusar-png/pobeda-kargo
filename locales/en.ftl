welcome = Hello! Welcome to pobedacargo1 bot. Please select a language:
language_set = English language selected!
ask_phone = To continue, please send your phone number using the button below:
phone_button = 📱 Send Phone Number
registered = Thank you! You have successfully registered. Your client code is: { $clientCode }
main_menu = 🏠 Main Menu:
marketplace = 🛍 Shop from China
address = 📍 Address in China
track = 🔍 Track Parcel
calculator = 🧮 Calculator
support = 🎧 Support
address_info = 📍 Your address in China:

 收件人 (Name): <b>{ $clientCode } { $name }</b>
 手机号码 (Phone): <b>13800138000</b>
 所在地区 (Region): <b>广东省 广州市 越秀区</b>
 详细地址 (Full address): <b>广园西路 222 号 Победа Карго { $clientCode }</b>

 <i>Please copy the information above and use it in Chinese stores.</i>

calc_prompt = 🧮 <b>Price Calculator</b>
 Please send the weight (kg) and volume (m³) separated by a space.
 Example: <code>10.5 0.2</code> (means 10.5 kg and 0.2 m³)

calc_result = 💰 <b>Calculation Result:</b>
 Weight: { $weight } kg
 Volume: { $volume } m³
 
 Price by weight: ${ $weightPrice }
 Price by volume: ${ $volumePrice }
 
 💵 <b>Final Price: ${ $finalPrice }</b>

support_text = 🎧 <b>Customer Support</b>
 To contact the administration, call the following numbers or write in Telegram:
 
 📞 +992 000 00 00 00
 💬 @PobedaCargoSupport

add_parcel = ➕ Add Parcel
add_parcel_prompt = 📦 Please send your parcel's track code:
parcel_added = ✅ Parcel with track code { $trackCode } has been registered in your name!
parcel_already_yours = ℹ️ This parcel is already registered in your name.
parcel_already_others = ❌ This parcel is already registered to another person.
claim_prompt = 📦 This parcel is already in China, but its owner is unknown. Whose parcel is this?
btn_mine = 🙋‍♂️ It's mine
btn_others = 👥 Someone else's
btn_track_only = 🔍 Just track
ask_owner_code = 👤 Please enter the owner's client code (PB-XXXX):
owner_not_found = ❌ Client with this code was not found.
parcel_assigned = ✅ Parcel successfully assigned to client { $clientCode }!
