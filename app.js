const express    			 = require("express"),
	  app         			 = express(),
	  bodyParser 			 = require("body-parser"),
	  mongoose				 =	require("mongoose"),
	  passport   			 = require("passport"),
	  LocalStrategy			 = require("passport-local"),
	  passportLocalMongoose  = require("passport-local-mongoose"),
	  methodOverride		 = require("method-override"),
	  Campground 			 = require("./models/campground"),
	  Comment 	 			 = require("./models/comment"),
	  User					 = require("./models/user"),
	  flash			 		 = require("connect-flash"),
	  port					 = 3000;

const campgroundRoutes = require("./routes/campgrounds"),
	  commentRoutes    = require("./routes/comments"),
	  indexRoutes	   = require("./routes/index")

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
var mongoFix = { useNewUrlParser: true, useUnifiedTopology: true }; //fixing mongoose warning
mongoose.connect(url, mongoFix);


app.use(bodyParser.urlencoded({extended:true}));

// this makes us not use .ejs with the file name
app.set('view engine', 'ejs');
//adding public directory access to the project
app.use(express.static(__dirname +"/public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret:"Blue is the color",
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Passing req.user to all the pages
app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);


//appending the string before the routes
// app.use("/", indexRoutes);
// app.use("campgrounds", campgroundRoutes);
// app.use("campgrounds/:id/comments", commentRoutes);

// app.listen(3000, function() {
// 	console.log('Server listening on port 3000')
// })

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});

