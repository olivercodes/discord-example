import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data, guild_id } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command - use this to verify you intalled the bot correctly
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }
    
    if (name === 'lurkers') {
      const rolesUrl = `guilds/${guild_id}/roles`;
      const membersUrl = `guilds/${guild_id}/members?limit=1000`;
      try {
        const rolesResponse = await DiscordRequest(rolesUrl, {
          method: 'GET',
        });

        const roles = await rolesResponse.json();
        const yardigan_role_id = roles
          .filter(role => role.name === 'yardigans')
          .map(role => role.id)
          .join(", ");

        console.log(yardigan_role_id);

        const membersResponse = await DiscordRequest(membersUrl, {
          method: 'GET',
        });

        const members = await membersResponse.json();
        console.log(members);
        const members_with_no_role = members
          .filter(member => member.roles.includes(yardigan_role_id) !== true)
          .map(member => (member.user.username))
          .join(", ");

        console.log("members with no role", members_with_no_role);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Members that do not have the yardigans role: ${members_with_no_role}`,
          },
        });

        console.log("members", members_with_no_role);


      } catch (err) {
        console.error('error with lurker command: ', err);
      }
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
