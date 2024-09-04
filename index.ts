function rotl(x: bigint, b: number): bigint {
	return (x << BigInt(b)) | (x >> (BigInt(64) - BigInt(b)));
}

function u32To8LE(v: number): Uint8Array {
	return new Uint8Array([
		v & 0xff,
		(v >> 8) & 0xff,
		(v >> 16) & 0xff,
		(v >> 24) & 0xff,
	]);
}

function u64To8LE(v: bigint): Uint8Array {
	const low = Number(v & BigInt(0xffffffff));
	const high = Number((v >> BigInt(32)) & BigInt(0xffffffff));
	return new Uint8Array([...u32To8LE(low), ...u32To8LE(high)]);
}

function u8To64LE(p: Uint8Array): bigint {
	return (
		BigInt(p[0]) |
		(BigInt(p[1]) << BigInt(8)) |
		(BigInt(p[2]) << BigInt(16)) |
		(BigInt(p[3]) << BigInt(24)) |
		(BigInt(p[4]) << BigInt(32)) |
		(BigInt(p[5]) << BigInt(40)) |
		(BigInt(p[6]) << BigInt(48)) |
		(BigInt(p[7]) << BigInt(56))
	);
}

export function siphash(
	inData: Uint8Array,
	key: Uint8Array,
	outlen: 8 | 16
): Uint8Array {
	const cROUNDS = 2;
	const dROUNDS = 4;

	let v0 = BigInt(0x736f6d6570736575n);
	let v1 = BigInt(0x646f72616e646f6dn);
	let v2 = BigInt(0x6c7967656e657261n);
	let v3 = BigInt(0x7465646279746573n);
	const k0 = u8To64LE(key.subarray(0, 8));
	const k1 = u8To64LE(key.subarray(8, 16));
	let m: bigint;

	const end = inData.length - (inData.length % 8);
	const left = inData.length & 7;
	let b = BigInt(inData.length) << BigInt(56);

	v3 ^= k1;
	v2 ^= k0;
	v1 ^= k1;
	v0 ^= k0;

	if (outlen === 16) {
		v1 ^= BigInt(0xee);
	}

	for (let i = 0; i < end; i += 8) {
		m = u8To64LE(inData.subarray(i, i + 8));
		v3 ^= m;

		for (let j = 0; j < cROUNDS; j++) {
			v0 += v1;
			v1 = rotl(v1, 13);
			v1 ^= v0;
			v0 = rotl(v0, 32);
			v2 += v3;
			v3 = rotl(v3, 16);
			v3 ^= v2;
			v0 += v3;
			v3 = rotl(v3, 21);
			v3 ^= v0;
			v2 += v1;
			v1 = rotl(v1, 17);
			v1 ^= v2;
			v2 = rotl(v2, 32);
		}

		v0 ^= m;
	}

	switch (left) {
		case 7:
			b |= BigInt(inData[end + 6]) << BigInt(48);
			break;
		case 6:
			b |= BigInt(inData[end + 5]) << BigInt(40);
			break;
		case 5:
			b |= BigInt(inData[end + 4]) << BigInt(32);
			break;
		case 4:
			b |= BigInt(inData[end + 3]) << BigInt(24);
			break;
		case 3:
			b |= BigInt(inData[end + 2]) << BigInt(16);
			break;
		case 2:
			b |= BigInt(inData[end + 1]) << BigInt(8);
			break;
		case 1:
			b |= BigInt(inData[end]);
	}

	v3 ^= b;

	for (let j = 0; j < cROUNDS; j++) {
		v0 += v1;
		v1 = rotl(v1, 13);
		v1 ^= v0;
		v0 = rotl(v0, 32);
		v2 += v3;
		v3 = rotl(v3, 16);
		v3 ^= v2;
		v0 += v3;
		v3 = rotl(v3, 21);
		v3 ^= v0;
		v2 += v1;
		v1 = rotl(v1, 17);
		v1 ^= v2;
		v2 = rotl(v2, 32);
	}

	v0 ^= b;

	if (outlen === 16) {
		v2 ^= BigInt(0xee);
	} else {
		v2 ^= BigInt(0xff);
	}

	for (let j = 0; j < dROUNDS; j++) {
		v0 += v1;
		v1 = rotl(v1, 13);
		v1 ^= v0;
		v0 = rotl(v0, 32);
		v2 += v3;
		v3 = rotl(v3, 16);
		v3 ^= v2;
		v0 += v3;
		v3 = rotl(v3, 21);
		v3 ^= v0;
		v2 += v1;
		v1 = rotl(v1, 17);
		v1 ^= v2;
		v2 = rotl(v2, 32);
	}

	let hash = v0 ^ v1 ^ v2 ^ v3;
	let out = u64To8LE(hash);

	if (outlen === 8) {
		return out;
	}

	v1 ^= BigInt(0xdd);

	for (let j = 0; j < dROUNDS; j++) {
		v0 += v1;
		v1 = rotl(v1, 13);
		v1 ^= v0;
		v0 = rotl(v0, 32);
		v2 += v3;
		v3 = rotl(v3, 16);
		v3 ^= v2;
		v0 += v3;
		v3 = rotl(v3, 21);
		v3 ^= v0;
		v2 += v1;
		v1 = rotl(v1, 17);
		v1 ^= v2;
		v2 = rotl(v2, 32);
	}

	hash = v0 ^ v1 ^ v2 ^ v3;
	out = new Uint8Array([...out, ...u64To8LE(hash)]);

	return out;
}
