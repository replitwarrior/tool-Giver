const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_BOT_TOKEN) {
  console.warn("⚠️ DISCORD_BOT_TOKEN is not set!");
}

app.use(cors());
app.use(express.json());

/* ===============================
   Health Route
================================ */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Discord User API running",
  });
});

/* ===============================
   User Endpoint
================================ */
app.get("/api/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const userData = await fetchDiscordUserData(userId);

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const extendedUserData = processUserData(userData);
    res.json(extendedUserData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===============================
   Fetch Discord User
================================ */
async function fetchDiscordUserData(userId) {
  const response = await fetch(
    `https://discord.com/api/v10/users/${userId}`,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch user information");
  }

  return response.json();
}

/* ===============================
   Process User Data
================================ */
function processUserData(userData) {
  const isBot = userData.bot || false;
  const isSystem = userData.system || false;

  const flags = resolveUserFlags(userData.flags || 0);
  const nitroType = resolveNitroType(userData.premium_type || 0);

  const avatarUrl = userData.avatar
    ? getImageUrl("avatar", userData.id, userData.avatar)
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(
        userData.discriminator
      ) % 5}.png`;

  const bannerUrl = userData.banner
    ? getImageUrl("banner", userData.id, userData.banner)
    : null;

  const avatarDecoration =
    userData.avatar_decoration
      ? `https://cdn.discordapp.com/avatar-decorations/${userData.id}/${userData.avatar_decoration}.png`
      : userData.avatar_decoration_data
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${userData.avatar_decoration_data.asset}.png?size=4096`
      : null;

  const creationDate = new Date(
    getCreationDate(userData.id)
  ).toISOString();

  return {
    id: userData.id,
    global_name: userData.global_name,
    username: userData.username,
    discriminator: userData.discriminator,
    avatar: avatarUrl,
    avatarDecoration,
    banner: bannerUrl,
    accentColor: userData.accent_color,
    bannerColor: userData.banner_color,
    isBot,
    isSystem,
    flags,
    nitroType,
    creationDate,
  };
}

/* ===============================
   Image Helper
================================ */
function getImageUrl(type, id, hash, format = "png") {
  const baseUrl =
    type === "avatar"
      ? "https://cdn.discordapp.com/avatars"
      : "https://cdn.discordapp.com/banners";

  const isGif = hash.startsWith("a_");
  const actualFormat = isGif ? "gif" : format;

  return `${baseUrl}/${id}/${hash}.${actualFormat}?size=4096`;
}

/* ===============================
   Resolve User Flags (Badges)
================================ */
function resolveUserFlags(flags) {
  const defaultFlagsConfig = {
    1: {
      name: "STAFF",
      description: "Discord Employee",
      icon: "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png",
    },
    2: {
      name: "PARTNER",
      description: "Partnered Server Owner",
      icon: "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png",
    },
    4: {
      name: "HYPESQUAD",
      description: "HypeSquad Events Member",
      icon: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png",
    },
    8: {
      name: "BUG_HUNTER_LEVEL_1",
      description: "Bug Hunter Level 1",
      icon: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png",
    },
    64: {
      name: "HOUSE_BRAVERY",
      description: "HypeSquad Bravery",
      icon: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png",
    },
    128: {
      name: "HOUSE_BRILLIANCE",
      description: "HypeSquad Brilliance",
      icon: "https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png",
    },
    256: {
      name: "HOUSE_BALANCE",
      description: "HypeSquad Balance",
      icon: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png",
    },
    512: {
      name: "EARLY_SUPPORTER",
      description: "Early Nitro Supporter",
      icon: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png",
    },
    16384: {
      name: "BUG_HUNTER_LEVEL_2",
      description: "Bug Hunter Level 2",
      icon: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png",
    },
    131072: {
      name: "VERIFIED_DEVELOPER",
      description: "Early Verified Bot Developer",
      icon: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png",
    },
    262144: {
      name: "CERTIFIED_MODERATOR",
      description: "Certified Moderator",
      icon: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png",
    },
    4194304: {
      name: "ACTIVE_DEVELOPER",
      description: "Active Developer",
      icon: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png",
    },
  };

  const userFlags = [];

  for (const [value, data] of Object.entries(defaultFlagsConfig)) {
    if (flags & parseInt(value)) {
      userFlags.push({
        value: parseInt(value),
        ...data,
      });
    }
  }

  return userFlags;
}

/* ===============================
   Resolve Nitro Type
================================ */
function resolveNitroType(premiumType) {
  const nitroTypes = {
    0: {
      value: 0,
      name: "None",
      description: "No Nitro",
      icon: null,
    },
    1: {
      value: 1,
      name: "Nitro Classic",
      description: "Nitro Classic",
      icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
    },
    2: {
      value: 2,
      name: "Nitro",
      description: "Nitro",
      icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
    },
    3: {
      value: 3,
      name: "Nitro Basic",
      description: "Nitro Basic",
      icon: "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
    },
  };

  return nitroTypes[premiumType] || nitroTypes[0];
}

/* ===============================
   Snowflake → Creation Date
================================ */
function getCreationDate(snowflake) {
  return snowflake / 4194304 + 1420070400000;
}

/* ===============================
   Start Server
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
