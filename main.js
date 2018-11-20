
var express = require('express')
var app = express()

var ejs = require('ejs')
/* */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/*데이터 베이스 연결 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://onedoll3:onedoll3@ds223343.mlab.com:23343/onedoll2', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("DB와 연결 양호");
});
/*모델값들 정리(게시판)*/
var Notice = require('./models/notice');
var Class = require('./models/class');
var Free = require('./models/free');
var User = require('./models/user');
var Anonymous = require('./models/anonymous');

/*로그인 유지 */
var session = require('express-session')
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'tired',
  resave: false,
  saveUninitialized: true,
}));
//
app.set('views', __dirname + '/public');

/*
 메인 홈페이지 
*/
app.get('/', function (req, res) {
  res.render("welcome.ejs", { user: req.session.user })
})
//----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------

/*공지사항 보이기 & 작성 */
app.get('/notice', function (req, res) {
  Notice.find({}, function (err, results) {
    if (err) throw err;
    res.render('notice.ejs', { boards: results, user: req.session.user });
  });
})
app.post('/notice', function (req, res) {
  var board = new Notice({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/welcome');
  //맨처음 홈페이지로 보내버린다.
});
app.get('/writing_notice', function (req, res) {
  res.render("writing_notice.ejs", { user:req.session.user});
})
app.post('/writing_notice', function (req, res) {
  var board = new Notice({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/notice');
  //맨처음 홈페이지로 보내버린다.
});
//----------------------------------------------------------------------------------------
// 로그인
app.get('/login', function (req, res) {
  res.render('login.ejs')
})
app.post('/login', function (req, res) {
  User.findOne({ id: req.body.id }, function (err, user) {
    if (!user) {
      console.log('wrong id!')
      res.redirect('/login')
    }
    else {
      if (!user.validateHash(req.body.pw)) {
        console.log('wrong pw!')
        res.redirect('/login')
      } else {
        req.session.user = user.id;
        res.redirect('/')

      }
    }
  })
})
//로그아웃
app.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/')
  })
})
// 회원가입
app.get('/signUp', function (req, res) {
  if (!req.session.user) {
    res.render('signUp.ejs')
  }
  else {
    res.redirect('/')
  }
})
app.post('/signUp', function (req, res) {
  User.find({ id: req.body.id }, function (err, user) {

    if (err) throw err;
    if (user.length > 0) {

    } else {
      var user = new User({
        id: req.body.id,
        pw: req.body.pw
      })
      user.pw = user.generateHash(user.pw);
      user.save(function (err) {
        if (err) throw err;
        res.redirect('/')
      })
    }
  })
})

/*수업게시판 & 작성*/
app.get('/class_list', function (req, res) {
  Class.find({}, function (err, results) {
    if (err) throw err;
    res.render('class_list.ejs', { boards: results, user: req.session.user });
  });
})
app.post('/class', function (req, res) {
  var board = new Class({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('welcome');
  //맨처음 홈페이지로 보내버린다.
});
app.get('/writing_class', function (req, res) {
  res.render("writing_class.ejs", { user:req.session.user});
})
app.post('/writing_class', function (req, res) {
  var board = new Class({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/class_list');
});
//----------------------------------------------------------------------------------------
/*자유게시판 & 작성*/
app.get('/free_list', function (req, res) {
  Free.find({}, function (err, results) {
    if (err) throw err;
    res.render('free_list.ejs', { boards: results, user: req.session.user });
  });
})
app.post('/free', function (req, res) {
  var board = new Free({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/');
});
app.get('/writing_free', function (req, res) {
  res.render("writing_free.ejs", { user:req.session.user});
})
app.post('/writing_free', function (req, res) {
  var board = new Free({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/class_free');
});
// ----------------------------------------------------------------------------------------
/*마음의소리 & 작성*/
app.get('/anonymous', function (req, res) {
  Anonymous.find({}, function (err, results) {
    if (err) throw err;
    res.render('anonymous.ejs', { boards: results, user: req.session.user });
  });
})
app.post('/anonymous', function (req, res) {
  var board = new Anonymous({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/');
});
app.get('/writing_anony', function (req, res) {
  res.render("writing_anony.ejs");
})
app.post('/writing_anony', function (req, res) {
  var board = new Anonymous({
    title: req.body.title,
    author: req.session.user,
    content: req.body.content,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString()
  });
  board.save(function (err) {
    if (err) return console.error(err);

  });
  res.redirect('/anonymous');
});


///// 팝업 //////
app.get('/popup_notice', function (req, res) {
  res.render('popup_notice.ejs');
})
app.get('/popup_class', function (req, res) {
  res.render('popup_class.ejs');
})
app.get('/popup_free', function (req, res) {
  res.render('popup_free.ejs');
})
app.get('/popup_anony', function (req, res) {
  res.render('popup_anony.ejs');
})

//수정
app.get('/rewrite_notice/:id', function (req, res) {
  Notice.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite_notice.ejs', {result: boards, user:req.session.user });
  })
});

app.post('/rewrite_notice/:id', function (req, res) {
  Notice.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show_notice/' + board._id);
    });
  });
});
app.get('/rewrite_class/:id', function (req, res) {
  Class.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite_class.ejs', {result: boards, user:req.session.user });
  })
});

app.post('/rewrite_class/:id', function (req, res) {
  Class.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show_class_list/' + board._id);
    });
  });
});
app.get('/rewrite_free/:id', function (req, res) {
  Free.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite_free.ejs', {result: boards, user:req.session.user });
  })
});

