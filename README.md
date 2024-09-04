# SipHash TypeScript Implementation

This repository contains a TypeScript implementation of the SipHash cryptographic hash function. SipHash is a fast, short-input pseudorandom function created by Jean-Philippe Aumasson and Daniel J. Bernstein.

## Features

- Pure TypeScript implementation
- Optimized for modern JavaScript engines

## Usage

```typescript
import { siphash } from './index.ts';

const key = new Uint8Array(16); // 16-byte key
const input = new TextEncoder().encode("Hello, world!");

// 64-bit output
const hash64 = siphash(input, key, 8);

// 128-bit output
const hash128 = siphash(input, key, 16);
```

## API

```typescript
function siphash(inData: Uint8Array, key: Uint8Array, outlen: number): Uint8Array
```

- `inData`: The input data to hash
- `key`: A 16-byte key
- `outlen`: Output length in bytes (8 for 64-bit, 16 for 128-bit)

Returns a `Uint8Array` containing the hash value.

## Implementation Details

This implementation follows the SipHash 2-4 specification, using 2 compression rounds and 4 finalization rounds. It includes optimizations for handling different input lengths and supports both 64-bit and 128-bit output sizes.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## References

- [SipHash: a fast short-input PRF](https://131002.net/siphash/)
- [SipHash Reference Implementation](https://github.com/veorq/SipHash)
