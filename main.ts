 import * as express from "express"
 import { sqlquery } from "./database"
 import {createHash} from "crypto"


const MESSAGES_AT_ONCE=10
const TIME_DIFFERENCE=1

 function sqlToJsDate(sqlDate){  
    const datetime=sqlDate.split(" ")
    const date=datetime[0].split("-")
    const time=datetime[1].split(":")
    log(date)
    log(time)
    return new Date(parseInt(date[0]),parseInt(date[1]),parseInt(date[2]),parseInt(time[0]),parseInt(time[1]),parseInt(time[2]),0);
}

async function salt(user:string){
    const t:any=await sqlquery(`select salt from users where username like '${user}'`)
    return (t[0].salt as string)
}

async function saltChan(name:string) {
    const t:any=await sqlquery(`select salt from channels where name like '${name}'`)
    return (t[0].salt as string)
}

function hash(salt:string,pozitive:string){
    const hashed=createHash("sha256").update(`${salt}${pozitive}`).digest('hex')
    return hashed
}

const alfabet="qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM"
function generateSalt(){
    let ret=""
    for(let i=0;i<10;i++){
        ret+=alfabet.charAt(Math.random()*alfabet.length)
    }
    return ret;
}

 const server=express()

 const log=console.log


 server.use(express.text())
 

server.use(express.static('./public'))

server.get('/chets/:chet',(req,res)=>{
    const chet=req.params.chet
    res.sendFile("index.html",{root:"public"})
})

server.get('/login',(req,res)=>{
	res.sendFile("login.html",{root:"public"})
})

server.get('/signup',(req,res)=>{
	res.sendFile("signup.html",{root:"public"})
})

server.post('/postAccount',(req,res)=>{
	res.end()
})

server.post('/createAccount',(req,res)=>{
    const body=JSON.parse(req.body)
	log(body)
	log("creating account")
    const salt=generateSalt()
    sqlquery(`insert into users(username,salt,password,email) values ('${body.user}','${salt}','${hash(salt,Buffer.from(body.password).toString("base64"))}','${body.email}')`)

	res.send(`<h1>You should receive a message in the email box with a verification link (it will be deleted within 10 mins)</h1>`)
})

server.post('/accountExist',async (req,res)=>{
    try{
    //{username,password}
    const body=JSON.parse(req.body)
    const exist:any=await sqlquery(`select count() as i from users where username like '${body.username}' and password like '${hash(await salt(body.username),body.password)}';`) 
    

	if(exist[0].i){
        res.send('true')
    }else{
        res.send('false')
    }
    }catch(e){
        res.send('false')
    }
})

server.post('/channelExist',async (req,res)=>{
    const body=JSON.parse(req.body)
    const exist:any=await sqlquery(`select count() as i from channels where name like '${body.name}'`)
    if(exist[0].i){
        console.log(`account exist ${body.name}`)
        res.send(true)
    }else{
        console.log(`account doesnt exist ${body.name}`)
        res.send(false)
    }
    
})

server.post('/suggestion',(req,res)=>{
	const exp=JSON.stringify([{locked:true,content:"testForum"},{locked:true,content:"testForums"},{locked:true,content:"testForum1"},{locked:true,content:"testForum2"}])
	log(exp)
	res.send(exp)

})

server.post('/createChannel',async (req,res)=>{
    //{name,password,locked}
    log("channel created")
    const body=JSON.parse(req.body)
    const salt=generateSalt();
    sqlquery(`insert into channels(name,salt,password,locked) values ('${body.name}','${salt}','${hash(salt,body.password)}',${body.locked})`)

})

server.post('/postMessage', async (req,res)=>{
    //{username:username,password:password,channel:channel,channelpassword:channelpassword,message:message}
    const body=JSON.parse(req.body)
    log("message recived")
    log(body)
    const locked:any=await sqlquery(`select locked from channels where name like '${body.channel}'`)
    if(locked[0].locked){
    sqlquery(`insert into messages(authorID,content,channelID) values ((select id from users where username like '${body.username}' and password like '${hash(await salt(body.username),body.password)}'),'${body.message}',(select id from channels where name like '${body.channel}' and password like '${hash(await saltChan(body.channel),body.channelpassword)}' ))`)
    }else{
        sqlquery(`insert into messages(authorID,content,channelID) values ((select id from users where username like '${body.username}' and password like '${hash(await salt(body.username),body.password)}'),'${body.message}',(select id from channels where name like '${body.channel}'))`)
    } 
    res.end()
})

server.get('/serverlocked',async (req,res)=>{
    const locked=await sqlquery(`select locked from channels where name like '${JSON.parse(req.body).channel}'`)[0]
    log(locked)
    res.send(locked)
})

server.get('/serverExist',(req,res)=>{

})

server.post('/profilePic',(req,res)=>{ 
    res.send("/test")
})

server.get('/temp/:link',(req,res)=>{
    const templink=req.params.link
    log(templink)
})

server.post('/chetlog/:chet',async (req,res)=>{
    const chetlink=req.params.chet  
    const body=JSON.parse(req.body)
    log(body) 
    let tobesend
    const locked:any=await sqlquery(`select locked from channels where name like '${body.name}'`) 
    if(body.last==" " || !body.last){  
        if(locked[0].locked){
            tobesend=await sqlquery(`select * from (select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '${body.name}' and password like '${hash(await saltChan(body.name),body.password)}') order by date desc limit ${MESSAGES_AT_ONCE}) order by date asc`)
        }else{
            tobesend=await sqlquery(`select * from (select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '${body.name}') order by date desc limit ${MESSAGES_AT_ONCE}) order by date asc`)
        } 
    }else{  
        if(locked[0].locked){
            tobesend=await sqlquery(`select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '${body.name}' and password like '${hash(await saltChan(body.name),body.password)}') and date > (select datetime('${body.last}','+${TIME_DIFFERENCE} seconds')) order by date limit ${MESSAGES_AT_ONCE}`)
        }else{
            tobesend=await sqlquery(`select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '${body.name}') and date > (select datetime('${body.last}','+${TIME_DIFFERENCE} seconds')) order by date limit ${MESSAGES_AT_ONCE}`)
        } 

    }  
    log("this is being sended")
    log(tobesend)
    res.send(tobesend)

})


server.listen(8080)
