import { db } from "./firebase-admin.js";

export default async function handler(req, res) {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const authCode = process.env.ML_AUTH_CODE;
  const redirectUri = process.env.ML_REDIRECT_URI;

  const tokenRef = db.collection("integration").doc("ml-tokens");
  const existing = await tokenRef.get();

  let refreshToken;
  let accessToken;

  if (!existing.exists) {
    const resp = await fetch(https://api.mercadolibre.com/oauth/token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        redirect_uri: redirectUri,
      }),
    });

    const data = await resp.json();
    refreshToken = data.refresh_token;
    accessToken = data.access_token;

    await tokenRef.set({
      refresh_token: refreshToken,
      access_token: accessToken,
      expiration: Date.now() + (data.expires_in - 60) * 1000
    });

  } else {
    refreshToken = existing.data().refresh_token;

    const resp = await fetch(https://api.mercadolibre.com/oauth/token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await resp.json();
    refreshToken = data.refresh_token || refreshToken;
    accessToken = data.access_token;

    await tokenRef.set({
      refresh_token: refreshToken,
      access_token: accessToken,
      expiration: Date.now() + (data.expires_in - 60) * 1000
    });
  }

  res.status(200).json({
    success: true,
    accessToken,
    refreshToken
  });
}
