import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const BRANDING_FILE = join(process.cwd(), 'data', 'school-branding.json')

function readBranding() {
  try {
    return JSON.parse(readFileSync(BRANDING_FILE, 'utf8'))
  } catch {
    return {}
  }
}

export async function GET() {
  return NextResponse.json({ data: readBranding() })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const current = readBranding()
    const updated = { ...current, ...body }
    writeFileSync(BRANDING_FILE, JSON.stringify(updated, null, 2), 'utf8')
    return NextResponse.json({ data: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to save' }, { status: 500 })
  }
}
