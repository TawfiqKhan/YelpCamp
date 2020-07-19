const Campground   = require("../models/campground"),
	  Comment 	   = require("../models/comment");
	  
const middlewareObj = {}

//function to check the ownership of the campground (i.e if the user has created the camoground)
middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
	    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground ) {
				req.flash("error", "Campground Not Found")
                res.redirect("/campgrounds")
            } else {
				//Does the user own the campground?
				if(foundCampground.author.id.equals(req.user._id)){
					next()
				} else {
                    req.flash('error', 'You don\'t have permission to do that!');
          			res.redirect('/campgrounds/' + req.params.id);
                }
            }
        });
    } else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = (req, res, next)=>{
	//Is the user Logged in?
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err || !foundComment){
				req.flash('error', 'Sorry, that comment does not exist!');
           		res.redirect('/campgrounds');
			} else{
				//Does the User Own the Comment?
				if(foundComment.author.id.equals(req.user._id)){
					next()
				} else{
					req.flash('error', 'You don\'t have permission to do that!');
           			res.redirect('/campgrounds/' + req.params.id);
				}
			}
		})
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

//Function to check if the user is logged in
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!")
	res.redirect("/login")
	
}

module.exports = middlewareObj