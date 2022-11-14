const sqlite=require('sqlite3').verbose()
const log=console.log

const db=new sqlite.Database('./base.db')

function createDatabases(){
const users=`create table users (
	id integer primary key autoincrement,
	username text not null,
	password text not null,
	salt text not null,
	email text not null,
	profile text not null default "/default.png",
	date datetime default CURRENT_TIMESTAMP
);
`

const messages=`
	create table messages (
	id integer primary key autoincrement,
	authorID integer not null,
	content text not null,
	channelID integer not null,
	date datetime default CURRENT_TIMESTAMP
	)
`

const channels=`
		create table channels (
			id integer primary key autoincrement,
			password text ,
			locked BOOLEAN NOT NULL,
			name text not null,
			salt text not null,
			date datetime default CURRENT_TIMESTAMP
		)

`


sqlquery(users)
sqlquery(messages)
sqlquery(channels)

}

createDatabases()


async function sqlquery(sql){
    let ret
    await new Promise(e=>{  
    db.all(sql,(err,rows)=>{
		if(err){log(err)}
        ret=rows
        e()
    })
    })

    return ret
}

 

module.exports={
	sqlquery
}