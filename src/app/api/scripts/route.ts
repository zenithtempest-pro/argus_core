import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function GET() {
  try {
    const scriptsDir = path.join(process.cwd(), 'public', 'scripts');
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
      return NextResponse.json([]);
    }

    const fileNames = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.py'));

    const scripts = fileNames.map(filename => {
      const filePath = path.join(scriptsDir, filename);
      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const nameClean = filename.replace(/_/g, ' ').replace('.py', '');
      const formattedName = nameClean.charAt(0).toUpperCase() + nameClean.slice(1);

      return {
        id: filename.replace('.py', ''),
        name: formattedName,
        filename: filename,
        version: 'v1.0.0',
        pythonVersion: 'Python 3.8+',
        size: `${(stats.size / 1024).toFixed(1)} KB`,
        category: filename.includes('phone') || filename.includes('username') ? 'Identity' :
                  filename.includes('dns') || filename.includes('ip') ? 'Network' :
                  filename.includes('exif') ? 'Media' :
                  filename.includes('header') ? 'Scanners' : 'Custom',
        description: `Executable Python OSINT utility: ${filename}`,
        dependencies: ['requests', 'colorama', 'phonenumbers'],
        checksum: sha256,
        downloads: 1250,
        lastUpdated: stats.mtime.toISOString().split('T')[0],
        downloadUrl: `/scripts/${filename}`,
      };
    });

    return NextResponse.json(scripts);
  } catch (error) {
    console.error('Failed to read scripts directory:', error);
    return NextResponse.json({ error: 'Failed to read scripts' }, { status: 500 });
  }
}
