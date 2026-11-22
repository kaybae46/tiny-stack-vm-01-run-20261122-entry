// Tiny stack VM (ISA v1) for make.fun tiny-stack-vm-01-run-20261122.
// Exact 32-bit wrapping arithmetic, all ten traps with their own exit
// codes, 1,000,000-step and 65,536-byte output limits. Node 22, no deps.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p, inp) {
  const n = p.length, S = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), B = new Uint8Array(65536);
  let sp = 0, cp = 0, ip = 0, pc = 0, k = 0, ol = 0;
  const done = (c) => [B.subarray(0, ol), c];
  for (;;) {
    if (k === 1e6) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const op = p[pc];
    let im;
    switch (op) {
      case 0x01: im = 1; break;
      case 0x02: im = 4; break;
      case 0x30: case 0x31: case 0x32: case 0x33: im = 2; break;
      case 0x00: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07:
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15:
      case 0x16: case 0x17: case 0x18: case 0x19: case 0x1a: case 0x1b:
      case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22:
      case 0x34: case 0x40: case 0x41: case 0x50: case 0x51: case 0x52: case 0x53: im = 0; break;
      default: return done(5);
    }
    if (pc + im >= n) return done(9);
    k++;
    const nx = pc + 1 + im;
    pc = nx;
    switch (op) {
      case 0x00: return done(0);
      case 0x01: if (sp >= 256) return done(3); S[sp++] = (p[nx - 1] << 24) >> 24; break;
      case 0x02: if (sp >= 256) return done(3); S[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 0x03: if (sp < 1) return done(2); sp--; break;
      case 0x04: if (sp < 1) return done(2); if (sp >= 256) return done(3); S[sp] = S[sp - 1]; sp++; break;
      case 0x05: if (sp < 2) return done(2); { const t = S[sp - 1]; S[sp - 1] = S[sp - 2]; S[sp - 2] = t; } break;
      case 0x06: if (sp < 2) return done(2); if (sp >= 256) return done(3); S[sp] = S[sp - 2]; sp++; break;
      case 0x07: if (sp < 3) return done(2); { const t = S[sp - 3]; S[sp - 3] = S[sp - 2]; S[sp - 2] = S[sp - 1]; S[sp - 1] = t; } break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
        if (sp < 2) return done(2);
        const b = S[sp - 1], a = S[sp - 2];
        let r;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (b === 0) return done(4); r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
        else if (op === 0x14) { if (b === 0) return done(4); r = b === -1 ? 0 : (a % b) | 0; }
        else if (op === 0x15) { if (b === 0) return done(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 0x16) { if (b === 0) return done(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        sp -= 2; S[sp++] = r; break;
      }
      case 0x17: if (sp < 1) return done(2); S[sp - 1] = (-S[sp - 1]) | 0; break;
      case 0x1b: if (sp < 1) return done(2); S[sp - 1] = ~S[sp - 1]; break;
      case 0x30: case 0x31: case 0x32: {
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        if (op !== 0x30) { if (sp < 1) return done(2); const v = S[--sp]; if ((op === 0x31) !== (v === 0)) break; }
        pc = nx + rel; break;
      }
      case 0x33: if (cp === 64) return done(7); C[cp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
      case 0x34: if (cp === 0) return done(8); pc = C[--cp]; break;
      case 0x40: if (sp < 1) return done(2); { const a = S[sp - 1]; if (a < 0 || a >= 256) return done(6); S[sp - 1] = M[a]; } break;
      case 0x41: if (sp < 2) return done(2); { const a = S[sp - 1], v = S[sp - 2]; if (a < 0 || a >= 256) return done(6); sp -= 2; M[a] = v; } break;
      case 0x50: if (sp < 1) return done(2); { const s = String(S[sp - 1]); if (ol + s.length > 65536) return done(11); sp--; for (let i = 0; i < s.length; i++) B[ol++] = s.charCodeAt(i); } break;
      case 0x51: if (sp < 1) return done(2); if (ol + 1 > 65536) return done(11); B[ol++] = S[--sp] & 255; break;
      case 0x52: if (sp >= 256) return done(3); S[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 0x53: if (sp < 1) return done(2); return done(S[--sp] & 255);
    }
  }
}
for (const id of readdirSync(I).sort()) {
  let p, inp;
  try { p = readFileSync(join(I, id, 'program.bin')); inp = readFileSync(join(I, id, 'input.bin')); } catch { continue; }
  let r;
  try { r = run(p, inp); } catch { r = [new Uint8Array(0), 1]; }
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r[0]);
  writeFileSync(join(O, id, 'exit.txt'), `${r[1]}\n`);
}
