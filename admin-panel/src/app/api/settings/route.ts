import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// process.cwd() is likely c:\pobeda kargo\admin-panel, so config.json is in parent
const configPath = path.resolve(process.cwd(), "..", "config.json");

export async function GET() {
  try {
    const data = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(data);
    
    // Migration: If it's the old format without dushanbe/panjakent
    if (!parsed.dushanbe) {
      const migrated = {
        dushanbe: { weightTiers: parsed.weightTiers || [], volumeTiers: parsed.volumeTiers || [] },
        panjakent: { weightTiers: parsed.weightTiers || [], volumeTiers: parsed.volumeTiers || [] }
      };
      return NextResponse.json(migrated);
    }
    
    return NextResponse.json(parsed);
  } catch (_error) {
    // Return default if file doesn't exist
    return NextResponse.json({
      dushanbe: { weightTiers: [], volumeTiers: [] },
      panjakent: { weightTiers: [], volumeTiers: [] }
    });
  }
}

export async function POST(_request: Request) {
  try {
    const body = await _request.json();
    const { pin, config } = body;
    
    const correctPin = process.env.SUPERADMIN_PIN || "7777";
    if (pin !== correctPin) {
      return NextResponse.json({ error: "PIN_REQUIRED" }, { status: 403 });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