app.post('/rewrite_free/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show_free_list/' + board._id);
    });
  });
});
app.get('/rewrite_anony/:id', function (req, res) {
  Anonymous.findOne({_id: req.params.id}, function (err, boards) {
    res.render('rewrite_anony.ejs', {result: boards, user:req.session.user });
  })
});

app.post('/rewrite_anony/:id', function (req, res) {
  Anonymous.findOne({ _id: req.params.id }, function (err, board) {
    board.title = req.body.inputTitle;
    board.content = req.body.inputContent;
    board.created_at = new Date().toISOString();
    board.save(function (err) {
      res.redirect('/show_anony/' + board._id);
    });
  });
});
// ----------------------------------------------------------------------------------------
/*각각 show*/
app.get('/show_anony/:id', function (req, res) {
  Anonymous.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('show_anony.ejs', { result: boards,user: req.session.user  });
    })
  })
})

app.get('/show_free_list/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('show_free_list.ejs', { result: boards,user: req.session.user  });
    })
  })
})
app.get('/show_class_list/:id', function (req, res) {
  Class.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('show_class_list.ejs', { result: boards,user: req.session.user  });
    })
  })
})
app.get('/show_notice/:id', function (req, res) {
  Notice.findOne({ _id: req.params.id }, function (err, boards) {
    boards.hits++
    boards.save(function (err) {
      res.render('show_notice.ejs', { result: boards, user: req.session.user });
    })
  })
})
//좋아요
app.post('/notice_like/:id', function (req, res) {
  Notice.findOne({ _id: req.params.id }, function (err, boards) {
    boards.like++
    boards.hits--;
    boards.save(function (err) {
      res.redirect('/show_notice/' + req.params.id);
    })
  })
})
app.post('/class_like/:id', function (req, res) {
  Class.findOne({ _id: req.params.id }, function (err, boards) {
    boards.like++
    boards.hits--;
    boards.save(function (err) {
      res.redirect('/show_class_list/' + req.params.id);
    })
  })
})
app.post('/free_like/:id', function (req, res) {
  Free.findOne({ _id: req.params.id }, function (err, boards) {
    boards.like++
    boards.hits--;
    boards.save(function (err) {
      res.redirect('/show_free_list/' + req.params.id);
    })
  })
})
app.post('/anony_like/:id', function (req, res) {
  Anonymous.findOne({ _id: req.params.id }, function (err, boards) {
    boards.like++
    boards.hits--;
    boards.save(function (err) {
      res.redirect('/show_anony/' + req.params.id);
    })
  })
})
//삭제
app.post("/destroy_notice/:id", function(req,res){
  Notice.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/notice');
  })
})
app.post("/destroy_class/:id", function(req,res){
  Class.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/class_list');
  })
})
app.post("/destroy_free/:id", function(req,res){
  Free.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/free_list');
  })
})
app.post("/destroy_anony/:id", function(req,res){
  Anonymous.deleteOne({_id: req.params.id}, function(err){
    res.redirect('/anonymous');
  })
})
// app.get("/*", function (req, res) {
//   res.render("nofind.ejs");
// })
// ----------------------------------------------------------------------------------------
app.listen(3000);




// /*ㅇㅇㅇ */
// app.get('/list', function (req, res) {
//   Board.find({}, function (err, results) {
//     if (err) throw err;
//     res.render('list.ejs', { boards: results, user:req.session.user });
//   });
// });







//   })
// });
// app.post("/destroy/:id", function(req,res){
//   Board.deleteOne({_id: req.params.id}, function(err){
//     res.redirect('/');
//   })
// })


// app.get('/rewrite/:id', function (req, res) {
//   Board.findOne({_id: req.params.id}, function (err, boards) {
//     res.render('rewrite.ejs', {result: boards });
//   })
// });

// app.post('/rewrite/:id', function (req, res) {
//   Board.findOne({ _id: req.params.id }, function (err, board) {
//     board.title = req.body.inputTitle;
//     board.content = req.body.inputContent;
//     board.created_at = new Date().toISOString();
//     board.save(function (err) {
//       res.redirect('/show/' + board._id);
//     });
//   });
// });

// app.get('/signUp', function (req, res) {
//   if(!req.session.user){
//     res.render('signUp.ejs')
//   }
//   else{
//     res.redirect('/list')
//   }

// })
// app.get('/login', function(req, res){
//   res.render('login.ejs')
// })
// app.post('/login', function(req, res){
//   User.findOne({id:req.body.id}, function(err, user){
//     if(!user){
//       console.log('wrong id!')
//       res.redirect('/login')
//     }
//     else{
//       if(!user.validateHash(req.body.pw)){
//         console.log('wrong pw!')
//         res.redirect('/login')
//       }else{
//         req.session.user = user.id;
//         res.redirect('/list')

//       }
//     }
//   })
// })
// app.post('/signUp', function(req, res){
//   User.find({id:req.body.id}, function(err, user){

//     if(err) throw err;
//     if(user.length > 0){

//     }else{
//       var user = new User({
//         id: req.body.id,
//         pw: req.body.pw
//       })
//       user.pw = user.generateHash(user.pw);
//       user.save(function(err){
//         if(err) throw err;
//         res.redirect('/')
//       })
//     }
//   })
// })

