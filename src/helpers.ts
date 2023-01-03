export const getAccessTokenFromRequest = (request: Request) => {
  return request?.headers?.['authorization']?.slice(7);
}
