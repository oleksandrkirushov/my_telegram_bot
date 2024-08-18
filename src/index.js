import  TelegramApi  from 'node-telegram-bot-api'
import  {MENEG} from './data/index.js'

const token= process.env.TELEGRAM_BOT_TOKEN

const bot= new TelegramApi(token, {polling:true})

const gl={
  index:0,
  list:[],
  interval:2000,
  chatId: null,
  askId: null,
}
const regex=new RegExp(/^\//, 'g')

bot.setMyCommands([
  {command:"/next", description:'next'},
  ...createCommands(MENEG)
])

bot.on('message', async msg=>{
  console.log('msg.text >>', msg.text)
  gl.chatId=msg.chat.id;

  if(msg.text==='/start'){
    return  bot.sendMessage(gl.chatId, 'Please choose question in <b>MENU</b>', {parse_mode : "HTML"})
  }

  if(msg.text==='/next'){
    return getNext()
  }
  
  console.log('regex.test(msg.text) >>', regex.test(msg.text))

  // if(regex.test(msg.text)){
    gl.askId=msg.text.replace(/\//,'');
  // }else {
  //   gl.askId=msg.text
  // }


  return getAnswer(gl.askId);

})

function getNext(){
  const arr=gl.list;

  setTimeout(()=>{

    for(let i=gl.index+1; i<arr.length; i++){
      sendTextPart(i, arr, true)

      if (i+1===((gl.index+1)/10+1)*10){
        gl.index=i;
        return
      }
    }

  },3000)
}

function  getAnswer(id){
  const text = MENEG.find(item=>id===item.id)?.text;
  gl.list= splitStringBy200Chars(text);
  const arr=gl.list

  setTimeout(()=>{

    for(let i=0; i<arr.length; i++){
      sendTextPart(i, arr)

      if (i+1===10){
        gl.index=i;
        return
      }
    }
  },3000)
}

function splitString(str) {
  const count=200;
  let result = [];
  for (let i = 0; i < str?.length; i += count) {
    result.push(str.substring(i, i + count));
  }
  return result;
}

function sendTextPart(i, arr, nextMode=false){
  const message=`[${(i === arr.length-1?'END ':'')+(i+1)}] ` + arr[i];
  const index= !nextMode?i:i%10
  setTimeout(()=>{
      bot.sendMessage(gl.chatId, message, {parse_mode : "HTML"})},
    gl.interval*index);
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
