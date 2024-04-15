  /********************************************************************************
  *  WEB322 – Assignment 05
  * 
  *  I declare that this assignment is my own work in accordance with Seneca's
  *  Academic Integrity Policy:
  * 
  *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
  * 
  *  Name: Joao Santiago Student ID: 126567221 Date: 14/04/2024
  *
  *  Published URL: https://calm-rose-lemming-shoe.cyclic.app/
  ********************************************************************************
  ********************************************************************************/
  const legoData = require('./modules/legoSets');
  const path = require('path');

  const express = require('express');
  const app = express();

  const HTTP_PORT = process.env.PORT || 5500;

  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: true }));

  app.set('view engine', 'ejs');

  // app.use((req, res, next) => {
  //   res.locals.page = req.path;
  //   next();
  // });

  app.get('/', (req, res) => {
    res.render("home", {page: '/'});
  });

  app.get('/about', (req, res) => {
    res.render("about", {page: '/about'});
  });

  app.get("/lego/addSet", async (req, res) => {
    let themes = await legoData.getAllThemes()
    res.render("addSet", { themes: themes })
  });

  app.post("/lego/addSet", async (req, res) => {
    try {
      await legoData.addSet(req.body);
      res.redirect("/lego/sets");
    } catch (err) {
      res.render("500", { page: '/lego/addSet', message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get("/lego/editSet/:num", async (req, res) => {

    try {
      let set = await legoData.getSetByNum(req.params.num);
      let themes = await legoData.getAllThemes();

      res.render("editSet", { set, themes });
    } catch (err) {
      res.status(404).render("404", { message: err });
    }

  });

  app.post("/lego/editSet", async (req, res) => {

    try {
      await legoData.editSet(req.body.set_num, req.body);
      res.redirect("/lego/sets");
    } catch (err) {
      res.render("500", { page: '/lego/editSet', message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
      await legoData.deleteSet(req.params.num);
      res.redirect("/lego/sets");
    } catch (err) {
      res.status(500).render("500", { page: '/lego/deleteSet', message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  })

  app.get("/lego/sets", async (req,res) => {
    const theme = req.query.theme;
    try {
      let sets;
      if (theme) {
        sets = await legoData.getSetsByTheme(theme);
      } else {
        sets = await legoData.getAllSets();
      }
      if (sets.length === 0) {
        res.status(404).render("404", {page: req.path, message: "No sets found for the matching theme"});
      } else {
        res.render("sets", {page: '/lego/sets', sets: sets});
      }
    } catch(err){
      res.status(404).render("404", {page: req.path, message: "An error occurred while fetching the sets"});
    }
  });

  app.get("/lego/sets/:num", async (req,res) => {
    const legoNum = req.params.num;
    try {
      let set = await legoData.getSetByNum(legoNum);
      if (!set) {
        res.status(404).render("404", {page: req.path, message: "No set found for the specified set number"});
      } else {
        res.render("set", {set: set});
      }
    } catch(err) {
      res.status(404).render("404", {page: req.path, message: "An error occurred while fetching the set"});
    }
  });

  app.use((req, res, next) => {
    res.status(404).render("404", {page: req.path, message: "I'm sorry, we're unable to find what you're looking for, my bro/sis"});
  });

  legoData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
  });