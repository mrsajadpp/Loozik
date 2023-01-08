require('dotenv').config();

const express = require('express')();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { Player } = require("discord-player")

const fs = require('fs');
const path = require('path');

//express.listen(3004)
/*express.get('/', (req, res) => {
    res.send('Loozik') 
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .catch((err) => { let errrr = err; });
    }
})*/

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

// List of all commands
const commands = [];
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands"); // E:\yt\discord bot\js\intro\commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Add the player on the client
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

client.on("ready", () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setPresence({
        activities: [{ name: `song!`, type: ActivityType.Playing }]
    });
    // Get all ids of the servers
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Successfully updated commands for guild ' + guildId))
            .catch((err) => { let errrr = err; });
    }
});

client.on('messageCreate', message => {
    client.user.setPresence({
        activities: [{ name: `song!`, type: ActivityType.Playing }]
    });
    // Get all ids of the servers
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .catch((err) => { let errrr = err; });
    }
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute({ client, interaction });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command" });
    }
});

client.login(process.env.TOKEN);