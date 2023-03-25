import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import { discordConfig } from "../../config";
import cron from "node-cron";
// import listings from "./cron/listings";
// import sales from "./cron/sales";
import raids from "./cron/raids";
// import tome from "./cron/tome";
import crawl from "./cron/crawl";
import { getPrice } from "./status/price";
// import tome from "./cron/tome";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("app/services/discord/commands")
  .filter((file) => file.endsWith(".ts"));

  console.log(commandFiles)

client.once("ready", async () => {
  for (const file of commandFiles) {
    let name = file.replace(".ts", ".js");

    const command = require(`./commands/${name}`);

    // console.log(command.data.name)
    client.commands.set(command.default.data.name, command);
  }
  // cron.schedule("*/2 * * * *", () => {
  //   sales.execute(client);
  // });
  // cron.schedule("*/2 * * * *", () => {
  //   listings.execute(client);
  // });
  cron.schedule("20 * * * * *", () => {
    raids.execute(client);
  });
  cron.schedule("* * 1 * * *", () => {
    crawl.execute(client);
  });
  cron.schedule("*/2 * * * *", async () => {
    client.user?.setActivity(await getPrice(), { name: "WATCHING" });
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.default.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true
    });
  }
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith(discordConfig.prefix) || msg.author.bot) return;

  const args: any = msg.content
    .slice(discordConfig.prefix.length)
    .trim()
    .split(" ");
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("there was an error trying to execute that command!");
  }
});

client.login(discordConfig.token);


export default client;
