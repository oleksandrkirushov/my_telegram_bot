import  TelegramApi  from 'node-telegram-bot-api'
import  {MENEG} from './data/index.js'
import {PIDPR} from "./data/index.js";

const token= '7205118617:AAFufFeJLMrJoZofrCpC6_xHl45TM3sIO4U'

const bot= new TelegramApi(token, {polling:true})

const gl={
  index:0,
  list:[],
  interval: 3000,
  chatId: null,
  askId: null,
}

const nextButton = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text:"Next", callback_data:"/next"}]
    ]
  })
}



bot.on('message', async msg=>{
  gl.chatId=msg.chat.id;

  if(msg.text==='/start'){
    bot.setMyCommands([
      {command:"/next", description:'next'},
      ...createCommands(PIDPR)
    ])
    return bot.sendMessage(gl.chatId, 'Please choose question in <b>MENU</b>', { parse_mode: "HTML" });
  }


  if (msg.text !== '/next') {
    gl.askId=msg.text.replace(/\//,'');
    gl.index = 0
    preparetion(gl.askId)
  }

  return getAnswer();
})

bot.on('callback_query', async msg => {
  gl.chatId = msg.message.chat.id;
  
  if (msg.data === '/next') {
    return getAnswer()
  }
})

// function getNext(){
//   const arr=gl.list;

//   setTimeout(()=>{

//     for(let i=gl.index+1; i<arr.length; i++){
//       sendTextPart(i, arr, true)

//       if (i+1===((gl.index+1)/10+1)*10){
//         gl.index=i;
//         return
//       }
//     }

//   },3000)
// }

function  getAnswer(){
  const arr = gl.list;
  const start = gl.index;
  const end = gl.index + 10;
  const answer = [...arr].slice(start, end).reverse();
  const isHasLastEl = answer.includes(arr[arr.length - 1]);
  
  gl.index = end;

  setTimeout(() => {
    answer.forEach((item, i, array) => {
        const isNextButton=(!isHasLastEl && (i===array.length-1))
        sendTextPart(i, arr, item, isNextButton)
      });
  },3000)
}

function preparetion(id) {
  const text = PIDPR.find(item => id === item.id)?.text;
  gl.list= splitStringBy200Chars(text);
}

function splitString(str) {
  const count=200;
  let result = [];
  for (let i = 0; i < str?.length; i += count) {
    result.push(str.substring(i, i + count));
  }
  return result;
}

function sendTextPart(i, arr, item, isNextButton=false){
  const order = arr.findIndex(x => x === item);
  const message = `[${(order === arr.length - 1 ? 'END ' : '') + (order + 1)}] ` + item;
  const options=isNextButton?nextButton:{}
  
  setTimeout(()=>{
      bot.sendMessage(gl.chatId, message, options)},
    gl.interval*i);
}

function createCommands(data){
  return data.map(x=>{
    return {command:x.id, description: x.name}
  })
}

function splitStringBy200Chars(text) {
  const maxChunkSize = 200;
  const chunks = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    let endPosition = currentPosition + maxChunkSize;

    // Якщо кінець частини не досягає кінця рядка і не закінчується пробілом, шукаємо найближчий пробіл зліва
    if (endPosition < text.length && text[endPosition] !== ' ') {
      endPosition = text.lastIndexOf(' ', endPosition);

      // Якщо пробіл не знайдено, це означає, що слово більше 200 символів, просто ріжемо слово
      if (endPosition <= currentPosition) {
        endPosition = currentPosition + maxChunkSize;
      }
    }

    chunks.push(text.slice(currentPosition, endPosition).trim());
    currentPosition = endPosition + 1; // Пропускаємо пробіл
  }

  return chunks;
}
