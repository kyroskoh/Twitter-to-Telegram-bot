const TelegramBot = require('node-telegram-bot-api');
const Twit = require('twit')
var config = require('./config.json');

// replace the value below with the Telegram token you receive from @BotFather
const token = config.TelegramBotToken;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const chatIds = new Set()

// start
bot.onText(/\/start/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    const chatId = msg.chat.id
    chatIds.add(chatId)
    bot.sendMessage(chatId, 'ChatIDを追加しました，botを起動する。\n登録を解除したい時は、/leave_kcs を入力してください。');
})

//leave
bot.onText(/\/leave_kcs/, (msg, match) => {
    const chatId = msg.chat.id
    chatIds.delete(chatId)
    bot.sendMessage(chatId, 'かしこまりました。登録を解除する。')
})

//streamTwitter

var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    timeout_ms: config.timeout_ms, // optional HTTP request timeout to apply to all requests.
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
})

T.get('/users/show', { screen_name: config.screen_name }, (err, data) => {
    if (err) {
        console.error(err)
        return
    }

    const id = data.id
    const stream = T.stream('statuses/filter', { follow: id })
    stream.on('tweet', (tweet) => {
        chatIds.forEach((chatId) => {
            console.log(id, chatId, tweet.text)
            bot.sendMessage(chatId, tweet.text)
        })
    });

    stream.on('error', (error) => {
        console.error(error)
        chatIds.forEach((chatId) => {
            bot.sendMessage(chatId, 'Error.')
        })
    })
})