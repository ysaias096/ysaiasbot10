const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const util = require('util')
const execute = util.promisify(require('child_process').exec)
const moment = require('moment-timezone')
const linkfy = require('linkifyjs')
const { welcometxt } = require('./welcometext')
const antilink = JSON.parse(fs.readFileSync('./src/antilink.json'))
const antilinkhard = JSON.parse(fs.readFileSync('./src/antilinkhard.json'))
const antifake = JSON.parse(fs.readFileSync('./src/antifake.json'))
const blockeds = JSON.parse(fs.readFileSync('./src/blocklist.json'))
const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN: YSAIAS O BRABO\n' 
            + 'ORG:PENTEST;\n' 
            + 'TEL;type=CELL;type=VOICE;waid=557581161565:55 75 8116-1565\n' 
            + 'END:VCARD'
prefix = '#'
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
}

async function starts() {
	const client = new WAConnection()
	client.version = [2, 2119, 6]
	client.logger.level = 'warn'
	console.log(banner.string)
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
	})

	fs.existsSync('./BarBar.json') && client.loadAuthInfo('./BarBar.json')
	client.on('connecting', () => {
		start('2', 'Connecting...')
	})
	client.on('open', () => {
		success('2', 'Connected')
	})
	await client.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./BarBar.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

	client.on('group-participants-update', async (anu) => {
		try {
			const mdata = await client.groupMetadata(anu.jid)
			const dontback = JSON.parse(fs.readFileSync('./src/dontback.json'))
			const dbackid = []
			for(i=0;i<dontback.length;++i) dbackid.push(dontback[i].groupId)
			if(dbackid.indexOf(anu.jid) >= 0) {
				if (anu.action == 'add'){ 
					num = anu.participants[0]
					var ind = dbackid.indexOf(anu.jid)
					if(dontback[ind].actived && dontback[ind].number.indexOf(num.split('@')[0]) >= 0) {
						await client.sendMessage(mdata.id, '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*', MessageType.text)
						client.groupRemove(mdata.id, [num])
					}
				}
			}
			if(antifake.includes(anu.jid)) {
				if (anu.action == 'add'){
					num = anu.participants[0]
					if(!num.split('@')[0].startsWith(55)) {
						client.sendMessage(mdata.id, '.', MessageType.text)
						setTimeout(async function () {
							client.groupRemove(mdata.id, [num])
							return
						}, 1000)
					}
				}
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})

	client.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})
	client.on('chat-update', async (mek) => {
		try {
			if (!mek.hasNewMessage) return
			mek = JSON.parse(JSON.stringify(mek)).messages[0]
			if (!mek.message) return
			if (mek.key && mek.key.remoteJid == 'status@broadcast') return
			if (mek.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
			budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)
			mess = {
				wait: '⌛ Aguarde um pouco... ⌛',
				success: '✔️ Sucesso! ✔️',
				error: {
					stick: '❌ Falha, ocorreu um erro ao converter a imagem em um adesivo ❌',
					Iv: '❌ Link inválido ❌'
				},
				only: {
					group: '❌ Este comando só pode ser usado em grupos! ❌',
					ownerG: '❌ Este comando só pode ser usado pelo grupo proprietário! ❌',
					ownerB: '❌ Este comando só pode ser usado pelo bot proprietário! ❌',
					admin: '*Por acaso você é adm ? acho que não né.. então para de usar esse comando macaco 🐒*',
					Badmin: '❌ Este comando só pode ser usado quando o bot se torna administrador! ❌'
				}
			}

			const antipv = JSON.parse(fs.readFileSync('./src/antipv.json'))
			const botNumber = client.user.jid
			const OriginalOwner = '557581161565'
			const ownerNumber = ["557581161565@s.whatsapp.net"] // replace this with your number
			const isGroup = from.endsWith('@g.us')
			const dontback = JSON.parse(fs.readFileSync('./src/json/dontback.json'))
			const sender = isGroup ? mek.participant : mek.key.remoteJid
			const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
			const isAntiFake = isGroup ? antifake.includes(from) : false
			const isAntiPv = (antipv.indexOf('Ativado') >= 0) ? true : false
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isAntiLink = isGroup ? antilink.includes(from) : false
			const isAntiLinkHard = isGroup ? antilinkhard.includes(from) : false
			const isOwner = ownerNumber.includes(sender)
			
			const isUrl = (url) => {
				if(linkfy.find(url)[0]) return true
				return false
			}
			const reply = (teks) => {
				client.sendMessage(from, teks, text, {quoted:mek})
			}
			const sendMess = (hehe, teks) => {
				client.sendMessage(hehe, teks, text)
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : client.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
			}

			colors = ['red','white','black','blue','yellow','green']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			if(isCmd && blockeds.includes(sender)) return reply('*❌NUMERO BLOQUEADO❌*')
			if(isAntiPv && !isOwner && !isGroup) {
				reply('*PV BLOQUEADO, LOGO SERA BLOQUEADO*')
				client.blockUser(sender, 'add')
				return
			}
			if(isUrl(budy) && isAntiLinkHard && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(isUrl(budy) && isAntiLinkHard && isGroupAdmins && isBotGroupAdmins) {
				reply('𝗖𝗮𝗿𝗮𝗹𝗵𝗼 𝗾𝘂𝗮𝘀𝗲 𝘁𝗲 𝗯𝗮𝗻𝗶 𝗺𝗮𝗻𝗼 𝗸𝗸𝗸𝗸𝗸𝗸𝗸, 𝗺𝗮𝗶𝘀 𝗮𝗶́ 𝘃𝗶 𝗾𝘂𝗲 𝘃𝗼𝗰𝗲̂ 𝗲́ 𝗮𝗱𝗺 𝗲𝗻𝘁𝗮̃𝗼 𝘃𝗼𝗰𝗲̂ 𝗽𝗼𝗱𝗲 😎👍')
			}

			if(budy.includes('chat.whatsapp.com/') && isAntiLink && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(budy.includes('://chat.whatsapp.com/') && isAntiLink && isGroupAdmins && isBotGroupAdmins) {
				reply('𝗖𝗮𝗿𝗮𝗹𝗵𝗼 𝗾𝘂𝗮𝘀𝗲 𝘁𝗲 𝗯𝗮𝗻𝗶 𝗺𝗮𝗻𝗼 𝗸𝗸𝗸𝗸𝗸𝗸𝗸, 𝗺𝗮𝗶𝘀 𝗮𝗶́ 𝘃𝗶 𝗾𝘂𝗲 𝘃𝗼𝗰𝗲̂ 𝗲́ 𝗮𝗱𝗺 𝗲𝗻𝘁𝗮̃𝗼 𝘃𝗼𝗰𝗲̂ 𝗽𝗼𝗱𝗲 😎👍')
			}
			if(budy.includes('://youtube.com/channel') && isAntiLink && !isGroupAdmins && isBotGroupAdmins) {
				kic = `${sender.split("@")[0]}@s.whatsapp.net`
				client.groupRemove(from, [kic])
			}
			if(budy.includes('://youtube.com/channel') && isAntiLink && isGroupAdmins && isBotGroupAdmins) {
				reply('𝗖𝗮𝗿𝗮𝗹𝗵𝗼 𝗾𝘂𝗮𝘀𝗲 𝘁𝗲 𝗯𝗮𝗻𝗶 𝗺𝗮𝗻𝗼 𝗸𝗸𝗸𝗸𝗸𝗸𝗸, 𝗺𝗮𝗶𝘀 𝗮𝗶́ 𝘃𝗶 𝗾𝘂𝗲 𝘃𝗼𝗰𝗲̂ 𝗲́ 𝗮𝗱𝗺 𝗲𝗻𝘁𝗮̃𝗼 𝘃𝗼𝗰𝗲̂ 𝗽𝗼𝗱𝗲 😎👍')
			}

			const dbids = []
			for(i=0;i<dontback.length;++i) {
				dbids.push(dontback[i].groupId)
			}
			const isDontBack = (isGroup && dbids.indexOf(from) >= 0) ? true : false

			switch(command) {
				case 'addlista':
					if (!isGroup) return reply(mess.only.admin)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Diga o numero sem espaço, + ou traço')
					if (isNaN(args[0])) return reply('Diga o numero sem espaço, + ou traço')
					var ind = dbids.indexOf(from)
					if(isDontBack) {
						var numind = dontback[ind].number.indexOf(args[0])
						if(numind >= 0) return reply('𝗘𝘀𝘀𝗲 𝗺𝗮𝗰𝗮𝗰𝗼 🐒 𝗷𝗮́ 𝘁𝗮́ 𝗻𝗮 𝗹𝗶𝘀𝘁𝗮')
						dontback[ind].number.push(args[0])
					} else {
						dontback.push({
							groupId: from,
							actived: false,
							number: [args[0]]
						})
					}
					fs.writeFileSync('./src/dontback.json', JSON.stringify(dontback, null, 2) + '\n')
					reply(`𝗘𝘀𝘀𝗲 𝗺𝗮𝗰𝗮𝗰𝗼 🐒 𝗻𝗮̃𝗼 𝗲𝗻𝘁𝗿𝗮 𝗺𝗮𝗶𝘀 𝗮𝗾𝘂𝗶 🤬`)

				break
				case 'removerlista':
					if (!isGroup) return reply(mess.only.admin)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Diga o numero sem espaço, + ou traço')
					if (isNaN(args[0])) return reply('Diga o numero sem espaço, + ou traço')
					var ind = dbids.indexOf(from)
					if(!isDontBack) return reply('*Nenhum Número não foi adicionado*')
					var numind = dontback[ind].number.indexOf(args[0])
					if(numind < 0) return reply('*Esse número não está incluso*')
					dontback[ind].number.splice(numind, 1)
					fs.writeFileSync('./src/dontback.json', JSON.stringify(dontback, null, 2) + '\n')
					reply(`𝗗𝗲𝘂 𝘀𝗼𝗿𝘁𝗲 𝗸𝗸𝗸 𝗻𝗮̃𝗼 𝘁𝗮́ 𝗺𝗮𝗶𝘀 𝗻𝗮 𝗺𝗶𝗻𝗵𝗮 𝗹𝗶𝘀𝘁𝗮 𝗻𝗲𝗴𝗿𝗮 😎`)
				break
				case 'listanegra':
					if (!isGroup) return reply(mess.only.admin)
					if (!isGroupAdmins) return reply(mess.only.admin)
					var ind = dbids.indexOf(from)
					if(!isDontBack) return reply('*Nenhum Número não foi adicionado*')
					teks = '*Números que vou moer na porrada se voltar 😡:*\n'
					for(i=0;i<dontback[ind].number.length;++i) {
						teks += `➤ *${dontback[ind].number[i]}*\n`
					}
					teks += '*Esses ai vou descer meu martelo do ban 🥵*'
					reply(teks)
				break
				case 'antipv':
					try {
					if (!isOwner) return reply(mess.only.ownerB)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isAntiPv) return reply('Ja esta ativo')
						antipv.push('Ativado')
						fs.writeFileSync('./src/antipv.json', JSON.stringify(antipv))
						reply('Ativou com sucesso o recurso de antipv no bot✔️')
					} else if (Number(args[0]) === 0) {
						fs.writeFileSync('./src/antipv.json', JSON.stringify([]))
						reply('Desativou com sucesso o recurso de antipv no bot✔️')
					} else {
						reply('1 para ativar, 0 para desativar')
					}
					} catch {
						reply('Deu erro')
					}
                break
				case 'blacklist':
					try{
						mem_id = []
						list = 'Lista das pessoas que não obedeço 🤏😎: \n'
						for( i = 0; i < blockeds.length; i++) {
							list += '@'+blockeds[i].split('@')[0]+'\n'
							mem_id += blockeds[i]
						}
					client.sendMessage(from, list, extendedText, {quoted: mek, contextInfo: { "mentionedJid": mem_id}})
				} catch {
					reply('Deu erro :/')
				}
					break
				case 'block':
					try{
						if(!isOwner) return reply('𝗩𝗼𝗰𝗲̂ 𝗻𝗲𝗺 𝗲́ 𝗼 𝗬𝘀𝗮𝗶𝗮𝘀 𝗩𝗲𝘆 𝗸𝗸𝗸 𝘀𝗮𝗶 𝗳𝗼𝗿𝗮')
						if(args.length <1 ) return reply('Cade o número?')
						num = args[0]
						if(args[0].startsWith('@')){ num = num.slice(1)}
						if(isNaN(num)) return reply('Isso não é um numero de telefone')
						if(num == OriginalOwner) return reply('Não posso bloquear meu propietário')
						if(blockeds.includes(num+'@s.whatsapp.net')) return reply('Ja está bloqueado')
						blockeds.push(num+'@s.whatsapp.net')
						fs.writeFileSync('./src/blocklist.json', JSON.stringify(blockeds))
						client.blockUser([num+'@s.whatsapp.net'], 'add')
						reply('𝘁𝗮́ 𝗯𝗹𝗼𝗾𝘂𝗲𝗮𝗱𝗼 𝗼𝘁𝗮́𝗿𝗶𝗼 𝗸𝗸𝗸𝗸')
					} catch {
						reply('Deu erro :/')
					}
					break
				case 'unblock':
					try{
						if(!isOwner) return reply('Somente meu propietário e autorizados podem usar esse comando')
						if(args.length <1 ) return reply('Cade o número?')
						num = args[0]
						if(num.startsWith('@')){ num = num.slice(1)}
						if(isNaN(num)) return reply('Isso não é um numero de telefone')
						if(!blockeds.includes(num+'@s.whatsapp.net')) return reply('Ja está desbloqueado')
						var indice = blockeds.indexOf(num+'@s.whatsapp.net');
						blockeds.splice(indice, 1);
						fs.writeFileSync('./src/blocklist.json', JSON.stringify(blockeds))
						client.blockUser([num+'@s.whatsapp.net'], 'remove')
						reply('*✅ Desbloqueado com sucesso ✅*')
					} catch {
						reply('Deu erro :/')
					}
				break
				case 'listonline':
					try{
						if (!isGroup) return reply(mess.only.group)
						client.updatePresence(from, Presence.composing)
						client.requestPresenceUpdate(from, Presence.available)
						let online = [...Object.keys(client.chats.get(from).presences)]
						client.sendMessage(from, '𝐌𝐚𝐜𝐚𝐪𝐮𝐢𝐧𝐡𝐨𝐬🐒 𝐨𝐧𝐥𝐢𝐧𝐞👀:\n\n' + online.map(v => '- @' + v.replace(/@.+/, '')).join`\n`, extendedText, {quoted: mek, contextInfo: {"mentionedJid": online}})
					} catch {
						reply(msgerr)
					}
				break
				case 'criador':
					try {
					client.sendMessage(from, {displayname: "KABULOS-BOT", vcard: vcard}, MessageType.contact, { quoted: mek})
       				client.sendMessage(from, '𝗘𝘀𝘀𝗲 𝗼 𝗻𝘂́𝗺𝗲𝗿𝗼 𝗱𝗼 𝗺𝗲𝘂 𝗽𝗮𝗶, 𝗼 𝗯𝗮𝗶𝗮𝗻𝗼 𝗺𝗮𝗶𝘀 𝗿𝗲𝘀𝗽𝗲𝗶𝘁𝗮𝗱𝗼 𝗱𝗮 𝘄𝗲𝗯 💻🔥',MessageType.text, { quoted: mek} )
					} catch {
						reply(msgerr)
					}
				break
				case 'gerarcc':
					try{
                   reply(`carregando`)
				   anu = await fetchJson(`https://videfikri.com/api/ccgenerator/`, {method:'get'})
				   teks = `*✅ Cartão Gerado com sucesso ✅*\n*💳NÚMERO*: ${anu.result.card.number}\n*💳️BANDEIRA*: ${anu.result.card.network}\n*💳CVV*: ${anu.result.card.cvv}\n*💳PIN*: ${anu.result.card.pin}\n*💳️DINHEIRO NA CONTA*: ${anu.result.card.balance}\n*💳️EXPIRAR-MÊS*: Personalizado\n*💳VENCIMENTO*: Custume\n*💳️PAÍS*: ${anu.result.customer.country}\n*💳NOME*: ${anu.result.customer.name}\n*??ENDEREÇO*: ${anu.result.customer.address}`
				   client.sendMessage(from, teks, text, {quoted: mek})
				} catch (e) {
					console.log(e)
					reply(msgerr)
				}
				   break
				case 'attp':
					try{                 
			     	if (args.length < 1) return reply(`_Coloque o texto _\n\n*Exemplo ${prefix}stc Daddy*`)
                    	url = encodeURI(`https://api.xteam.xyz/attp?file&text=${body.slice(6)}`)
		    			attp2 = await getBuffer(url)
			    		client.sendMessage(from, attp2, sticker, {quoted: mek})
					} catch {
						reply(msgerr)
					}
			    break
				case 'menu':
					cr = 'YSAIAS-BOT'
					client.sendMessage(from, help(prefix), text, {quoted: mek, quoted: { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { "imageMessage": { "url": "https://mmg.whatsapp.net/d/f/At0x7ZdIvuicfjlf9oWS6A3AR9XPh0P-hZIVPLsI70nM.enc", "mimetype": "image/jpeg","caption": cr, 'jpegThumbnail': fs.readFileSync('./img/logobot.jpg')}}}})
					break
				case 'f':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage != undefined || mek.message.extendedTextMessage != null) {
						num1 = mek.message.extendedTextMessage.contextInfo.participant
						client.sendMessage(from, `𝗩𝗮𝘇𝗮 @${num1.split('@')[0]} 𝗡𝗶𝗻𝗴𝘂𝗲́𝗺 𝘁𝗲 𝗾𝘂𝗲𝗿 𝗮𝗾𝘂𝗶 𝗹𝗶𝘅𝗼🗑️ 𝗿𝗲𝘀𝘁𝗼 𝗱𝗲 𝗮𝗯𝗼𝗿𝘁𝗼 🤣🤣`, extendedText, {quoted: mek, contextInfo: { mentionedJid: [num1]}})
						client.groupRemove(from, [num1])
					}
					else { 
						reply('Responda a mensagem da pessoa')
					}
				break
				case 'antifake':
					try {
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (args.length < 1) return reply('Hmmmm')
					if (Number(args[0]) === 1) {
						if (isAntiFake) return reply('Ja esta ativo')
						antifake.push(from)
						fs.writeFileSync('./src/antifake.json', JSON.stringify(antifake))
						reply('Ativou com sucesso o recurso de antifake neste grupo✔️')
					} else if (Number(args[0]) === 0) {
						antifake.splice(from, 1)
						fs.writeFileSync('./src/antifake.json', JSON.stringify(antifake))
						reply('Desativou com sucesso o recurso de antifake neste grupo✔️')
					} else {
						reply('1 para ativar, 0 para desativar')
					}
					} catch {
						reply('erro ao fazer esse comando')
					}
                break
				case 'antilink':
					try {
						if (!isGroup) return reply(mess.only.group)
						if (!isGroupAdmins) return reply(mess.only.admin)
						if (args.length < 1) return reply('Hmmmm')
						if (Number(args[0]) === 1) {
							if (isAntiLink) return reply('Ja esta ativo')
							antilink.push(from)
							fs.writeFileSync('./src/antilink.json', JSON.stringify(antilink))
							reply('Ativou com sucesso o recurso de antilink neste grupo✔️')
						} else if (Number(args[0]) === 0) {
							antilink.splice(from, 1)
							fs.writeFileSync('./src/antilink.json', JSON.stringify(antilink))
							reply('Desativou com sucesso o recurso de antilink neste grupo✔️')
						} else {
							reply('1 para ativar, 0 para desativar')
						}
					} catch {
						reply('Deu erro, tente novamente :/')
					}
					break
				case 'antilinkhard':
					try {
						if (!isGroup) return reply(mess.only.group)
						if (!isGroupAdmins) return reply(mess.only.admin)
						if (args.length < 1) return reply('Hmmmm')
						if (Number(args[0]) === 1) {
							if (isAntiLinkHard) return reply('Ja esta ativo')
							antilinkhard.push(from)
							fs.writeFileSync('./src/antilinkhard.json', JSON.stringify(antilinkhard))
							reply('Ativou com sucesso o recurso de antilink hardcore neste grupo✔️')
						} else if (Number(args[0]) === 0) {
							antilinkhard.splice(from, 1)
							fs.writeFileSync('./src/antilinkhard.json', JSON.stringify(antilinkhard))
							reply('Desativou com sucesso o recurso de antilink harcore neste grupo✔️')
						} else {
							reply('1 para ativar, 0 para desativar')
						}
					} catch {
						reply('Deu erro, tente novamente :/')
					}
				break
				case 'kick':
					if (!isGroup) return reply(mess.only.group)
					if (!isGroupAdmins) return reply(mess.only.admin)
					if (!isBotGroupAdmins) return reply(mess.only.Badmin)
					if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag target yang ingin di tendang!')
					mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
					if (mentioned.length > 1) {
						teks = 'Pedidos recebidos, emitidos :\n'
						for (let _ of mentioned) {
							teks += `@${_.split('@')[0]}\n`
						}
						mentions(teks, mentioned, true)
						client.groupRemove(from, mentioned)
					} else {
						mentions(`Pedidos recebidos, emitidos : @${mentioned[0].split('@')[0]}`, mentioned, true)
						client.groupRemove(from, mentioned)
					}
					break
				default:
					console.log(color('[ERROR]','red'), 'Unregistered Command from', color(sender.split('@')[0]))

			}
			
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
starts()
