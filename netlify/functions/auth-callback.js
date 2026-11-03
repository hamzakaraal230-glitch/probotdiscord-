export default async (request) => {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return new Response("Discord ayarları eksik.", {
      status: 500
    });
  }

  if (!code) {
    return new Response("Discord giriş kodu bulunamadı.", {
      status: 400
    });
  }

  try {
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response("Discord giriş doğrulaması başarısız.", {
        status: 401
      });
    }

    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok) {
      return new Response("Kullanıcı bilgileri alınamadı.", {
        status: 401
      });
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ProBot - Giriş Başarılı</title>
      </head>
      <body style="background:#171923;color:white;text-align:center;padding:50px;font-family:Arial">
        <h1>ProBot</h1>
        <h2>Giriş başarılı!</h2>
        <p>Hoş geldin, ${String(user.username).replace(/[&<>"']/g, "")}!</p>
      </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      }
    );

  } catch (error) {
    return new Response("Bir bağlantı hatası oluştu.", {
      status: 500
    });
  }
};
