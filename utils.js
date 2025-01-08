import 'dotenv/config';
import { to } from 'await-to-js';

const DISCORD_GET = { method: 'GET' };

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;

  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);

  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });

  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }

  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

export async function getRoleByName(guildId, roleName) {
  const rolesUrl = `guilds/${guildId}/roles`;

  const [err, rolesResponse] = await to( DiscordRequest(rolesUrl, DISCORD_GET ));
  if (err) {
    return Promise.reject(`Failed to fetch roles from the discord server: ${rolesUrl}`);
  }

  const roles = await rolesResponse.json();
  const roleId = roles
    .filter(role => role.name === roleName)
    .map(role => role.id)
    .join(", ");

  if (!roleId) {
    return Promise.reject('role not found');
  }

  return roleId;
}

export async function getMembersNoRole(guild_id, role_id) {
  const membersUrl = `guilds/${guild_id}/members?limit=1000`;
  const [err, members] = await to( DiscordRequest(membersUrl, DISCORD_GET ));
  if (err) {
    return Promise.reject(`failed to fetch members from discord server: ${err}`);
  }

  const allMembers = await members.json();
  const members_no_role = allMembers
    .filter(member => member.roles.includes(role_id) !== true)
    .map(member => (member.user.username))
    .join(", ");

  if (!members_no_role) {
    return Promise.reject(`No members matching the condition were found.`);
  }

  return members_no_role;
}
