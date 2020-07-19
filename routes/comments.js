const express      = require("express"),
	  router       = express.Router(),
	  //router     = express.Router({mergeParams:true}), This is incase we use short router
	  Campground   = require("../models/campground"),
	  middleware   = require("../middleware/index"), 
	  Comment 	   = require("../models/comment");

//=============
//COMMENTS ROUTES
//==============

router.get('/campgrounds/:id/comments/new', middleware.isLoggedIn, (req, res)=>{
	Campground.findById(req.params.id, (err, campground)=> {
		if(err){
			console.log(err)
		}else {
			res.render("comments/new", {campground: campground})
		}
	})
})

router.post('/campgrounds/:id/comments', middleware.isLoggedIn,(req, res)=> {
	Campground.findById(req.params.id, (err, campground)=> {
		if(err) {
			console.log(err)
			res.redirect("/campgrounds")
		} else {
			Comment.create(req.body.comment, (err, comment)=> {
				if(err) {
					req.flash("error", "Something Went Wrong, Please Try Again.")
					console.log(err)
				}else {
					// Add Username and Id to comments
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully Added Comment.")
					res.redirect('/campgrounds/'+ campground._id)
				}
			})
		}
	})
})

//Edit Comment Form
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res)=>{
	
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground){
			req.flash("error", "No Campground Found!")
			res.redirect('/campgrounds/');
		}
			
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
		res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
		})
    });

})

//Update foundComment
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, foundComment)=>{
		if(err){
			res.redirect("back")
		}
		res.redirect("/campgrounds/"+ req.params.id);
	})
})

//Delete Comment

router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
	Comment.findByIdAndDelete(req.params.comment_id, (err)=>{
		if(err){
			res.redirect("back")
		} else{
			req.flash("success", "Comment has been Deleted")
			res.redirect("/campgrounds/"+ req.params.id);
		}
	})
})


module.exports = router;