"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var database_1 = require("./database");
var crypto_1 = require("crypto");
var MESSAGES_AT_ONCE = 10;
var TIME_DIFFERENCE = 1;
function sqlToJsDate(sqlDate) {
    var datetime = sqlDate.split(" ");
    var date = datetime[0].split("-");
    var time = datetime[1].split(":");
    log(date);
    log(time);
    return new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), parseInt(time[0]), parseInt(time[1]), parseInt(time[2]), 0);
}
function salt(user) {
    return __awaiter(this, void 0, void 0, function () {
        var t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_1.sqlquery)("select salt from users where username like '".concat(user, "'"))];
                case 1:
                    t = _a.sent();
                    return [2 /*return*/, t[0].salt];
            }
        });
    });
}
function saltChan(name) {
    return __awaiter(this, void 0, void 0, function () {
        var t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_1.sqlquery)("select salt from channels where name like '".concat(name, "'"))];
                case 1:
                    t = _a.sent();
                    return [2 /*return*/, t[0].salt];
            }
        });
    });
}
function hash(salt, pozitive) {
    var hashed = (0, crypto_1.createHash)("sha256").update("".concat(salt).concat(pozitive)).digest('hex');
    return hashed;
}
var alfabet = "qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
function generateSalt() {
    var ret = "";
    for (var i = 0; i < 10; i++) {
        ret += alfabet.charAt(Math.random() * alfabet.length);
    }
    return ret;
}
var server = express();
var log = console.log;
server.use(express.text());
server.use(express.static('./public'));
server.get('/chets/:chet', function (req, res) {
    var chet = req.params.chet;
    res.sendFile("index.html", { root: "public" });
});
server.get('/login', function (req, res) {
    res.sendFile("login.html", { root: "public" });
});
server.get('/signup', function (req, res) {
    res.sendFile("signup.html", { root: "public" });
});
server.post('/postAccount', function (req, res) {
    res.end();
});
server.post('/createAccount', function (req, res) {
    var body = JSON.parse(req.body);
    log(body);
    log("creating account");
    var salt = generateSalt();
    (0, database_1.sqlquery)("insert into users(username,salt,password,email) values ('".concat(body.user, "','").concat(salt, "','").concat(hash(salt, Buffer.from(body.password).toString("base64")), "','").concat(body.email, "')"));
    res.send("<h1>You should receive a message in the email box with a verification link (it will be deleted within 10 mins)</h1>");
});
server.post('/accountExist', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, exist, _a, _b, _c, _d, e_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                body = JSON.parse(req.body);
                _a = database_1.sqlquery;
                _c = (_b = "select count() as i from users where username like '".concat(body.username, "' and password like '")).concat;
                _d = hash;
                return [4 /*yield*/, salt(body.username)];
            case 1: return [4 /*yield*/, _a.apply(void 0, [_c.apply(_b, [_d.apply(void 0, [_e.sent(), body.password]), "';"])])];
            case 2:
                exist = _e.sent();
                if (exist[0].i) {
                    res.send('true');
                }
                else {
                    res.send('false');
                }
                return [3 /*break*/, 4];
            case 3:
                e_1 = _e.sent();
                res.send('false');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
server.post('/channelExist', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, exist;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = JSON.parse(req.body);
                return [4 /*yield*/, (0, database_1.sqlquery)("select count() as i from channels where name like '".concat(body.name, "'"))];
            case 1:
                exist = _a.sent();
                if (exist[0].i) {
                    console.log("account exist ".concat(body.name));
                    res.send(true);
                }
                else {
                    console.log("account doesnt exist ".concat(body.name));
                    res.send(false);
                }
                return [2 /*return*/];
        }
    });
}); });
server.post('/suggestion', function (req, res) {
    var exp = JSON.stringify([{ locked: true, content: "testForum" }, { locked: true, content: "testForums" }, { locked: true, content: "testForum1" }, { locked: true, content: "testForum2" }]);
    log(exp);
    res.send(exp);
});
server.post('/createChannel', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, salt;
    return __generator(this, function (_a) {
        //{name,password,locked}
        log("channel created");
        body = JSON.parse(req.body);
        salt = generateSalt();
        (0, database_1.sqlquery)("insert into channels(name,salt,password,locked) values ('".concat(body.name, "','").concat(salt, "','").concat(hash(salt, body.password), "',").concat(body.locked, ")"));
        return [2 /*return*/];
    });
}); });
server.post('/postMessage', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, locked, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                body = JSON.parse(req.body);
                log("message recived");
                log(body);
                return [4 /*yield*/, (0, database_1.sqlquery)("select locked from channels where name like '".concat(body.channel, "'"))];
            case 1:
                locked = _m.sent();
                if (!locked[0].locked) return [3 /*break*/, 4];
                _a = database_1.sqlquery;
                _d = (_c = "insert into messages(authorID,content,channelID) values ((select id from users where username like '".concat(body.username, "' and password like '")).concat;
                _e = hash;
                return [4 /*yield*/, salt(body.username)];
            case 2:
                _f = (_b = _d.apply(_c, [_e.apply(void 0, [_m.sent(), body.password]), "'),'"]).concat(body.message, "',(select id from channels where name like '").concat(body.channel, "' and password like '")).concat;
                _g = hash;
                return [4 /*yield*/, saltChan(body.channel)];
            case 3:
                _a.apply(void 0, [_f.apply(_b, [_g.apply(void 0, [_m.sent(), body.channelpassword]), "' ))"])]);
                return [3 /*break*/, 6];
            case 4:
                _h = database_1.sqlquery;
                _k = (_j = "insert into messages(authorID,content,channelID) values ((select id from users where username like '".concat(body.username, "' and password like '")).concat;
                _l = hash;
                return [4 /*yield*/, salt(body.username)];
            case 5:
                _h.apply(void 0, [_k.apply(_j, [_l.apply(void 0, [_m.sent(), body.password]), "'),'"]).concat(body.message, "',(select id from channels where name like '").concat(body.channel, "'))")]);
                _m.label = 6;
            case 6:
                res.end();
                return [2 /*return*/];
        }
    });
}); });
server.get('/serverlocked', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var locked;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, database_1.sqlquery)("select locked from channels where name like '".concat(JSON.parse(req.body).channel, "'"))[0]];
            case 1:
                locked = _a.sent();
                log(locked);
                res.send(locked);
                return [2 /*return*/];
        }
    });
}); });
server.get('/serverExist', function (req, res) {
});
server.post('/profilePic', function (req, res) {
    res.send("/test");
});
server.get('/temp/:link', function (req, res) {
    var templink = req.params.link;
    log(templink);
});
server.post('/chetlog/:chet', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var chetlink, body, tobesend, locked, _a, _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                chetlink = req.params.chet;
                body = JSON.parse(req.body);
                log(body);
                return [4 /*yield*/, (0, database_1.sqlquery)("select locked from channels where name like '".concat(body.name, "'"))];
            case 1:
                locked = _j.sent();
                if (!(body.last == " " || !body.last)) return [3 /*break*/, 7];
                if (!locked[0].locked) return [3 /*break*/, 4];
                _a = database_1.sqlquery;
                _c = (_b = "select * from (select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '".concat(body.name, "' and password like '")).concat;
                _d = hash;
                return [4 /*yield*/, saltChan(body.name)];
            case 2: return [4 /*yield*/, _a.apply(void 0, [_c.apply(_b, [_d.apply(void 0, [_j.sent(), body.password]), "') order by date desc limit "]).concat(MESSAGES_AT_ONCE, ") order by date asc")])];
            case 3:
                tobesend = _j.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, (0, database_1.sqlquery)("select * from (select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '".concat(body.name, "') order by date desc limit ").concat(MESSAGES_AT_ONCE, ") order by date asc"))];
            case 5:
                tobesend = _j.sent();
                _j.label = 6;
            case 6: return [3 /*break*/, 12];
            case 7:
                if (!locked[0].locked) return [3 /*break*/, 10];
                _e = database_1.sqlquery;
                _g = (_f = "select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '".concat(body.name, "' and password like '")).concat;
                _h = hash;
                return [4 /*yield*/, saltChan(body.name)];
            case 8: return [4 /*yield*/, _e.apply(void 0, [_g.apply(_f, [_h.apply(void 0, [_j.sent(), body.password]), "') and date > (select datetime('"]).concat(body.last, "','+").concat(TIME_DIFFERENCE, " seconds')) order by date limit ").concat(MESSAGES_AT_ONCE)])];
            case 9:
                tobesend = _j.sent();
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, (0, database_1.sqlquery)("select content,date,(select username from users where id=authorID) as 'author',(select profile from users where id=authorID) as 'profilepic' from messages where channelID=(select id from channels where name like '".concat(body.name, "') and date > (select datetime('").concat(body.last, "','+").concat(TIME_DIFFERENCE, " seconds')) order by date limit ").concat(MESSAGES_AT_ONCE))];
            case 11:
                tobesend = _j.sent();
                _j.label = 12;
            case 12:
                log("this is being sended");
                log(tobesend);
                res.send(tobesend);
                return [2 /*return*/];
        }
    });
}); });
server.listen(8080);
