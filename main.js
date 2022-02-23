const util = require('minecraft-server-util');
const Discord = require('discord.js');
require('dotenv').config();
var fs = require('fs');
var data = fs.readFileSync('config.json');
var config = JSON.parse(data);

let TOKEN = process.env.TOKEN;
const url = 'https://api.minetools.eu/ping/135.125.123.119/25600/'
const client = new Discord.Client({intents: ["GUILDS","GUILD_MESSAGES"]});

client.on('ready', () => {
    console.log(`Uspešno prijavil kot ${client.user.tag} ob`, new Date())
    client.user.setActivity('/help', { type: 'LISTENING' })
    console.log('Config: ' + config.ip + ':' + config.port)
    const guildId = '925536241473183744'
	const guild = client.guilds.cache.get(guildId)
	let commands

	if (guild) {
		commands = guild.commands
	} else {
		commands = client.application?.commands
	}

	commands?.create({
		name: 'status',
		description: 'Preveri status ŠKG serverja'
	})
    commands?.create({
		name: 'help',
		description: 'Prikaz pomoči za uporabo ŠKG bota'
	})
    commands?.create({
		name: 'nastavi',
		description: 'Spremeni nastavitve za server status.',
		options: [
			{
				name: 'ip',
				description: 'Internetni Protokol za dostop do serverja',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
                value: '135.125.123.119'
			},
			{
				name: 'port',
				description: 'Vrata',
				required: true,
				type: Discord.Constants.ApplicationCommandOptionTypes.NUMBER,
                value: 25600
			}
		]
	})
})

const helpEmbed = {
	color: 0x0099ff,
	title: 'Pomoč',
	url: 'https://slovenski.tech/škg-bot',

	description: 'Lista vseh komand in njihova uporaba',
	fields: [
		{
			name: 'Prikaz pomoči',
			value: '*skg!help* ali */help* ',
		},
        {
			name: 'Status serverja',
			value: '*/status*',
			inline: false,
		},
        {
			name: 'Nastavitve',
			value: '*/nastavi {ip} {port}* \nSpremeni port in IP katerega status se bo prikazal',
			inline: false,
		},
        {
			name: '\u200b',
			value: '\u200b',
			inline: false,
		},
	],
	footer: {
		text: 'Made with \u2764 by SlovenianGamer#0498',
		icon_url: 'https://i.imgur.com/P6gfgTu.png',
	},
};

const utiloptions = {
    timeout: 1000 * 5, // timeout in milliseconds
    enableSRV: true // SRV record lookup
};  

client.on("messageCreate", async (message) => {
    if (message.content == "skg!help"){
        message.channel.send({embeds: [helpEmbed]})
    }
})

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return
	}
	const { commandName, options} = interaction
	if (commandName === 'status') {
        const request = await util.status(config.ip, config.port, utiloptions)
            //message.channel.send('Igralci online: **' + request.players.online + '** od **' + request.players.max + '**' + '\nVerzija: *' + request.version.name + '*' + '\nIP: `' + ip + ':' + port + '`')
            // const base64_img = request.favicon;
            // const sfbuff = new Buffer.from(base64_img.split(",")[1], "base64");
            // const sfattach = new Discord.MessageAttachment(sfbuff, "output.png");
            // message.channel.send(sfattach)
            const response = JSON.parse(JSON.stringify(request));
            const data = await response;
            const a = data.players.sample;
            if (a === undefined || a === '' || a === null) {
                console.log('Ni igralcev ob uri ' + formatAMPM(new Date))
                const serverStatus = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Status ŠKG serverja')
                .addFields({ name: 'IP: ', value: '`' + config.ip + ':' + config.port + '`' },
                            {name: 'Igralci Online: ', value: '***' + request.players.online + '*** od ***' + request.players.max + '***'},
                            {name: 'Verzija: ', value: '*' + request.version.name + '* ' + '\nprotokol' + request.version.protocol},
                            {name: 'Imena igralcev: ', value: '*' + 'ni igralcev' + '*'}
                )
                .setTimestamp()
                .setFooter({text: 'Made with \u2764 by SlovenianGamer#0498',icon_url: 'https://i.imgur.com/P6gfgTu.png'});
                interaction.reply({
                ephemeral: false,
                embeds: [serverStatus]
                })
            } else {
            const names =
            a.map(({name:actualValue})=>actualValue);
            const newArray = await JSON.parse(JSON.stringify(names).replace(/§f/g, ' '));
            const serverStatus = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Status ŠKG serverja')
            .addFields({ name: 'IP: ', value: '`' + config.ip + ':' + config.port + '`' },
                        {name: 'Igralci Online: ', value: '***' + request.players.online + '*** od ***' + request.players.max + '***'},
                        {name: 'Verzija: ', value: '*' + request.version.name + '* ' + '\nprotokol ' + request.version.protocol},
                        {name: 'Imena igralcev: ', value: '[' + newArray + ']'}
            )
            .setTimestamp()
            .setFooter({text: 'Made with \u2764 by SlovenianGamer#0498', icon_url: 'https://i.imgur.com/P6gfgTu.png'});
            interaction.reply({
			ephemeral: false,
			embeds: [serverStatus]
			})
        }
        } else if (commandName === 'nastavi') {
            oldip = config.ip
            oldport = config.port
			config.ip = options.getString('ip') || 0
			config.port = options.getNumber('port') || 0
			interaction.reply({
				content: 'IP spremenjen iz: `' + oldip + ':' + oldport + '`' + ' na `' + config.ip + ':' + config.port + '`'
			})
            fs.writeFile("./config.json", JSON.stringify(config, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    return;
                };
            console.log('Config je bil posodobljen na: ' + config.ip + ':' + config.port + ' ob ' + formatAMPM(new Date))
            });
		} else if (commandName === 'help') {
            interaction.reply({ embeds: [helpEmbed], ephemeral: true})
        }
})

client.login(TOKEN);