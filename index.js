const mineflayer = require('mineflayer');
const axios = require('axios');

// بيانات الاتصال بسيرفرك
const botOptions = {
    host: 'MM2BXS3.aternos.me',
    port: 45379,
    username: 'Bot_AFK_24'
};

// بيانات التليجرام الخاصة بك التي استخرجناها
const TELEGRAM_TOKEN = '8696372248:AAHwMz-fkfpT3Safhf_OGy05duNu91ds7uo';
const TELEGRAM_CHAT_ID = '8288001731';

// وظيفة إرسال الرسائل لتليجرام
function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
    }).catch(err => console.log('خطأ في التليجرام:', err.message));
}

let bot;

function createBot() {
    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        sendToTelegram('✅ تم دخول البوت للسيرفر بنجاح وهو الآن يراقب الشات!');
        // أوامر التسجيل
        bot.chat('/register 1234567890 1234567890'); 
        bot.chat('/login 1234567890');           
        setTimeout(randomMove, 3000);
    });

    // تسجيل الشات وإرساله لتليجرام
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        sendToTelegram(`💬 [${username}]: ${message}`);
    });

    // تسجيل رسائل النظام المهمة
    bot.on('messagestr', (message) => {
        if (message.includes('joined') || message.includes('left') || message.includes('/')) {
            sendToTelegram(`📢 ${message}`);
        }
    });

    // نظام الحركة لمنع الطرد (AFK) والحماية من الحمم
    function isSafe(action) {
        if (!bot.entity) return false;
        const nextPos = bot.entity.position.clone();
        if (action === 'forward') nextPos.x += 1;
        if (action === 'back') nextPos.x -= 1;
        if (action === 'left') nextPos.z -= 1;
        if (action === 'right') nextPos.z += 1;
        const block = bot.blockAt(nextPos);
        const blockBelow = bot.blockAt(nextPos.offset(0, -1, 0));
        if (block?.name.includes('lava') || blockBelow?.name.includes('lava')) return false;
        if (blockBelow?.name === 'air' && bot.blockAt(nextPos.offset(0, -2, 0))?.name === 'air') return false;
        return true;
    }

    function randomMove() {
        if (!bot.entity) return;
        const actions = ['forward', 'back', 'left', 'right'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        if (isSafe(randomAction)) {
            bot.setControlState(randomAction, true);
            if (Math.random() > 0.8) bot.setControlState('jump', true);
            setTimeout(() => {
                bot.clearControlStates();
                setTimeout(randomMove, Math.random() * 3000 + 1000);
            }, 1000);
        } else {
            setTimeout(randomMove, 100);
        }
    }

    bot.on('end', (reason) => {
        sendToTelegram(`⚠️ البوت خرج: ${reason}. سيعود بعد 15 ثانية.`);
        setTimeout(createBot, 15000); 
    });

    bot.on('error', (err) => {
        console.log('خطأ اتصال:', err.message);
        setTimeout(createBot, 15000);
    });
}

createBot();
