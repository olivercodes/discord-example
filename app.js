import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { DiscordRequest, getRoleByName, getMembersNoRole } from './utils.js';
import { to } from 'await-to-js';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data, guild_id } = req.body;
  const rolesUrl = `guilds/${guild_id}/roles`;
  const membersUrl = `guilds/${guild_id}/members?limit=1000`;

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
    let err, yardigan_role_id, members_with_no_role;
    const { name } = data;
    const roleName = 'rolethatdoesntexist';

    if (name === 'lurkers') {
      try {

        [err, yardigan_role_id] = await to( getRoleByName(guild_id, roleName) ); 
        if (err) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `role ${roleName} not found`,
            },
          });
        }

        [err, members_with_no_role] = await to( getMembersNoRole(guild_id, yardigan_role_id) );
        if (err) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `No members found matching the condition DOES_NOT_HAVE: ${roleName}`,
            },
          });
        }

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Members that do not have the yardigans role: ${members_with_no_role}`,
          },
        });
      } catch (err) {
        console.error('error with lurker command: ', err);
      }
    }

    return res.status(400).json({ error: 'unknown command' });
  }

  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
