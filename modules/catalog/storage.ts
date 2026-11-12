import type {Catalog} from './types';

const gzipPrefix = 'gzip:v1:';
// Leave room for the other columns in D1's 2,000,000-byte row limit.
const maxStoredBytes = 1_900_000;
const encoder = new TextEncoder();

export async function encodeCatalog(catalog: Catalog): Promise<string | null> {
 const json = JSON.stringify(catalog);
 const bytes = encoder.encode(json);
 if (bytes.byteLength <= maxStoredBytes) return json;

 const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
 const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
 if (gzipPrefix.length + 4 * Math.ceil(compressed.length / 3) > maxStoredBytes) return null;

 let binary = '';
 for (let offset = 0; offset < compressed.length; offset += 8192) {
  binary += String.fromCharCode(...compressed.subarray(offset, offset + 8192));
 }
 return gzipPrefix + btoa(binary);
}

export async function decodeCatalog(payload: string): Promise<Catalog> {
 if (!payload.startsWith(gzipPrefix)) return JSON.parse(payload);

 const binary = atob(payload.slice(gzipPrefix.length));
 const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
 const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
 return JSON.parse(await new Response(stream).text());
}
