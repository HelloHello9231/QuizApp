const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz.js");
const Item = require("../models/Item.js");
const CQuiz = require("../models/CQuiz.js");
const User = require("../models/User.js");

router.get("/home",async (req,res) =>
{
  let topPlayers = await User.find().sort({Points: "descending"}).limit(10);
  let topCommunityQuizzes = await CQuiz.find().sort({AmountPlayed: "descending"}).limit(10);

  res.render("main/Home",{topPlayers,topCommunityQuizzes});
})

router.get("/quizSearch",(req,res) =>
{
  res.render("main/QuizSearch",{Categories: req.user.CategoriesUnlocked});
})

router.get("/store",async (req,res) =>
{
  let items = await Item.find();

  res.render("main/Shop",{Items: items,CategoriesUnlocked: req.user.CategoriesUnlocked,Coins: req.user.Coins});
})

router.get("/Community",async (req,res) =>
{
  let cQuizzes = await CQuiz.find().sort({AmountPlayed: "descending"});

  res.render("main/Community",{Quizzes: cQuizzes});
})

router.get("/Creator",(req,res) =>
{
  if(req.user.CQuizSlots === req.user.CQuizzes.length)
  {
    return res.render("main/Creator",{error: "You don't have enough slots to make a quiz,please buy a slot or delete and existing quiz"});
  }

  res.render("main/Creator");
})

router.post("/getQuizzes",(req,res) =>
{
  //determine if user has acess to the quiz category
  if(determineAcessToCategory(req.user,req.body.categoryID))
  {
    //find quizzes via the category and send them

    getQuizzesViaCategoryID(req.body.categoryID)
    .then(data =>
      {
        res.json({quizzes: data,completedQuizzes: req.user.CompletedQuizzes});
      })
  }
  else
  {
    res.json({error: "nothing could be found"});
  }
})

function determineAcessToCategory(user,id)
{
  for(let i = 0; i < user.CategoriesUnlocked.length; i++)
  {
    if(user.CategoriesUnlocked[i].CategoryID == id) return true;
  }

  return false;
}


async function getQuizzesViaCategoryID(id)
{
  try
  {
    let quizzes = await Quiz.find({CategoryID: id});

    return quizzes;
  }
  catch
  {
    return null;
  }
}


module.exports = router;
