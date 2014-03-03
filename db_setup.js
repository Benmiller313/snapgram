var User = require('./models/user'),
	Photo = require('./models/photo'),
	Subscription = require('./models/subscription'),
	Feed = require('./models/feed');



var models = [User, Photo, Subscription, Feed];

function createModel(model, then){
	model.dropTable(function(err){
		if (err){
			console.log(err);
		}
		model.createTable(function(err){
			if (err){
				console.log('Could not create table ' + model.name);
				console.log(err);
				process.exit(1);
			}
			console.log(model.name + " Table Created");
			then();
		})
	});
}

var count = 0;
for (i=0; i<models.length; i++){
	createModel(models[i], function(){
		count ++;
		if (count == models.length){
			console.log('Schema Initialized.');
		}
	});
}