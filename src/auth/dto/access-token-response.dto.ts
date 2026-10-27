export class AccessTokenResponseDto {
  /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
  accessToken: string;

  /**
   * Returned when the request includes `X-Client-Type: mobile`.
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
   */
  refreshToken?: string;
}
