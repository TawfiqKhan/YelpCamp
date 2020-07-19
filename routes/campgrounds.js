const express      = require("express"),
	  router       = express.Router(),
	  Campground   = require("../models/campground"),
	  middleware   = require("../middleware/index"), 
	  //"../middleware" is basically same as"../middleware/index", it is because
	  // index.js is a special file and by requring the folder it will automatically
	  // require the index.js file
	  Comment 	   = require("../models/comment");


//=============
//CAMPGROUND ROUTES
//==============

//Show all Campgrounds
router.get('/campgrounds', (req, res)=> {
	
	//Get all campgrounds from database
	Campground.find({}, function(err, allCampgrounds) {
		if(err) {
			console.log(err)
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds})
		}
	})
})

// Create a new CampGround
router.post('/campgrounds', middleware.isLoggedIn, (req, res)=> {
	var name = req.body.campTitle;
	var price = req.body.campPrice;
	var image = req.body.campImage;
	var description = req.body.campDescription;
	//adding author to the new campground
	var author = {
		id: req.user._id,
		username: req.user.username	
	}
	var newCamp = {name: name, price:price, image: image, description: description, author: author};
	// campgrounds.push(newCamp);
	Campground.create(newCamp, (err, newCampground)=> {
		if(err) {
			console.log(err);
		} else {
			req.flash("success", "You have successfully added the cammpground!")
			res.redirect("campgrounds");
		}
	})
})

//Show form to create a new CampGround, to use short router, use '/new' 
//the string campgrounds will be appeneded from app.js

router.get('/campgrounds/new', middleware.isLoggedIn, (req, res)=> {
	res.render("campgrounds/new");
})

// Show more info about a CampGround
router.get('/campgrounds/:id',(req, res)=> {
	
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
		if(err || !foundCampground) {
			req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
	
})

//Edit Campground Route
router.get("/campgrounds/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res)=> {
        Campground.findById(req.params.id, (err, foundCampground) => {
				res.render("campgrounds/edit", {campground: foundCampground})
        });
});
//Update Campground
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	//find and update correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err){
			res.redirect("/campgrounds")
		}else{
			//redirect to show page
			res.redirect("/campgrounds/"+ req.params.id);
		}
	})
})

//Delete Campground
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndDelete(req.params.id, (err, deletedCampground)=>{
		if(err){
			res.redirect("/campgrounds");
		} 
		Comment.deleteMany( {_id: { $in: deletedCampground.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
	})
})

module.exports = router;
