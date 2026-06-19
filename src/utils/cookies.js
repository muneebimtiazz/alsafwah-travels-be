export const setAccessTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("AccessToken", token, {
    httpOnly: true,
    secure: isProd,              // HTTPS only in production
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,      // 15 minutes
  });
};


export const setRefreshTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("RefreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  res.clearCookie("AccessToken", options);
  res.clearCookie("RefreshToken", options);
};