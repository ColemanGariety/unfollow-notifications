function ask(question, callback) {
  var stdin = process.stdin
    , stdout = process.stdout

  stdin.resume();
  stdout.write(question + ": ");

  stdin.once('data', function(data) {
    data = data.toString().trim();

    callback(data)
  });
}

function filter (collection, iterator) {
  if (Array.isArray(collection)) {
    var newCollection = new Array()
    for (var i = 0; i < collection.length; i++) iterator(collection[i]) && newCollection.push(collection[i])
  } else {
    var newCollection = new Object()
    for (var i in collection) if (iterator(collection[i])) newCollection[i] = collection[i]
  }
    
  return newCollection
}

function contains (obj, target) {
  if (obj == null) return false
  return obj.indexOf(target) != -1
}

ask("Your Twitter handle", function(res){
  var bird = res
    , followers = []
    , Twitter = require('twit')
    , twitter = new Twitter(require('./config.json'))

  function poll () {
    twitter.get('followers/ids', function (err, res) {
      if (err) throw err
      
      var unfollowers = filter(followers, function (follower) {
            return !contains(res.ids, follower)
          })
        , i = unfollowers.length
        , message = "You've been unfollowed by"
      
      if (i) {
        while (i--) {
          twitter.get('users/show', { user_id: unfollowers[i] }, function (err, unfollower) {
            if (err) throw err
            if (unfollowers.length)
            message += (" @" + unfollower.screen_name)
            
            if (i < 0) {
              message += "."
              
              twitter.post('direct_messages/new', { screen_name: bird, text: message }, function (err, res) {
                if (err) throw err
                
                console.log("Sent unfollow notification")
              })
            } else {
              message += ","
            }
          })
        }
      }
      
      followers = res.ids
    })
  }
  
  poll()
  setInterval(poll, 30000)
  
  console.log("Okay, " + res + ", your savior (the son of god) will let you know when someone unfollows you!")
})
