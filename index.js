const express = require("express");
const mysql = require('mysql2');
const app = express();
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const { v4: uuidv4 } = require('uuid');
app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.urlencoded({extended:true}));

const connection = mysql.createConnection({
  host : 'localhost',
  user:'root',
  database: 'BlogDB',
  password:'Password' //Enter your MySQL password
});
//show route (Home)
app.get("/",(req,res)=>{
  let q = `SELECT * FROM posts`;
  try{
    connection.query(q,(err,users)=>{
      if(err)throw err
      res.render("home.ejs",{users});
    });
  }catch (err){
    res.send("some error in DB");
  }
});

//register route (Add new accout) 

app.get("/register",(req,res)=>{
  res.render("signup.ejs");
});

app.post("/register",(req,res)=>{
  let id = uuidv4();
  let {username,email,password} = req.body;
  let q = `INSERT INTO user (id,username,email,password)VALUES (?,?,?,?)`;
  let data = [`${id}`,`${username}`,`${email}`,`${password}`];
  try{
    connection.query(q,data,(err,result)=>{
    if(err)throw err;
    console.log(result);
    res.redirect("/");
    });
  } catch (err){
      res.send("some error in DB");
    }
});

//login route

app.get("/signin/:key/:id",(req,res)=>{
  let {key,id} = req.params;
  res.render("directlogin.ejs",{key,id});
});

app.post("/signin/:key/:id",(req,res)=>{
  let {key,id} = req.params;
  let {email,password}= req.body;
  let q = `SELECT * FROM user WHERE email ='${email}'AND password='${password}'`;
  try{
    connection.query(q,(err1,result)=>{
      let user = result[0];
      if(err1)throw err1;
      try{
        //email and password verification
        if((`${user.email}` == `${email}`) && (`${user.password}` == `${password}`)){

          if(key == "create" && id == "1234"){
          res.render("create.ejs",{user});}

          else if(key == "edit" || key == "delete"){
            try{
              let q2 =  `SELECT * FROM posts WHERE user_id = '${user.id}'`;
              connection.query(q2,(err2,result)=>{
              if(err2)throw err2;
              let postuser = result[0];
              if(user.id != id){
                res.send("Changes can be made only by owner account!")}
              else if(postuser == undefined){
                res.send("Post data is empty.Create your 1st blog");}
              else{
                if (key =="edit") res.render("edit.ejs",{postuser});
                else if (key =="delete") res.render("delete.ejs",{postuser});
              }
              });
            }catch (err2){
            res.send("some error in DB err2");
            }
          }
        }else if(Error)throw error;
      }catch(error){res.send("WRONG EMAIL OR PASSWORD");}
    });
  }catch(err1){
    res.send("some error in DB err1");
  }
});

//create route
app.post("/create/:id",(req,res)=>{
  let {id:user_id} = req.params; 
  let {bloghead,blogcon} = req.body;
  let postid= uuidv4();
  let q = `INSERT INTO posts (id,content,heading,user_id) VALUES (?,?,?,?)`;
  let data = [`${postid}`,`${blogcon}`,`${bloghead}`,`${user_id}`];
  try{
    connection.query(q,data,(err,result)=>{
    if(err)throw err;
      res.redirect("/");
    });
  }catch (err){
    res.send("some error in DB");
  }
});

//edit route
app.patch("/edit/:id",(req,res)=>{
  let {id} = req.params;
  let {head,cont}= req.body;
  let q = `UPDATE posts SET heading = '${head}',content = '${cont}' WHERE id = '${id}'`;
  try{
    connection.query(q,(err,result)=>{
    if(err)throw err;
        res.redirect("/");
    });
  }catch(err){
    res.send("some error in DB");
  }
});

//delete route
app.delete("/delete/:id",(req,res)=>{
  let {id} = req.params;
  let q2 = `DELETE FROM posts WHERE id = '${id}'`;
  try{
        connection.query(q2,(err,user)=>{
        if(err)throw err
            res.redirect("/");
        });
      } catch (err){
        res.send("some error in DB");
      }   
});
app.listen("8080",()=>{
  console.log("server listening to port 8080");
});