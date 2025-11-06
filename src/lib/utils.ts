import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * JWT 토큰을 디코딩하여 payload를 반환합니다.
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    // Bearer 접두사 제거
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];

    // base64url 디코딩
    // base64url은 -를 +로, _를 /로 변환하고 padding 추가
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // padding 추가 (base64는 4의 배수 길이여야 함)
    while (base64.length % 4) {
      base64 += "=";
    }

    // base64 디코딩 (바이너리 데이터로)
    const binaryString = atob(base64);

    // UTF-8 디코딩을 위해 바이트 배열로 변환
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // UTF-8로 디코딩
    const decoded = new TextDecoder("utf-8").decode(bytes);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;

    return parsed;
  } catch (error) {
    console.error("JWT 디코딩 실패:", error);
    return null;
  }
}
