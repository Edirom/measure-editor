// I can imagine a bunch of performance optimizations on this, such as using more than one byte
// per random number, but it should be called seldom enough to not matter and I'd rather keep readability
// This tries to follow RFC 4122
const hexDigits = '0123456789abcdef';
export function generateUUID(): string {
    const s = [];
    for (let i = 0; i < 36; ++i) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // the RFC states bits 12-15 of time_high_and_version should be denoting the UUID version
    s[14] = '4';
    // bits 6 and 7 of clock_seq_hi_and_reserved should be 01
    // tslint:disable-next-line:no-bitwise
    s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
}
